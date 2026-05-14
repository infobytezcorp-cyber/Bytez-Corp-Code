// import axios from 'axios';

// const API_URL = process.env.API_URL || 'http://localhost:8000';

// const telecallers = [
//   {
//     name: 'Kamali',
//     mobile: '+919876543210',
//     aadhaar: '111122223333',
//     dept: 'calls',
//     service: 'Telecalling',
//     role: 'Telecaller',
//     doj: '2026-05-01',
//     address: 'Coimbatore',
//   },
//   {
//     name: 'Nivee',
//     mobile: '+919812345678',
//     aadhaar: '222233334444',
//     dept: 'calls',
//     service: 'Telecalling',
//     role: 'Telecaller',
//     doj: '2026-05-02',
//     address: 'Coimbatore',
//   },
//   {
//     name: 'Dom',
//     mobile: '+919799887766',
//     aadhaar: '333344445555',
//     dept: 'calls',
//     service: 'Telecalling',
//     role: 'Telecaller',
//     doj: '2026-05-03',
//     address: 'Coimbatore',
//   }
// ];

// async function run() {
//   try {
//     for (const t of telecallers) {
//       const res = await axios.post(`${API_URL}/api/hr`, t);
//       console.log('Created:', res.data.id || res.data._id, '-', res.data.name);
//     }
//     console.log('Seeding completed.');
//   } catch (err) {
//     console.error('Error seeding telecallers:', err.response ? err.response.data : err.message);
//   }
// }

// run();
