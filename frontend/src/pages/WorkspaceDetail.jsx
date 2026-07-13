import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjects, createProject } from "../api/projects";

function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, [workspaceId]);

  async function loadProjects() {
    try {
      const data = await getProjects(workspaceId);
      setProjects(data);
    } catch (err) {
      setError("Could not load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createProject(workspaceId, newName, newDescription);
      setNewName("");
      setNewDescription("");
      loadProjects();
    } catch (err) {
      setError("Could not create project");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Workspaces</Link>
      <h2>Projects</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link>
            {p.description && <span style={{ color: "gray" }}> — {p.description}</span>}
          </li>
        ))}
      </ul>

      {projects.length === 0 && <p>No projects yet.</p>}

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Project name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
}

export default WorkspaceDetail;