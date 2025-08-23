import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*');
    if (!error) setRooms(data);
  };

  const loadParticipants = async (roomId) => {
    // This would need to be implemented based on your actual database schema
    // For now, using mock data
    const mockParticipants = [
      { id: '1', user_id: 'user1', display_name: 'User 1', mic: 'granted' },
      { id: '2', user_id: 'user2', display_name: 'User 2', mic: 'requested' },
      { id: '3', user_id: 'user3', display_name: 'User 3', mic: 'none' },
    ];
    setParticipants(mockParticipants);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    loadParticipants(room.id);
  };

  const handleMicAction = async (participantId, action) => {
    // This would call your Supabase Edge Function to update mic permissions
    console.log(`${action} mic for participant ${participantId}`);
    
    // Update local state
    setParticipants(prev => prev.map(p => 
      p.id === participantId 
        ? { ...p, mic: action === 'grant' ? 'granted' : 'none' }
        : p
    ));
  };

  const grantedCount = participants.filter(p => p.mic === 'granted').length;
  const micSlots = `${grantedCount}/2 mic slots used`;

  return (
    <div style={{ padding: 20 }}>
      <h1>Room Management</h1>
      
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Room List */}
        <div style={{ flex: 1 }}>
          <h2>Rooms</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            {rooms.map(room => (
              <div 
                key={room.id} 
                style={{ 
                  padding: 12, 
                  border: selectedRoom?.id === room.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  backgroundColor: selectedRoom?.id === room.id ? '#eff6ff' : 'white'
                }}
                onClick={() => handleRoomSelect(room)}
              >
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <small>Host: {room.host_id}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Participant Management */}
        {selectedRoom && (
          <div style={{ flex: 1 }}>
            <h2>Participants - {selectedRoom.name}</h2>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>{micSlots}</p>
            
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
              {participants.map(participant => (
                <div 
                  key={participant.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: 12,
                    borderBottom: '1px solid #f3f4f6',
                    marginBottom: 8
                  }}
                >
                  <div>
                    <strong>{participant.display_name}</strong>
                    <br />
                    <small style={{ color: '#6b7280' }}>
                      Mic: {participant.mic === 'granted' ? '✅ Granted' : 
                             participant.mic === 'requested' ? '⏳ Requested' : '❌ None'}
                    </small>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    {participant.mic === 'requested' && (
                      <button
                        onClick={() => handleMicAction(participant.id, 'grant')}
                        disabled={grantedCount >= 2}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: grantedCount >= 2 ? '#9ca3af' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: grantedCount >= 2 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Grant
                      </button>
                    )}
                    
                    {participant.mic === 'granted' && (
                      <button
                        onClick={() => handleMicAction(participant.id, 'revoke')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



