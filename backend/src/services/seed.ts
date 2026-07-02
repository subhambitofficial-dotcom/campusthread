import bcrypt from 'bcryptjs';
import { db } from './db';

const seed = async () => {
  console.log('🌱 Starting database seeding process...');

  try {
    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('password123', salt);
    const hashedStudentPassword = await bcrypt.hash('password123', salt);

    // Clear existing users for seeding (optional, but since we are seeding brand new, we just append or initialize)
    const existingAdmin = await db.users.findOne({ email: 'admin@campusthread.edu' });
    let adminId = 'u_admin1';
    if (!existingAdmin) {
      const admin = await db.users.create({
        id: 'u_admin1',
        email: 'admin@campusthread.edu',
        password: hashedAdminPassword,
        name: 'Alex Rivera',
        role: 'Super Admin'
      });
      adminId = admin.id;
      console.log('✅ Admin user created (admin@campusthread.edu / password123)');
    }

    const existingStudent = await db.users.findOne({ email: 'student@campusthread.edu' });
    let studentId = 'u_student1';
    if (!existingStudent) {
      const student = await db.users.create({
        id: 'u_student1',
        email: 'student@campusthread.edu',
        password: hashedStudentPassword,
        name: 'Jordan Finch',
        role: 'Student User'
      });
      studentId = student.id;
      console.log('✅ Student user created (student@campusthread.edu / password123)');
    }

    // 2. Create Student Profile
    const existingProfile = await db.studentProfiles.findOne({ studentId });
    if (!existingProfile) {
      await db.studentProfiles.create({
        studentId,
        name: 'Jordan Finch',
        badges: ['Freshman Pioneer', 'Culture Explorer'],
        certificates: [
          {
            id: 'cert_hack123',
            eventName: 'HackSprint 2026',
            issuedBy: 'ByteClub Coding Society',
            issueDate: '2026-05-15',
            secureHash: 'CT-A89E-77B2'
          }
        ],
        attendedEvents: ['HackSprint 2026'],
        clubMemberships: ['ByteClub']
      });
      console.log('✅ Student profile seeded.');
    }

    // 3. Clear existing clubs, events, merch products, orders, registrations
    const clubs = await db.clubs.find();
    for (const c of clubs) {
      await db.clubs.findByIdAndDelete(c.id || c._id);
    }
    console.log('🧹 Cleared all clubs.');

    const events = await db.events.find();
    for (const e of events) {
      await db.events.findByIdAndDelete(e.id || e._id);
    }
    console.log('🧹 Cleared all events.');

    const merch = await db.merchProducts.find();
    for (const m of merch) {
      await db.merchProducts.findByIdAndDelete(m.id || m._id);
    }
    console.log('🧹 Cleared all merch products.');

    const orders = await db.merchOrders.find();
    for (const o of orders) {
      await db.merchOrders.findByIdAndDelete(o.id || o._id);
    }
    console.log('🧹 Cleared all merch orders.');

    const regs = await db.registrations.find();
    for (const r of regs) {
      await db.registrations.findByIdAndDelete(r.id || r._id);
    }
    console.log('🧹 Cleared all registrations.');

    // 4. Seed Notifications (only welcome notification)
    const existingNotif = await db.notifications.find();
    for (const n of existingNotif) {
      await db.notifications.findByIdAndDelete(n.id || n._id);
    }
    await db.notifications.create({
      id: 'welcome',
      title: 'Welcome to CampusThread',
      content: 'Experience the digital layer of modern campus culture. Explore clubs, customize event microsites, and secure limited drops.',
      type: 'general',
      targetId: 'welcome'
    });
    console.log('✅ Welcome Notification seeded.');

    console.log('🎉 Seeding successfully completed without errors.');
  } catch (err) {
    console.error('❌ Seeding failed with exception:', err);
  }
};

// Execute if run directly
if (require.main === module) {
  const { connectDB } = require('./db');
  const dotenv = require('dotenv');
  dotenv.config();
  connectDB().then(() => seed());
}

export default seed;
