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
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
      },
    })
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

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);

    // over.id is either a column id (todo/in_progress/done) or another task's id
    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    const newStatus = targetColumn ? targetColumn.id : tasks.find((t) => t.id === over.id)?.status;

    if (!task || !newStatus || task.status === newStatus) return;

    // Optimistic update — update UI immediately, before the server confirms
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(projectId, taskId, { status: newStatus });
    } catch (err) {
      setError("Could not move task");
      loadTasks(); // revert to real server state if it failed
    }
  }

  async function handlePriorityChange(taskId, newPriority) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    try {
      await updateTask(projectId, taskId, { priority: newPriority });
    } catch (err) {
      setError("Could not update priority");
      loadTasks();
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/dashboard">&larr; Back to Workspaces</Link>
      <h2>Board</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
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

      <form onSubmit={handleCreate} style={{ marginTop: "24px" }}>
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