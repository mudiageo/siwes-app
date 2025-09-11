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
				'/app/company': {
					allowedRoles: ['admin', 'company'],
					redirectPath: '/auth/login'
				},
				'/app/student': {
				// 	allowedRoles: ['student', 'superadmin'],
					authenticated: true,
					redirectPath: '/auth/login'
				},
				'/app': {
					authenticated: true,
					redirectPath: '/auth/login'
				}
			},
			publicRoutes: {
				'/auth/login': {
					redirectPath: '/app'
				},
				'/auth/register': {}
			},
			redirectPath: '/auth/register',
			authenticatedRedirect: '/app',
			roleKey: 'userType'
		}
	},
	pages: {
		signIn: '/auth/login',
		signUp: '/auth/register'
	}
} satisfies GuardianAuthConfig);
