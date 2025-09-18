import { model } from 'mongoose';
import { IUserDoc } from './user.interface';
import { UserSchema } from './user.schema';

export const UserModel = model<IUserDoc>('User', UserSchema);