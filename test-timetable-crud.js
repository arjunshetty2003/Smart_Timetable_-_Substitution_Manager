const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test credentials
const adminEmail = 'admin@university.edu';
const adminPassword = 'admin123';

let authToken = '';
let testTimetableId = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });
    authToken = response.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

async function getClasses() {
  try {
    const response = await axios.get(`${API_URL}/classes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.data[0]; // Get first class
  } catch (error) {
    console.error('❌ Failed to get classes:', error.response?.data?.message || error.message);
    return null;
  }
}

async function getSubjects() {
  try {
    const response = await axios.get(`${API_URL}/subjects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.data[0]; // Get first subject
  } catch (error) {
    console.error('❌ Failed to get subjects:', error.response?.data?.message || error.message);
    return null;
  }
}

async function createTimetable(classData, subjectData) {
  try {
    console.log('📅 Creating test timetable...');
    const timetableData = {
      classId: classData._id,
      subjectId: subjectData._id,
      facultyId: classData.facultyId._id,
      day: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      room: 'A102'
    };

    const response = await axios.post(`${API_URL}/timetables`, timetableData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Timetable created successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create timetable:', error.response?.data?.message || error.message);
    return null;
  }
}

async function getTimetables() {
  try {
    console.log('📋 Fetching timetables...');
    const response = await axios.get(`${API_URL}/timetables`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`📊 Found ${response.data.count} timetables`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to get timetables:', error.response?.data?.message || error.message);
    return [];
  }
}

async function deleteTimetable(timetableId) {
  try {
    console.log(`🗑️ Deleting timetable: ${timetableId}`);
    const response = await axios.delete(`${API_URL}/timetables/${timetableId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Timetable deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete timetable:', error.response?.data?.message || error.message);
    return null;
  }
}

async function runTest() {
  console.log('🚀 Starting Timetable CRUD Test\n');

  // Step 1: Login
  await login();

  // Step 2: Get classes and subjects
  const classData = await getClasses();
  const subjectData = await getSubjects();

  if (!classData || !subjectData) {
    console.error('❌ Required data not found');
    return;
  }

  // Step 3: Check initial timetable count
  let timetables = await getTimetables();
  const initialCount = timetables.length;
  console.log(`📊 Initial timetable count: ${initialCount}\n`);

  // Step 4: Create a test timetable
  const newTimetable = await createTimetable(classData, subjectData);
  if (!newTimetable) return;

  // Step 5: Verify timetable was created
  timetables = await getTimetables();
  console.log(`📊 Timetable count after creation: ${timetables.length}`);
  
  if (timetables.length !== initialCount + 1) {
    console.error('❌ Timetable creation verification failed');
    return;
  }

  // Step 6: Get the created timetable's composite ID
  const createdTimetable = timetables.find(t => t.room === 'A102');
  if (!createdTimetable) {
    console.error('❌ Could not find created timetable');
    return;
  }

  console.log(`🎯 Found created timetable with ID: ${createdTimetable._id}\n`);

  // Step 7: Delete the timetable
  await deleteTimetable(createdTimetable._id);

  // Step 8: Verify timetable was deleted
  timetables = await getTimetables();
  console.log(`📊 Timetable count after deletion: ${timetables.length}`);

  if (timetables.length === initialCount) {
    console.log('✅ SUCCESS: Timetable CRUD operations working correctly!');
  } else {
    console.error('❌ FAILURE: Timetable deletion verification failed');
  }
}

// Run the test
runTest().catch(console.error); 