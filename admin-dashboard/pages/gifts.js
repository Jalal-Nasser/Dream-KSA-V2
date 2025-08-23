import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Gifts() {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    const loadGifts = async () => {
      const { data, error } = await supabase.from('gifts').select('*');
      if (!error) setGifts(data);
    };
    loadGifts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Gifts</h1>
      <table border="1" cellPadding="5">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Cost</th></tr>
        </thead>
        <tbody>
          {gifts.map(g => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.name}</td>
              <td>{g.coin_cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}