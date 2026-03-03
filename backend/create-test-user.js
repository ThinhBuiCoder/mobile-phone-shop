import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.connection.close();
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    await user.save();
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();