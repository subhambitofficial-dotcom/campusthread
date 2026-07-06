import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Paths for JSON Database fallback
const DATA_DIR = path.join(__dirname, '../../data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');

// Interface defining the JSON Database structure
interface JsonDbSchema {
  users: any[];
  clubs: any[];
  events: any[];
  merchProducts: any[];
  merchOrders: any[];
  registrations: any[];
  studentProfiles: any[];
  certificates: any[];
  notifications: any[];
  reels: any[];
}

const DEFAULT_DB: JsonDbSchema = {
  users: [],
  clubs: [],
  events: [],
  merchProducts: [],
  merchOrders: [],
  registrations: [],
  studentProfiles: [],
  certificates: [],
  notifications: [],
  reels: []
};

// Check if directories exist, create if not
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
}

// In-Memory cache for JSON database
let jsonDbCache: JsonDbSchema = DEFAULT_DB;
try {
  const content = fs.readFileSync(JSON_DB_PATH, 'utf-8');
  jsonDbCache = { ...DEFAULT_DB, ...JSON.parse(content) };
} catch (error) {
  jsonDbCache = { ...DEFAULT_DB };
}

// DB State
let useMongo = false;

// Connect to MongoDB
export const connectDB = async (mongoUri?: string) => {
  const uri = mongoUri || process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI provided in environment. Defaulting to high-fidelity Local JSON Database.');
    useMongo = false;
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('🔥 Connected successfully to MongoDB Atlas.');
    useMongo = true;
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB Connection failed. Falling back to high-fidelity Local JSON Database.');
    useMongo = false;
    return false;
  }
};

// JSON Database Helper operations
const saveJsonDb = () => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonDbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to local database file:', err);
  }
};

// ================= MONGOOSE SCHEMAS =================
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please supply a valid email address']
  },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { 
    type: String, 
    required: true,
    enum: ['Student User', 'Club Admin', 'Super Admin', 'Event Manager', 'Merch Manager'],
    default: 'Student User' 
  },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const ClubSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  tagline: { type: String, trim: true, default: 'A premier campus society' },
  logo: { type: String, trim: true },
  banner: { type: String, trim: true },
  description: { type: String, required: true, trim: true },
  achievements: { type: [String], default: [] },
  socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  team: {
    type: [{
      name: { type: String, required: true },
      role: { type: String, required: true },
      photo: { type: String, default: '' }
    }],
    default: []
  },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const EventSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  clubId: { type: String, required: true },
  tagline: { type: String, trim: true, default: 'An immersive campus gathering' },
  description: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  location: { type: String, trim: true, default: 'Campus Main Auditorium' },
  poster: { type: String, trim: true },
  sections: { 
    type: [{ type: mongoose.Schema.Types.Mixed }], 
    default: [
      { type: 'hero', enabled: true },
      { type: 'schedule', enabled: true },
      { type: 'registration', enabled: true }
    ]
  },
  themeConfig: { 
    type: mongoose.Schema.Types.Mixed,
    default: {
      preset: 'cyber',
      colors: { primary: '#00f0ff', secondary: '#ff007f', background: '#0a0a0c' }
    }
  },
  registrationForm: { 
    type: [{ type: mongoose.Schema.Types.Mixed }],
    default: [
      { label: 'Full Name', type: 'text', required: true },
      { label: 'College ID', type: 'text', required: true },
      { label: 'WhatsApp Number', type: 'text', required: true }
    ]
  },
  sponsors: { type: [{ type: mongoose.Schema.Types.Mixed }], default: [] },
  updates: { type: [{ type: mongoose.Schema.Types.Mixed }], default: [] },
  subEvents: { type: [{ type: mongoose.Schema.Types.Mixed }], default: [] },
  gallery: { type: [String], default: [] },
  status: { 
    type: String, 
    required: true,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published' 
  },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const MerchProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: [0, 'Price must be positive'] },
  images: { type: [String], default: [] },
  category: { type: String, required: true, trim: true },
  variants: { type: mongoose.Schema.Types.Mixed, default: {} },
  stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 50 },
  countdownDropDate: { type: String },
  groupOrderConfig: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const MerchOrderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  paymentId: { type: String, trim: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
  totalAmount: { type: Number, required: true, min: 0 },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const RegistrationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  eventId: { type: String, required: true },
  studentId: { type: String, required: true },
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },
  paymentId: { type: String, trim: true, default: 'free_rsvp' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  certificateIssued: { type: Boolean, required: true, default: false },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const StudentProfileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  name: { type: String, trim: true },
  badges: { type: [String], default: [] },
  certificates: { type: mongoose.Schema.Types.Mixed, default: [] },
  attendedEvents: { type: [String], default: [] },
  clubMemberships: { type: [String], default: [] },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const CertificateSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  eventName: { type: String, required: true, trim: true },
  issuedBy: { type: String, required: true, trim: true },
  issueDate: { type: String, required: true },
  secureHash: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const NotificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, trim: true },
  type: { type: String, trim: true, default: 'general' },
  targetId: { type: String, trim: true },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, { versionKey: false });

const ReelSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true, trim: true },
  clubId: { type: String, trim: true },
  postedBy: { type: String, required: true, trim: true },
  likes: { type: [String], default: [] },
  createdAt: { type: String, required: true, default: () => new Date().toISOString() }
}, { versionKey: false });


const getModel = (name: string, schema: mongoose.Schema) => {
  if (mongoose.models[name]) {
    return mongoose.models[name];
  }
  return mongoose.model(name, schema);
};

const modelsMap: Record<keyof JsonDbSchema, mongoose.Model<any>> = {
  users: getModel('User', UserSchema),
  clubs: getModel('Club', ClubSchema),
  events: getModel('Event', EventSchema),
  merchProducts: getModel('MerchProduct', MerchProductSchema),
  merchOrders: getModel('MerchOrder', MerchOrderSchema),
  registrations: getModel('Registration', RegistrationSchema),
  studentProfiles: getModel('StudentProfile', StudentProfileSchema),
  certificates: getModel('Certificate', CertificateSchema),
  notifications: getModel('Notification', NotificationSchema),
  reels: getModel('Reel', ReelSchema)
};

// Generic Collection Manager for Local JSON database, mirroring standard DB operations
export class LocalCollection<T extends { id?: string; _id?: string }> {
  private collectionName: keyof JsonDbSchema;

  constructor(collectionName: keyof JsonDbSchema) {
    this.collectionName = collectionName;
  }

  async find(query: any = {}): Promise<T[]> {
    if (useMongo) {
      const model = modelsMap[this.collectionName];
      const results = await model.find(query).lean();
      return results as unknown as T[];
    } else {
      let items = jsonDbCache[this.collectionName] as T[];
      
      // Simple filter matching
      return items.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined) {
            const itemVal = (item as any)[key];
            const queryVal = query[key];
            
            if (queryVal && typeof queryVal === 'object' && '$ne' in queryVal) {
              if (itemVal === queryVal.$ne) return false;
            } else if (itemVal !== queryVal) {
              return false;
            }
          }
        }
        return true;
      });
    }
  }

  async findOne(query: any): Promise<T | null> {
    if (useMongo) {
      const model = modelsMap[this.collectionName];
      const result = await model.findOne(query).lean();
      return result as unknown as T | null;
    } else {
      const results = await this.find(query);
      return results.length > 0 ? results[0] : null;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    const id = data.id || Math.random().toString(36).substring(2, 11);
    const _id = data._id || id;
    const createdAt = (data as any).createdAt || new Date().toISOString();
    
    const newItem = {
      _id,
      id,
      createdAt,
      ...data
    } as any;
    
    if (useMongo) {
      const model = modelsMap[this.collectionName];
      const created = await model.create(newItem);
      return created.toObject() as unknown as T;
    } else {
      jsonDbCache[this.collectionName].push(newItem);
      saveJsonDb();
      return newItem as T;
    }
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    if (useMongo) {
      const model = modelsMap[this.collectionName];
      const updated = await model.findOneAndUpdate(
        { $or: [{ id: id }, { _id: id }] },
        { $set: { ...update, updatedAt: new Date().toISOString() } },
        { new: true }
      ).lean();
      return updated as unknown as T | null;
    } else {
      const items = jsonDbCache[this.collectionName] as T[];
      const idx = items.findIndex(item => item.id === id || item._id === id);
      
      if (idx === -1) return null;
      
      const updatedItem = {
        ...items[idx],
        ...update,
        updatedAt: new Date().toISOString()
      };
      
      items[idx] = updatedItem;
      saveJsonDb();
      return updatedItem;
    }
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    if (useMongo) {
      const model = modelsMap[this.collectionName];
      const deleted = await model.findOneAndDelete({ $or: [{ id: id }, { _id: id }] });
      return !!deleted;
    } else {
      const items = jsonDbCache[this.collectionName];
      const initialLen = items.length;
      jsonDbCache[this.collectionName] = items.filter((item: any) => item.id !== id && item._id !== id);
      saveJsonDb();
      return jsonDbCache[this.collectionName].length < initialLen;
    }
  }
}

// Service instances exporting access
export const db = {
  isMongo: () => useMongo,
  users: new LocalCollection<any>('users'),
  clubs: new LocalCollection<any>('clubs'),
  events: new LocalCollection<any>('events'),
  merchProducts: new LocalCollection<any>('merchProducts'),
  merchOrders: new LocalCollection<any>('merchOrders'),
  registrations: new LocalCollection<any>('registrations'),
  studentProfiles: new LocalCollection<any>('studentProfiles'),
  certificates: new LocalCollection<any>('certificates'),
  notifications: new LocalCollection<any>('notifications'),
  reels: new LocalCollection<any>('reels')
};
