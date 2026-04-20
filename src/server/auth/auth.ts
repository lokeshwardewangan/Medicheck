import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db/client';
import * as authSchema from '@/db/schema/auth';
import { sendMagicLinkEmail } from '@/server/email/resend';
import { bootstrapUser } from './bootstrap';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: false },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            await bootstrapUser(createdUser.id, createdUser.email, createdUser.name);
          } catch (error) {
            console.error('[auth] bootstrapUser failed for', createdUser.id, error);
          }
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
      expiresIn: 60 * 10,
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
