import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkspaces, createWorkspace } from "../api/workspaces";

function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError("Could not load workspaces");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createWorkspace(newName);
      setNewName("");
      loadWorkspaces(); // refresh the list
    } catch (err) {
      setError("Could not create workspace");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={handleLogout} style={{ float: "right" }}>
        Log out
      </button>
      <h2>Your Workspaces</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {workspaces.map((ws) => (
          <li key={ws.id}>
            {ws.name} <span style={{ color: "gray" }}>({ws.slug})</span>
          </li>
        ))}
      </ul>

      {workspaces.length === 0 && <p>You don't belong to any workspaces yet.</p>}

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
}

export default Dashboard;