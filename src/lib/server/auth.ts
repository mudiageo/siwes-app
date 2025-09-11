import { guardianAuth, type GuardianAuthConfig } from 'svelte-guardian';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { users, accounts, sessions, verificationTokens} from '$lib/server/db/schema';

const adapter = DrizzleAdapter(db,  {
      usersTable: users,
      accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
		});

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
	database: {
		type: 'custom',
		adapter
	},
	providers: {
		google: {
			enabled: true
		},
		credentials: {
			additionalUserFields: ['role'],
			allowRegistration: true,
			requireEmailVerification: false
		}
	},
	security: {
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
		emailVerification: {
			method: 'link',
			otpLength: 6,
			otpExpiration: 15 // in minutes
		},
		passwordReset: {
			tokenExpiration: 15
		},
		twoFactorAuth: {
			method: 'totp',
			allowBackupCodes: true,
			backupCodeCount: 5
		},		
		emailProvider: {
			type: 'nodemailer',
			service: 'gmail',
			from: 'SIWES AI <no-reply@siwesai.com>',
			auth: {
				method: 'app-password',
				user: env.GMAIL_USER,
				appPass: env.GMAIL_APP_PASSWORD
			}
		},
		
		routeProtection: {
			protectedRoutes: {
				'/admin': {
					allowedRoles: ['admin', 'superadmin'],
					redirectPath: '/login'
				},
				'/dashboard/admin': {
					allowedRoles: ['admin', 'superadmin'],
					redirectPath: '/login'
				},
				'/dashboard/client': {
					allowedRoles: ['client', 'superadmin'],
					redirectPath: '/login'
				},
				'/dashboard/technician': {
					allowedRoles: ['technician', 'superadmin'],
					redirectPath: '/login'
				},
				'/dashboard': {
					authenticated: true,
					redirectPath: '/login'
				}
			},
			publicRoutes: {
				'/login': {
					redirectPath: '/dashboard'
				},
				'/register': {}
			},
			redirectPath: '/login',
			authenticatedRedirect: '/dashboard',
			roleKey: 'role'
		}
	},
	pages: {
		signIn: '/login'
	}
} satisfies GuardianAuthConfig);
