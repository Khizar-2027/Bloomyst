import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

function BoardColumn({ id, title, tasks, onDelete, onPriorityChange }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "12px",
        width: "280px",
        minHeight: "400px",
      }}
    >
      <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "#475569" }}>
        {title} <span style={{ color: "#94a3b8" }}>({tasks.length})</span>
      </h3>
      <div ref={setNodeRef}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={onDelete} onPriorityChange={onPriorityChange} />
            ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default BoardColumn;