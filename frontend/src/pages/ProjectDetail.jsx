import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

function ProjectDetail() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function handleStatusChange(taskId, newStatus) {
    try {
      await updateTask(projectId, taskId, { status: newStatus });
      loadTasks();
    } catch (err) {
      setError("Could not update task");
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Workspaces</Link>
      <h2>Tasks</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "8px" }}>
            <strong>{task.title}</strong> — {task.priority}{" "}
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
            >
              <option value="todo">{STATUS_LABELS.todo}</option>
              <option value="in_progress">{STATUS_LABELS.in_progress}</option>
              <option value="done">{STATUS_LABELS.done}</option>
            </select>{" "}
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && <p>No tasks yet.</p>}

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
}

export default ProjectDetail;