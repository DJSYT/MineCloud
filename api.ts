import express, { Request, Response } from 'express';
import cors from 'cors';
import { storage } from './storage';
import { insertServiceInquirySchema, insertUserSchema } from '../shared/schema';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes

// Track page views
app.post('/api/track-view', async (req: Request, res: Response) => {
  try {
    const { page, userAgent, ipAddress } = req.body;
    
    await storage.trackPageView({
      page: page || '/',
      userAgent,
      ipAddress,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// Handle service inquiries (contact form)
app.post('/api/service-inquiry', async (req: Request, res: Response) => {
  try {
    const validatedData = insertServiceInquirySchema.parse(req.body);
    
    const inquiry = await storage.createServiceInquiry(validatedData);
    
    res.json({ 
      success: true, 
      message: 'Thank you for your inquiry! We\'ll get back to you soon.',
      inquiryId: inquiry.id 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid data provided', details: error.errors });
    } else {
      console.error('Error creating service inquiry:', error);
      res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  }
});

// Track Discord joins
app.post('/api/track-discord-join', async (req: Request, res: Response) => {
  try {
    const { userId, source } = req.body;
    
    await storage.trackDiscordJoin({
      userId: userId || null,
      source: source || 'website',
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking Discord join:', error);
    res.status(500).json({ error: 'Failed to track Discord join' });
  }
});

// Get analytics (admin endpoint)
app.get('/api/analytics', async (req: Request, res: Response) => {
  try {
    const [pageViewStats, discordStats, inquiries] = await Promise.all([
      storage.getPageViewStats(),
      storage.getDiscordJoinStats(),
      storage.getServiceInquiries()
    ]);
    
    res.json({
      pageViews: pageViewStats,
      discordJoins: discordStats,
      serviceInquiries: {
        total: inquiries.length,
        pending: inquiries.filter(i => i.status === 'pending').length,
        completed: inquiries.filter(i => i.status === 'completed').length,
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`MineCloud API server running on port ${port}`);
});

export default app;