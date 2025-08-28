import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../src/models/admin.model';
import { MONGO_URI } from '../src/config/env';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this should be set via environment variable
      name: 'Admin User'
    });

    // Hash password (this will be done by the pre-save hook)
    await admin.save();
    
    console.log('Admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Change this password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
