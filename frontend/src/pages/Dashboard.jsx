function Dashboard() {
  const token = localStorage.getItem("token");

  return (
    <div>
      <h2>Dashboard</h2>
      <p>You're logged in.</p>
      <p style={{ fontSize: "10px", wordBreak: "break-all" }}>Token: {token}</p>
    </div>
  );
}

export default Dashboard;