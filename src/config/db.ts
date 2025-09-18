import mongoose from 'mongoose';
import { CONFIG } from './app-config';   // <-- file extension required by nodenext

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(CONFIG.MONGODB_URI);
  console.log('MongoDB connected');
}