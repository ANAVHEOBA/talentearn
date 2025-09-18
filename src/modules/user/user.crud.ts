// src/modules/user/user.crud.ts
import { UserModel } from './user.model';
import { IUserDoc } from './user.interface';

export async function findUserByGoogleId(googleId: string): Promise<IUserDoc | null> {
  return UserModel.findOne({ googleId });          // .lean() removed
}

export async function createUser(data: {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<IUserDoc> {
  return UserModel.create(data);
}

export async function findOrCreateGoogleUser(profile: {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<IUserDoc> {
  const existing = await findUserByGoogleId(profile.id);
  if (existing) return existing;

  return createUser({
    googleId: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  });
}