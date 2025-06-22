import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

async function createAdmin() {
    try {
        await mongoose.connect('mongodb://localhost:27017/orderDB');
        console.log('Connected to MongoDB');

        // Clear any existing admin
        await Admin.deleteMany({});

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const admin = new Admin({
            username: 'admin',
            password: hashedPassword
        });

        await admin.save();
        console.log('Admin created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createAdmin();