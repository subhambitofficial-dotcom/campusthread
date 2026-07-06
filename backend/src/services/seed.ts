import bcrypt from 'bcryptjs';
import { db } from './db';

const seed = async () => {
  console.log('🌱 Starting database seeding process...');

  try {
    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('password123', salt);
    const hashedStudentPassword = await bcrypt.hash('password123', salt);

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
    } else {
      adminId = existingAdmin.id || existingAdmin._id;
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
    } else {
      studentId = existingStudent.id || existingStudent._id;
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

    // 3. Clear existing collections
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

    const existingReels = await db.reels.find();
    for (const reel of existingReels) {
      await db.reels.findByIdAndDelete(reel.id || reel._id);
    }
    console.log('🧹 Cleared all reels.');

    // 4. Seed Clubs
    const byteClub = await db.clubs.create({
      id: 'club_byteclub',
      name: 'ByteClub Coding Society',
      slug: 'byteclub',
      tagline: 'The premier software development and hacking collective',
      logo: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&q=80',
      banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
      description: 'ByteClub is the official computer science club. We organize hackathons, coding workshops, and contribute to open-source software.',
      achievements: ['Won Hackathon 2025', 'Built Campus Management App'],
      socialLinks: { instagram: 'https://instagram.com', github: 'https://github.com' },
      team: [
        { name: 'Dr. Jane Smith', role: 'Faculty Advisor', photo: '' },
        { name: 'Liam Foster', role: 'President', photo: '' }
      ]
    });

    const verveClub = await db.clubs.create({
      id: 'club_verve',
      name: 'Verve Dance & Music Club',
      slug: 'verve',
      tagline: 'Unleashing rhythm, beats, and artistic expression',
      logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
      description: 'Verve is the largest cultural club on campus, hosting annual concerts, jam sessions, and professional choreography training.',
      achievements: ['Best Cultural Club 2025', 'State Dance Trophy'],
      socialLinks: { instagram: 'https://instagram.com' },
      team: [
        { name: 'Dr. Mark Lee', role: 'Faculty Advisor', photo: '' },
        { name: 'Mia Chang', role: 'President', photo: '' }
      ]
    });
    console.log('✅ Seeded default clubs.');

    // 5. Seed Events
    await db.events.create({
      id: 'event_hacksprint',
      title: 'HackSprint 2026',
      slug: 'hacksprint-2026',
      clubId: byteClub.id,
      tagline: 'Build. Launch. Break. Repeat.',
      description: 'A 36-hour intense hackathon where student teams design and build innovative solutions to real-world campus problems.',
      date: '2026-10-15T09:00:00.000Z',
      location: 'Main Tech Auditorium',
      poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      sections: [
        { type: 'hero', enabled: true },
        { type: 'schedule', enabled: true },
        { type: 'registration', enabled: true }
      ],
      themeConfig: {
        preset: 'cyber',
        colors: { primary: '#00f0ff', secondary: '#ff007f', background: '#0a0a0c' }
      },
      registrationForm: [
        { label: 'Full Name', type: 'text', required: true },
        { label: 'College ID', type: 'text', required: true },
        { label: 'WhatsApp Number', type: 'text', required: true }
      ],
      sponsors: [],
      updates: [],
      subEvents: [],
      gallery: [],
      status: 'published'
    });
    console.log('✅ Seeded default events.');

    // 6. Seed Merch
    await db.merchProducts.create({
      id: 'merch_cybertee',
      title: 'ByteClub Cyber Tee',
      description: 'Oversized heavy cotton tee with premium back cyber print.',
      price: 699,
      category: 'oversized-tees',
      stock: 45,
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
      variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Charcoal Black', 'Off-White'] },
      countdownDropDate: null
    });
    console.log('✅ Seeded default merch products.');

    // 7. Seed Reels
    await db.reels.create({
      id: 'reel_coding',
      title: 'Late night coding vibes at ByteClub lab 💻✨',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-keyboard-keys-being-pressed-in-dark-48766-large.mp4',
      clubId: byteClub.id,
      postedBy: 'Alex Rivera',
      likes: []
    });

    await db.reels.create({
      id: 'reel_dance',
      title: 'Choreography rehearsals for Verve Spring Concert! 🕺🔥',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-dancing-in-front-of-a-neon-wall-42177-large.mp4',
      clubId: verveClub.id,
      postedBy: 'Alex Rivera',
      likes: []
    });

    await db.reels.create({
      id: 'reel_neon',
      title: 'Cyberpunk neon aesthetics setup inside the admin block ⚡💡',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-a-glass-42171-large.mp4',
      clubId: null,
      postedBy: 'Super Admin',
      likes: []
    });
    console.log('✅ Seeded default Reels.');

    // 8. Seed Notifications
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

if (require.main === module) {
  const { connectDB } = require('./db');
  const dotenv = require('dotenv');
  dotenv.config();
  connectDB().then(() => seed());
}

export default seed;
