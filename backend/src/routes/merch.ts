import { Router, Response } from 'express';
import { db } from '../services/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET: /api/merch (Get all merch inventory catalog)
router.get('/', async (req: any, res: Response) => {
  const { category } = req.query;
  const filter: any = {};
  
  if (category) filter.category = category;

  try {
    const products = await db.merchProducts.find(filter);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve merchandise store.' });
  }
});

// GET: /api/merch/:id (Get single merch product specifications)
router.get('/:id', async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const product = await db.merchProducts.findOne({ id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// POST: /api/merch (Create new merch item - Merch managers / Admins)
router.post('/', authenticateToken, authorizeRoles('Super Admin', 'Club Admin', 'Merch Manager'), async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, price, images, category, variants, stock, countdownDropDate, groupOrderConfig } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: 'Product title, price, and category are required.' });
  }

  try {
    const newProduct = await db.merchProducts.create({
      title,
      description: description || 'High-quality official campus apparel',
      price: Number(price),
      images: images || ['/placeholders/hoodie.jpg'],
      category,
      variants: variants || { sizes: ['S', 'M', 'L', 'XL'], colors: ['Charcoal Black', 'Off-White'] },
      stock: stock !== undefined ? Number(stock) : 50,
      countdownDropDate: countdownDropDate || null,
      groupOrderConfig: groupOrderConfig || null
    });

    // Notify of new exclusive drops
    if (countdownDropDate) {
      await db.notifications.create({
        title: 'EXCLUSIVE MERCH DROP!',
        content: `"${title}" limited drop has been scheduled! Check the store countdown.`,
        type: 'merch',
        targetId: newProduct.id
      });
    }

    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to post new merchandise.' });
  }
});

// POST: /api/merch/quote (Submit custom group merch quote request)
router.post('/quote', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { productType, quantity, details, contactEmail, whatsapp } = req.body;

  if (!productType || !quantity || !contactEmail) {
    return res.status(400).json({ error: 'Please supply product type, quantity and contact details.' });
  }

  try {
    // Generate notification for admins to review
    await db.notifications.create({
      title: 'New Custom Merch Quote Request',
      content: `A group order quote for ${quantity}x ${productType} has been requested by ${req.user?.name}. Contact: ${contactEmail}`,
      type: 'quote',
      targetId: 'admin-orders'
    });

    return res.status(201).json({
      message: 'Custom quote request submitted successfully! Merch managers will contact you shortly.',
      request: { productType, quantity, details, contactEmail, whatsapp }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record custom quote request.' });
  }
});

export default router;
