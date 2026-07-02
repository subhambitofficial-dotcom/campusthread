import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET: /api/events (Get all active campus events and live feeds)
router.get('/', async (req: any, res: Response) => {
  const { status, clubId } = req.query;
  const filter: any = {};
  
  if (status) filter.status = status;
  if (clubId) filter.clubId = clubId;

  try {
    const events = await db.events.find(filter);
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve event list.' });
  }
});

// GET: /api/events/:slug (Get single event details and custom microsite configs)
router.get('/:slug', async (req: any, res: Response) => {
  const { slug } = req.params;
  try {
    const event = await db.events.findOne({ slug });
    if (!event) {
      return res.status(404).json({ error: 'Event microsite not found.' });
    }
    
    // Fetch club profile that created this event
    const club = await db.clubs.findOne({ id: event.clubId });

    return res.json({ event, club });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve event details.' });
  }
});

// POST: /api/events (Create dynamic event microsite - Admins only)
router.post('/', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager'), async (req: AuthenticatedRequest, res: Response) => {
  const { 
    title, tagline, description, date, location, poster,
    sections, themeConfig, registrationForm, sponsors, merchIds, clubId, subEvents
  } = req.body;

  if (!title || !description || !date || !clubId) {
    return res.status(400).json({ error: 'Please supply a title, description, date and launching club.' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const existing = await db.events.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

    // Create the visual microsite instantly
    const newEvent = await db.events.create({
      title,
      slug: finalSlug,
      clubId,
      tagline: tagline || 'An immersive campus gathering',
      description,
      date,
      location: location || 'Campus Main Auditorium',
      poster: poster || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      sections: sections || [
        { type: 'hero', enabled: true },
        { type: 'schedule', enabled: true },
        { type: 'faq', enabled: true }
      ],
      themeConfig: themeConfig || {
        preset: 'cyber', // Default cyber styling
        colors: { primary: '#00f0ff', secondary: '#ff007f', background: '#0a0a0c' }
      },
      registrationForm: registrationForm || [
        { label: 'Full Name', type: 'text', required: true },
        { label: 'College ID', type: 'text', required: true },
        { label: 'WhatsApp Number', type: 'text', required: true }
      ],
      sponsors: sponsors || [],
      merchIds: merchIds || [],
      subEvents: subEvents || [],
      updates: [],
      gallery: [],
      status: 'published' // Auto-publish on creation
    });

    // Notify other students of new event drop
    await db.notifications.create({
      title: 'New Event Launched!',
      content: `"${title}" has been launched by your campus club. View details and register now!`,
      type: 'event',
      targetId: newEvent.slug
    });

    return res.status(201).json(newEvent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to visually launch dynamic event.' });
  }
});

// POST: /api/events/:id/register (Submit custom registration & trigger simulation billing)
router.post('/:id/register', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { formData, paymentDetails } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });

  try {
    const event = await db.events.findOne({ id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Capture registration
    const registration = await db.registrations.create({
      eventId: event.id || event._id,
      studentId: req.user.id,
      formData: formData || {},
      paymentId: paymentDetails?.razorpay_payment_id || 'free_rsvp',
      paymentStatus: paymentDetails?.success ? 'completed' : 'pending',
      certificateIssued: false
    });

    // Update Student Profile
    const profile = await db.studentProfiles.findOne({ studentId: req.user.id });
    if (profile) {
      const updatedAttended = [...(profile.attendedEvents || [])];
      if (!updatedAttended.includes(event.title)) {
        updatedAttended.push(event.title);
      }
      await db.studentProfiles.findByIdAndUpdate(profile.id, {
        attendedEvents: updatedAttended
      });
    }

    return res.status(201).json({
      message: 'Successfully registered for event!',
      registration
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process event entry.' });
  }
});

// PUT: /api/events/:id/updates (Create event announcement/news update)
router.post('/:id/updates', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Announcement title and content are required.' });
  }

  try {
    const event = await db.events.findOne({ id });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const currentUpdates = event.updates || [];
    currentUpdates.unshift({
      title,
      content,
      timestamp: new Date().toISOString()
    });

    const updatedEvent = await db.events.findByIdAndUpdate(id, { updates: currentUpdates });

    return res.json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to drop announcement.' });
  }
});

export default router;
