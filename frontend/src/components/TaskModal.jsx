import { useState, useEffect, useRef } from "react";
import { getAttachments, uploadAttachment, deleteAttachment } from "../api/attachments";

function TaskModal({ task, onClose, onDelete }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAttachments();
  }, [task.id]);

  async function loadAttachments() {
    try {
      const data = await getAttachments(task.id);
      setAttachments(data);
    } catch (err) {
      setError("Could not load attachments");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAttachment(task.id, file);
      loadAttachments();
    } catch (err) {
      setError("Could not upload file");
    }
    e.target.value = ""; // reset so the same file can be re-selected if needed
  }

  async function handleDeleteAttachment(attachmentId) {
    try {
      await deleteAttachment(task.id, attachmentId);
      loadAttachments();
    } catch (err) {
      setError("Could not delete attachment");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-slate-800">{task.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Status: <span className="font-medium">{task.status}</span> · Priority:{" "}
          <span className="font-medium">{task.priority}</span>
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-slate-700">Attachments</h3>
            <button
              onClick={() => fileInputRef.current.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="space-y-1">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center bg-slate-50 rounded px-3 py-2 text-sm"
                >
                  
                    <a href={`http://localhost:8000${a.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {a.filename}
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(a.id)}
                    className="text-slate-400 hover:text-red-500 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {attachments.length === 0 && (
                <p className="text-sm text-slate-400">No attachments yet.</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            onDelete(task.id);
            onClose();
          }}
          className="mt-6 text-sm text-red-500 hover:underline"
        >
          Delete this task
        </button>
      </div>
    </div>
  );
}

export default TaskModal;