import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// DELETE: /api/admin/delete/clubs/:id - Cascade delete related events (simple example)
router.delete('/clubs/:id', authenticateToken, authorizeRoles('Super Admin', 'Club Admin'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Delete the club
    const clubDeleted = await db.clubs.findByIdAndDelete(id);
    if (!clubDeleted) {
      return res.status(404).json({ error: 'Club not found.' });
    }
    // Cascade delete events belonging to this club
    const events = await db.events.find({ clubId: id });
    for (const ev of events) {
      await db.events.findByIdAndDelete(ev.id || ev._id);
    }
    // Optionally, clean up registrations for those events (omitted for brevity)
    return res.json({ message: 'Club and related events deleted successfully.' });
  } catch (error) {
    console.error('Error deleting club:', error);
    return res.status(500).json({ error: 'Failed to delete club.' });
  }
});

// DELETE: /api/admin/delete/merch/:id - Simple delete of a merchandise product
router.delete('/merch/:id', authenticateToken, authorizeRoles('Super Admin', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await db.merchProducts.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Merchandise product not found.' });
    }
    return res.json({ message: 'Merchandise product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting merchandise:', error);
    return res.status(500).json({ error: 'Failed to delete merchandise product.' });
  }
});

// DELETE: /api/admin/delete/events/:id - Simple delete of an event (microsite)
router.delete('/events/:id', authenticateToken, authorizeRoles('Super Admin', 'Event Manager'), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await db.events.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    return res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;
