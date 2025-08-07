// Test script for API endpoints
const testAPI = async () => {
  try {
    console.log('🧪 Testing create room API...');
    
    // Test create room
    const createResponse = await fetch('http://localhost:3001/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Room' }),
    });
    
    console.log('Create room status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Create room response:', createData);
    
    if (createData.id) {
      // Test get token
      console.log('🧪 Testing get token API...');
      const tokenResponse = await fetch('http://localhost:3001/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test-user',
          room_id: createData.id,
          role: 'listener',
          user_name: 'Test User'
        }),
      });
      
      console.log('Get token status:', tokenResponse.status);
      const tokenData = await tokenResponse.json();
      console.log('Get token response:', tokenData);
    }
    
  } catch (error) {
    console.error('API test error:', error);
  }
};

testAPI();
