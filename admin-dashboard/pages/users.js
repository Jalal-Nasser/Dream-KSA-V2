import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error) setUsers(data);
    };
    loadUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Users</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr><th>ID</th><th>Username</th><th>Email</th><th>Coins</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.coins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}