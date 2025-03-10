import { auth } from '@/auth';

export const authOptions = auth;

export const getServerAuthSession = async () => {
  return await auth();
};
