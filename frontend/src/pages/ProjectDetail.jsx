import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import TaskModal from "../components/TaskModal";
import BoardColumn from "../components/BoardColumn";

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function ProjectDetail() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [openTask, setOpenTask] = useState(null);
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

  async function handleCreateTask(title, status) {
    try {
      await createTask(projectId, title, "medium", status);
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
              onCreate={handleCreateTask}
              onOpen={setOpenTask}
            />
            ))}
          </div>
        </DndContext>
      </div>
        {openTask && (
          <TaskModal
            task={openTask}
            onClose={() => setOpenTask(null)}
            onDelete={handleDelete}
          />
        )}
    </div>
  );
}

export default ProjectDetail;