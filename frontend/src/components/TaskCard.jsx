import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_COLORS = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#ef4444",
};

function TaskCard({ task, onDelete, onPriorityChange, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ ...style, touchAction: "none" }}
      className="bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm cursor-grab active:cursor-grabbing"
      onClick={() => onOpen(task)}
    >
      <div className="flex justify-between items-start">
        <strong className="text-sm text-slate-800">{task.title}</strong>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-slate-400 hover:text-red-500 text-xs"
        >
          ✕
        </button>
      </div>

      <select
        value={task.priority}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onPriorityChange(task.id, e.target.value)}
        className="mt-2 text-xs px-2 py-0.5 rounded border border-slate-200"
        style={{ color: PRIORITY_COLORS[task.priority] }}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

export default TaskCard;