import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST: /api/payments/create-order (Calculate pricing & prepare Razorpay checkout properties)
router.post('/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { type, items, eventId } = req.body; // type: 'merch' | 'ticket'

  if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });

  try {
    let amount = 0;
    const orderDetails: any[] = [];

    if (type === 'merch') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items in payment cart.' });
      }

      for (const item of items) {
        const product = await db.merchProducts.findOne({ id: item.productId });
        if (!product) {
          return res.status(404).json({ error: `Product id ${item.productId} not found.` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.title}. Only ${product.stock} left.` });
        }

        amount += product.price * item.quantity;
        orderDetails.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          selectedSize: item.size || 'M',
          selectedColor: item.color || 'Black'
        });
      }
    } else if (type === 'ticket') {
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID required for ticketing.' });
      }
      const event = await db.events.findOne({ id: eventId });
      if (!event) return res.status(404).json({ error: 'Event not found.' });

      amount = 199; // Standard event premium entry fee
      orderDetails.push({
        eventId: event.id,
        title: `${event.title} Entry Ticket`,
        price: 199,
        quantity: 1
      });
    } else {
      return res.status(400).json({ error: 'Invalid order type.' });
    }

    // Creating mock transaction details
    const orderId = `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    return res.status(201).json({
      success: true,
      key_id: 'rzp_test_campusthread_fake_key_9988',
      amount: amount * 100, // In paise (Razorpay requirement)
      currency: 'INR',
      order_id: orderId,
      orderDetails
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to initiate order.' });
  }
});

// POST: /api/payments/verify (Validate payment and lock in databases)
router.post('/verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, razorpayPaymentId, orderDetails, type, formData } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthenticated.' });

  try {
    const finalPaymentId = razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    if (type === 'merch') {
      // Save order to Database
      const newOrder = await db.merchOrders.create({
        orderId,
        studentId: req.user.id,
        items: orderDetails,
        paymentId: finalPaymentId,
        paymentStatus: 'completed',
        orderStatus: 'Processing',
        totalAmount: orderDetails.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0)
      });

      // Update Inventory stocks
      for (const item of orderDetails) {
        const product = await db.merchProducts.findOne({ id: item.productId });
        if (product) {
          const updatedStock = Math.max(0, product.stock - item.quantity);
          await db.merchProducts.findByIdAndUpdate(product.id, { stock: updatedStock });
        }
      }

      // Add "Trendsetter Badge" to student's profile for purchasing official merch
      const profile = await db.studentProfiles.findOne({ studentId: req.user.id });
      if (profile) {
        const currentBadges = [...(profile.badges || [])];
        if (!currentBadges.includes('Trendsetter')) {
          currentBadges.push('Trendsetter');
        }
        await db.studentProfiles.findByIdAndUpdate(profile.id, { badges: currentBadges });
      }

      // Generate visual invoice
      const invoiceHTML = `
        <div style="font-family: system-ui; background: #0b0c10; color: #fff; padding: 40px; border-radius: 12px; border: 1px solid #1f2833;">
          <h1 style="color: #66fcf1; margin-bottom: 5px;">CampusThread Invoice</h1>
          <p style="color: #c5a059; margin-top: 0;">Order Ref: ${orderId}</p>
          <hr style="border: 0; border-top: 1px solid #1f2833; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3>Billed To:</h3>
              <p>${req.user.name}<br>${req.user.email}</p>
            </div>
            <div style="text-align: right;">
              <h3>Payment Status:</h3>
              <p style="color: #2ecc71; font-weight: bold;">PAID via Razorpay</p>
              <p>Txn ID: ${finalPaymentId}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <thead>
              <tr style="border-bottom: 2px solid #1f2833; text-align: left; color: #66fcf1;">
                <th style="padding: 10px 0;">Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.map((it: any) => `
                <tr style="border-bottom: 1px solid #1f2833;">
                  <td style="padding: 15px 0;">${it.title} (Size: ${it.selectedSize})</td>
                  <td>${it.quantity}</td>
                  <td>₹${it.price}</td>
                  <td style="text-align: right;">₹${it.price * it.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h2 style="text-align: right; margin-top: 30px; color: #66fcf1;">Total: ₹${orderDetails.reduce((s: number, i: any) => s + (i.price * i.quantity), 0)}</h2>
        </div>
      `;

      return res.status(201).json({
        success: true,
        message: 'Merch Order locked successfully!',
        order: newOrder,
        invoice: invoiceHTML
      });

    } else if (type === 'ticket') {
      const ticketItem = orderDetails[0];
      const event = await db.events.findOne({ id: ticketItem.eventId });
      if (!event) return res.status(404).json({ error: 'Associated event not found.' });

      // Create Registration
      const registration = await db.registrations.create({
        eventId: event.id,
        studentId: req.user.id,
        formData: formData || {},
        paymentId: finalPaymentId,
        paymentStatus: 'completed',
        certificateIssued: false
      });

      // Update Student profile
      const profile = await db.studentProfiles.findOne({ studentId: req.user.id });
      if (profile) {
        const attended = [...(profile.attendedEvents || [])];
        if (!attended.includes(event.title)) attended.push(event.title);
        
        const badges = [...(profile.badges || [])];
        if (!badges.includes('Culture Explorer')) badges.push('Culture Explorer');

        await db.studentProfiles.findByIdAndUpdate(profile.id, {
          attendedEvents: attended,
          badges
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Ticketing and registration confirmed successfully!',
        registration
      });
    }

    return res.status(400).json({ error: 'Unsupported order type.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to confirm purchase.' });
  }
});

export default router;
