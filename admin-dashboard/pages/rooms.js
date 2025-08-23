import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      const { data, error } = await supabase.from('rooms').select('*');
      if (!error) setRooms(data);
    };
    loadRooms();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Rooms</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Description</th><th>Host ID</th></tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.description}</td>
              <td>{r.host_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}