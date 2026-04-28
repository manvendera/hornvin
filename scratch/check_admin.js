const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });
const User = require('../backend/models/User');

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const admin = await User.findOne({ email: 'admin@hornvin.com', role: 'admin' });
    if (admin) {
      console.log('Found admin@hornvin.com:', admin.email);
    } else {
      console.log('Admin admin@hornvin.com NOT found.');
    }

    const admin2 = await User.findOne({ email: 'admin@horvin.com', role: 'admin' });
    if (admin2) {
      console.log('Found admin@horvin.com:', admin2.email);
    } else {
      console.log('Admin admin@horvin.com NOT found.');
    }

    // List all admins
    const admins = await User.find({ role: 'admin' });
    console.log('All Admins:', admins.map(a => a.email));

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();
