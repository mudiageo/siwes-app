import { SvelteKitAuth } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '$lib/db/index.js';
import { users, students, companies } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { initializeDatabase } from '$lib/db/index.js';
import type { Handle } from '@sveltejs/kit';
import Credentials from '@auth/core/providers/credentials';
import { verifyPassword } from '$lib/server/auth.js';

// Initialize database on server start
initializeDatabase();

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string));
				
				if (!user) {
					return null;
				}

				const isValid = await verifyPassword(credentials.password as string, user.hashedPassword);
				if (!isValid) {
					return null;
				}

				// Get profile data
				let profile = null;
				if (user.userType === 'student') {
					const [student] = await db.select().from(students).where(eq(students.userId, user.id));
					profile = student;
				} else {
					const [company] = await db.select().from(companies).where(eq(companies.userId, user.id));
					profile = company;
				}

				return {
					id: user.id,
					email: user.email,
					userType: user.userType,
					profile
				};
			}
		})
	],
	session: {
		strategy: 'jwt'
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.userType = user.userType;
				token.profile = user.profile;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.sub!;
			session.user.userType = token.userType as string;
			session.user.profile = token.profile;
			return session;
		}
	},
	pages: {
		signIn: '/auth/login',
		signUp: '/auth/register'
	}
});