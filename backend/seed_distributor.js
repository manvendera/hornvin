const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedDistributor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const phoneNumber = '+919876543210'; // Example number
    const existing = await User.findOne({ phoneNumber });

    if (existing) {
      console.log('Distributor user already exists with number:', phoneNumber);
      process.exit(0);
    }

    await User.create({
      name: 'Hornvin Distributor',
      phoneNumber: phoneNumber,
      password: 'password123', // required by schema
      role: 'distributor',
      businessName: 'Hornvin Logistics South',
      approvalStatus: 'approved',
      isPhoneVerified: true
    });

    console.log('Successfully created distributor user!');
    console.log('Phone Number:', phoneNumber);
    console.log('OTP (Dev Mode): 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding distributor:', error.message);
    process.exit(1);
  }
};

seedDistributor();
