export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Voice Chat Admin Dashboard</h1>
      <ul>
        <li><a href="/users">Manage Users</a></li>
        <li><a href="/rooms">Manage Rooms</a></li>
        <li><a href="/gifts">Manage Gifts</a></li>
      </ul>
    </div>
  );
}