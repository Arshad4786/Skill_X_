const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// 1. Load your environment variables
dotenv.config();

// 2. Import your User model (Adjust path if necessary)
// Based on your previous chats, it's in the models folder
const User = require('./models/User');

const NEW_PASSWORD = 'admin1'; // <--- CHANGE THIS
const ADMIN_EMAIL = 'admin@skillx.com'; // <--- CHANGE THIS

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    // 3. Find the user
    const user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      console.error('Error: Admin user not found with that email.');
      process.exit(1);
    }

    // 4. Hash the new password
    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // 5. Update and Save
    user.password = hashedPassword;
    await user.save();

    console.log('--------------------------------------------------');
    console.log('SUCCESS: Password updated successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`New Password: ${NEW_PASSWORD}`);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Error resetting password:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

resetPassword();