import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

function BoardColumn({ id, title, tasks, onDelete, onPriorityChange, onCreate, onOpen }) {
  const { setNodeRef } = useDroppable({ id });
  const [adding, setAdding] = useState(false);
  const [title_, setTitleValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title_.trim()) return;
    onCreate(title_, id); // id = this column's status
    setTitleValue("");
    setAdding(false);
  }

  return (
    <div className="bg-slate-100 rounded-lg p-3 w-72 min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-slate-600">
          {title} <span className="text-slate-400">({tasks.length})</span>
        </h3>
        <button
          onClick={() => setAdding((prev) => !prev)}
          className="text-slate-400 hover:text-blue-600 text-lg leading-none"
          title="Add task"
        >
          +
        </button>
      </div>

      {adding && (
        <form onSubmit={handleSubmit} className="mb-3">
          <input
            autoFocus
            type="text"
            placeholder="Task title..."
            value={title_}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={() => !title_ && setAdding(false)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      )}

      <div ref={setNodeRef} className="flex-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onPriorityChange={onPriorityChange}
            onOpen={onOpen}
          />
        ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default BoardColumn;