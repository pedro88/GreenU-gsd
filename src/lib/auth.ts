import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AppleProvider from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Email/Password credentials
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password as string, user.password);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch {
          return null;
        }
      },
    }),
    // Google OAuth
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
    // Apple OAuth
    AppleProvider({
      clientId: process.env.AUTH_APPLE_ID ?? '',
      clientSecret: process.env.AUTH_APPLE_SECRET ?? '',
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, create or link the user account
      if (account?.provider !== 'credentials') {
        if (!user.email) {
          return false; // OAuth must have email
        }

        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Link the OAuth account to existing user if not already linked
          const hasThisProvider = existingUser.accounts.some(
            (acc) => acc.provider === account?.provider
          );

          if (!hasThisProvider) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account?.type ?? 'oauth',
                provider: account?.provider ?? '',
                providerAccountId: account?.providerAccountId ?? '',
                access_token: account?.access_token,
                refresh_token: account?.refresh_token,
                expires_at: account?.expires_at,
                token_type: account?.token_type,
                scope: account?.scope,
                id_token: account?.id_token,
              },
            });
          }
        } else {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              accounts: {
                create: {
                  type: account?.type ?? 'oauth',
                  provider: account?.provider ?? '',
                  providerAccountId: account?.providerAccountId ?? '',
                  access_token: account?.access_token,
                  refresh_token: account?.refresh_token,
                  expires_at: account?.expires_at,
                  token_type: account?.token_type,
                  scope: account?.scope,
                  id_token: account?.id_token,
                },
              },
            },
          });
          user.id = newUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Store OAuth access token in JWT for later use
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
