import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      loadWorkspaces();
    } catch (err) {
      setError("Could not create workspace");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) return <p className="p-8 text-slate-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Bloomyst</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Log out
          </button>
        </div>

        <h2 className="text-lg font-semibold text-slate-700 mb-4">Your Workspaces</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-2 mb-6">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              to={`/workspaces/${ws.id}`}
              className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition"
            >
              <span className="font-medium text-slate-800">{ws.name}</span>{" "}
              <span className="text-slate-400 text-sm">({ws.slug})</span>
            </Link>
          ))}
          {workspaces.length === 0 && (
            <p className="text-slate-400 text-sm">You don't belong to any workspaces yet.</p>
          )}
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="New workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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

export default Dashboard;