import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { acceptInvite } from "../api/invites";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    handleAccept();
  }, []);

  async function handleAccept() {
    const loggedIn = localStorage.getItem("token");
    if (!loggedIn) {
      // Not logged in — send them to login, then bring them back here after
      navigate(`/login?redirect=/invites/${token}/accept`);
      return;
    }

    try {
      const data = await acceptInvite(token);
      setStatus("success");
      setTimeout(() => navigate(`/workspaces/${data.workspace_id}`), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.detail || "Could not accept invite");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-sm">
        {status === "loading" && <p className="text-slate-500">Accepting invite...</p>}
        {status === "success" && (
          <p className="text-green-600">Invite accepted! Redirecting...</p>
        )}
        {status === "error" && (
          <>
            <p className="text-red-500 mb-4">{message}</p>
            <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default AcceptInvite;