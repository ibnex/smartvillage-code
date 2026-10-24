
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'ibnex54@gmail.com';
    const newPassword = 'MyNewPassword123!';

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    console.log('Password reset successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

resetPassword();
