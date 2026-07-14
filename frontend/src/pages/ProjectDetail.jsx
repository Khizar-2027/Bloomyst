import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import BoardColumn from "../components/BoardColumn";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function ProjectDetail() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function loadTasks() {
    try {
      const data = await getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError("Could not load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createTask(projectId, newTitle, newPriority);
      setNewTitle("");
      setNewPriority("medium");
      loadTasks();
    } catch (err) {
      setError("Could not create task");
    }
  }

  async function handleDelete(taskId) {
    try {
      await deleteTask(projectId, taskId);
      loadTasks();
    } catch (err) {
      setError("Could not delete task");
    }
  }

  async function handlePriorityChange(taskId, newPriority) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)));
    try {
      await updateTask(projectId, taskId, { priority: newPriority });
    } catch (err) {
      setError("Could not update priority");
      loadTasks();
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    const newStatus = targetColumn ? targetColumn.id : tasks.find((t) => t.id === over.id)?.status;
    if (!task || !newStatus || task.status === newStatus) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTask(projectId, taskId, { status: newStatus });
    } catch (err) {
      setError("Could not move task");
      loadTasks();
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-8">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Workspaces
        </Link>
        <h2 className="text-lg font-semibold text-slate-700 mt-4 mb-4">Board</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={tasks.filter((t) => t.status === col.id)}
                onDelete={handleDelete}
                onPriorityChange={handlePriorityChange}
              />
            ))}
          </div>
        </DndContext>

        <form onSubmit={handleCreate} className="flex gap-2 mt-8">
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProjectDetail;