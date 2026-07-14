import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_COLORS = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#ef4444",
};

function TaskCard({ task, onDelete, onPriorityChange }) {
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
      style={{
        ...style,
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "8px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        {/* Only this ⠿ handle is draggable — the rest of the card behaves normally */}
        <span
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", padding: "0 6px 0 0", color: "#cbd5e1" }}
          title="Drag to move"
        >
          ⠿
        </span>
        <strong style={{ fontSize: "14px", flex: 1 }}>{task.title}</strong>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          ✕
        </button>
      </div>

      <select
        value={task.priority}
        onChange={(e) => onPriorityChange(task.id, e.target.value)}
        style={{
          marginTop: "6px",
          fontSize: "11px",
          padding: "2px 6px",
          borderRadius: "4px",
          border: "1px solid #e2e8f0",
          color: PRIORITY_COLORS[task.priority],
        }}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

export default TaskCard;