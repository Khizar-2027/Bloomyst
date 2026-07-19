from tests.conftest import register_and_login


def test_creator_becomes_owner(client):
    headers = register_and_login(client, "owner@example.com")

    response = client.post("/workspaces/", json={"name": "Test Workspace"}, headers=headers)
    assert response.status_code == 201
    workspace_id = response.json()["id"]

    response = client.get("/workspaces/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_non_member_cannot_see_workspace_projects(client):
    owner_headers = register_and_login(client, "owner@example.com")
    outsider_headers = register_and_login(client, "outsider@example.com")

    workspace = client.post(
        "/workspaces/", json={"name": "Private Workspace"}, headers=owner_headers
    ).json()

    response = client.get(
        f"/workspaces/{workspace['id']}/projects/", headers=outsider_headers
    )
    assert response.status_code == 403


def test_member_cannot_send_invites(client):
    owner_headers = register_and_login(client, "owner@example.com")
    member_headers = register_and_login(client, "member@example.com")

    workspace = client.post(
        "/workspaces/", json={"name": "Test Workspace"}, headers=owner_headers
    ).json()

    # Owner invites the member in as a regular "member" role
    invite = client.post(
        f"/workspaces/{workspace['id']}/invites/",
        json={"email": "member@example.com", "role": "member"},
        headers=owner_headers,
    ).json()

    response = client.post(
        f"/workspaces/{workspace['id']}/invites/",
        json={"email": "someone-else@example.com", "role": "member"},
        headers=member_headers,
    )
    assert response.status_code == 403


def test_owner_can_send_invites(client):
    owner_headers = register_and_login(client, "owner@example.com")

    workspace = client.post(
        "/workspaces/", json={"name": "Test Workspace"}, headers=owner_headers
    ).json()

    response = client.post(
        f"/workspaces/{workspace['id']}/invites/",
        json={"email": "newperson@example.com", "role": "member"},
        headers=owner_headers,
    )
    assert response.status_code == 201


def test_member_role_cannot_invite_after_joining(client, db_session):
    owner_headers = register_and_login(client, "owner@example.com")
    member_headers = register_and_login(client, "member@example.com")

    workspace = client.post(
        "/workspaces/", json={"name": "Test Workspace"}, headers=owner_headers
    ).json()

    client.post(
        f"/workspaces/{workspace['id']}/invites/",
        json={"email": "member@example.com", "role": "member"},
        headers=owner_headers,
    )

    from app.workspaces.models import Invite
    invite = db_session.query(Invite).filter(Invite.email == "member@example.com").first()

    accept_response = client.post(f"/invites/{invite.token}/accept", headers=member_headers)
    assert accept_response.status_code == 200

    response = client.post(
        f"/workspaces/{workspace['id']}/invites/",
        json={"email": "another@example.com", "role": "member"},
        headers=member_headers,
    )
    assert response.status_code == 403
