import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET: /api/admin/stats (Get real statistics - Admins only)
router.get('/stats', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Merch Manager', 'Event Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await db.users.find();
    const clubs = await db.clubs.find();
    const events = await db.events.find();
    const products = await db.merchProducts.find();
    const orders = await db.merchOrders.find();
    const registrations = await db.registrations.find();

    return res.json({
      users: users.length,
      clubs: clubs.length,
      events: events.length,
      merchProducts: products.length,
      merchOrders: orders.length,
      registrations: registrations.length
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve database statistics.' });
  }
});

// GET: /api/admin/orders (Get all orders - Admins only)
router.get('/orders', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await db.merchOrders.find();
    const users = await db.users.find();
    
    // Create a mapping of userId -> name
    const userMap: Record<string, string> = {};
    users.forEach(u => {
      userMap[u.id || u._id] = u.name;
    });

    const populatedOrders = orders.map(o => {
      const studentName = userMap[o.studentId] || 'Unknown Student';
      // Map items structure
      const itemSummaries = Array.isArray(o.items)
        ? o.items.map((it: any) => `${it.title} (x${it.quantity})`).join(', ')
        : 'No Items';

      return {
        orderId: o.orderId,
        studentName,
        items: itemSummaries,
        amount: `₹${o.totalAmount || 0}`,
        status: o.orderStatus || 'Processing',
        paymentId: o.paymentId || 'N/A',
        createdAt: o.createdAt
      };
    });

    // Sort by createdAt descending
    populatedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json(populatedOrders);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve apparel orders list.' });
  }
});

// GET: /api/admin/registrations (Get all event RSVPs - Admins only)
router.get('/registrations', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const registrations = await db.registrations.find();
    const users = await db.users.find();
    const events = await db.events.find();

    const userMap: Record<string, any> = {};
    users.forEach(u => {
      userMap[u.id || u._id] = u;
    });

    const eventMap: Record<string, any> = {};
    events.forEach(e => {
      eventMap[e.id || e._id] = e;
    });

    const populatedRegs = registrations.map(r => {
      const student = userMap[r.studentId];
      const studentName = student ? student.name : 'Unknown Student';
      
      const event = eventMap[r.eventId];
      const eventName = event ? event.title : 'Unknown Event';

      // Parse custom roll number or metadata if present in formData
      const rollNumber = r.formData?.['Campus Roll Number'] || r.formData?.['Roll Number'] || r.formData?.['College ID'] || 'N/A';

      return {
        id: r.id || r._id,
        eventName,
        studentName,
        rollNumber,
        paymentId: r.paymentId || 'free_rsvp',
        paymentStatus: r.paymentStatus || 'completed',
        createdAt: r.createdAt
      };
    });

    // Sort by date descending
    populatedRegs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json(populatedRegs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve event registrations list.' });
  }
});

// GET: /api/admin/users (Get all registered users - Admins only)
router.get('/users', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Event Manager', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await db.users.find();
    const cleanUsers = users.map(u => ({
      id: u.id || u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt
    }));
    return res.json(cleanUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve users list.' });
  }
});

export default router;
