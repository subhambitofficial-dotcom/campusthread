import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET: /api/reels (Get all reels, public)
router.get('/', async (req, res) => {
  try {
    const reels = await db.reels.find();
    // Sort by createdAt descending
    reels.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return res.json(reels);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve reels.' });
  }
});

// POST: /api/reels (Create a new reel - Admins only)
router.post('/', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, videoUrl, clubId } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title/Caption and Video URL are required.' });
    }

    const postedBy = req.user?.name || 'Admin User';
    const newReel = await db.reels.create({
      title,
      videoUrl,
      clubId: clubId || null,
      postedBy,
      likes: []
    });

    // Create a notification for the feed dropping a new reel
    try {
      await db.notifications.create({
        title: `New Video Reel Drop: ${title}`,
        content: `A new video reel has been posted by ${postedBy}.`,
        type: 'general',
        targetId: newReel.id
      });
    } catch (notifErr) {
      console.error('Failed to create notification for new reel:', notifErr);
    }

    return res.status(201).json(newReel);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to post reel.' });
  }
});

// POST: /api/reels/:id/like (Toggle like for a reel - Logged-in users)
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID missing from token.' });
    }

    const reel = await db.reels.findOne({ id });
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found.' });
    }

    let likes = Array.isArray(reel.likes) ? [...reel.likes] : [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      // Unlike
      likes = likes.filter(uid => uid !== userId);
    } else {
      // Like
      likes.push(userId);
    }

    const updated = await db.reels.findByIdAndUpdate(id, { likes });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

// DELETE: /api/reels/:id (Delete a reel - Admins only)
router.delete('/:id', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await db.reels.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'Reel not found.' });
    }
    return res.json({ success: true, message: 'Reel deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete reel.' });
  }
});

export default router;
