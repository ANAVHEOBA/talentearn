import { Document } from 'mongoose';

export interface IUser {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDoc extends IUser, Document {}