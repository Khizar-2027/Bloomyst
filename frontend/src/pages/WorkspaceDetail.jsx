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

  if (loading) return <p className="p-8 text-slate-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Workspaces
        </Link>
        <h2 className="text-lg font-semibold text-slate-700 mt-4 mb-4">Projects</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-2 mb-6">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition"
            >
              <span className="font-medium text-slate-800">{p.name}</span>
              {p.description && (
                <span className="text-slate-400 text-sm"> — {p.description}</span>
              )}
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-slate-400 text-sm">No projects yet.</p>
          )}
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkspaceDetail;