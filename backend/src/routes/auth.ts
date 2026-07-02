import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campusthread_secret_key_1337';

// POST: /api/auth/register
router.post('/register', async (req: any, res: Response) => {
  let { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please enter all required fields.' });
  }

  email = email.trim().toLowerCase();

  try {
    // Check if user already exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.users.create({
      email,
      name,
      password: hashedPassword,
      role: role || 'Student User'
    });

    // Create a student profile if registering as a Student User
    if ((role || 'Student User') === 'Student User') {
      await db.studentProfiles.create({
        studentId: newUser.id,
        name: newUser.name,
        badges: ['Freshman Badge'],
        certificates: [],
        attendedEvents: [],
        clubMemberships: []
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

// POST: /api/auth/login
router.post('/login', async (req: any, res: Response) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  email = email.trim().toLowerCase();

  try {
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server authentication failed.' });
  }
});

// GET: /api/auth/me (Protected)
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
    
    const user = await db.users.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User profiles not found.' });
    }

    // Fetch related student profile data if they are a student
    let profileData = null;
    if (user.role === 'Student User') {
      profileData = await db.studentProfiles.findOne({ studentId: user.id });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      profile: profileData
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

export default router;
