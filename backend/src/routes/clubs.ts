import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET: /api/clubs (Get all active campus clubs)
router.get('/', async (req: any, res: Response) => {
  try {
    const clubs = await db.clubs.find();
    return res.json(clubs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve clubs list.' });
  }
});

// GET: /api/clubs/:slug (Get single club by URL slug)
router.get('/:slug', async (req: any, res: Response) => {
  const { slug } = req.params;
  try {
    const club = await db.clubs.findOne({ slug });
    if (!club) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    // Get all events associated with this club
    const clubEvents = await db.events.find({ clubId: club.id });

    return res.json({ club, events: clubEvents });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve club profile details.' });
  }
});

// POST: /api/clubs (Create new club - Super Admin only)
router.post('/', authenticateToken, authorizeRoles('Super Admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, tagline, logo, banner, description, achievements, socialLinks, team } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Please supply a name and description.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const existing = await db.clubs.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'A club with a very similar name already exists.' });
    }

    const newClub = await db.clubs.create({
      name,
      slug,
      tagline: tagline || 'A premier campus society',
      logo: logo || '/placeholders/logo.png',
      banner: banner || '/placeholders/banner.jpg',
      description,
      achievements: achievements || [],
      socialLinks: socialLinks || {},
      team: team || []
    });

    return res.status(201).json(newClub);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to build new club entry.' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('Super Admin'), async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const result = await db.clubs.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Club not found.' });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete club.' });
  }
});

export default router;
