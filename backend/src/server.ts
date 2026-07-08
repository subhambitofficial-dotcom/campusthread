import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './services/db';
import seed from './services/seed';

// Import Route Handlers
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import adminDeleteRoutes from './routes/adminDelete';
import clubRoutes from './routes/clubs';
import eventRoutes from './routes/events';
import merchRoutes from './routes/merch';
import paymentRoutes from './routes/payments';
import reelsRoutes from './routes/reels';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with generous development origins
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Dynamic Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: 'CampusThread Engine 1.0.0',
    uptime: process.uptime()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/merch', merchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/delete', adminDeleteRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({ error: 'Internal system fault. Please check backend logs.' });
});

// Boot Server
const startServer = async () => {
  // Connect to Database (MongoDB or fallback JSON)
  await connectDB();

  // Seed Database instantly on boot to populate events/merch/users
  //await seed();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 CAMPUSTHREAD BACKEND ENGINE ONLINE`);
    console.log(`📡 PORT: ${PORT}`);
    console.log(`🔗 HEALTHCHECK: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();
