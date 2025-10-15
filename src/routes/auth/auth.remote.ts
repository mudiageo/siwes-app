import { getRequestEvent, form } from '$app/server';
import { redirect } from '@sveltejs/kit'
import { auth } from '$lib/server/auth';
import { isRedirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { students, companies } from '$lib/server/db/schema';
import { parseAuthError, validateEmail, validatePassword } from '$lib/utils/auth-errors';

export const login = form(async (data) => {
	try {
		const event = getRequestEvent();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		// Validate input
		const emailError = validateEmail(email);
		if (emailError) {
			return { error: emailError.message };
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			return { error: passwordError.message };
		}

		// Use Better Auth API to sign in
		const result = await auth.api.signInEmail({
			body: {
				email,
				password
			},
			headers: event.request.headers
		});

		// Better Auth returns the user object on success, not an error property
		if (!result || !(result as any).user) {
			return { error: 'Invalid email or password' };
		}
console.log('Login successful:', result);
		// Redirect based on user type if needed
		// redirect(303, `/app/${result.user.userType}`)
		return {
			success: true
		};
	} catch (e: unknown) {
		if(isRedirect(e)) throw e;
		console.error('Login error:', e);
		const authError = parseAuthError(e);
		return {
			error: authError.message
		};
	}
});

export const register = form(async (formData) => {
	try {
		const data = Object.fromEntries(formData);
		const event = getRequestEvent();

		// Validate required fields
		const email = data.email as string;
		const password = data.password as string;
		const userType = data.userType as string;

		// Validate email
		const emailError = validateEmail(email);
		if (emailError) {
			return { error: emailError.message };
		}

		// Validate password
		const passwordError = validatePassword(password);
		if (passwordError) {
			return { error: passwordError.message };
		}

		// Validate user type specific fields
		if (userType === 'student') {
			if (!data.firstName || !data.lastName || !data.university) {
				return { error: 'Please fill in all required fields' };
			}
		} else if (userType === 'company') {
			if (!data.companyName || !data.industry) {
				return { error: 'Please fill in all required fields' };
			}
		} else {
			return { error: 'Invalid user type' };
		}

		// Create user with Better Auth
		const result = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: userType === 'student' 
					? `${data.firstName} ${data.lastName}` 
					: data.companyName as string,
				firstName: data.firstName as string,
				lastName: data.lastName as string,
				userType
			},
			headers: event.request.headers
		});

		// Better Auth returns user object on success
		if (!result || !(result as any).user) {
			return { error: 'Failed to create account. Please try again.' };
		}

		const userId = (result as any).user.id;

		if (!userId) {
			return { error: 'Failed to create user account' };
		}

		// Create student or company profile
		try {
			if (userType === 'student') {
				await db.insert(students).values({
					userId: userId,
					firstName: data.firstName as string,
					lastName: data.lastName as string,
					university: data.university as string,
					department: (data.department as string) || 'Computer Engineering',
					level: parseInt((data.level as string) || '300'),
					location: (data.location as string) || 'Lagos'
				});
			} else if (userType === 'company') {
				await db.insert(companies).values({
					userId: userId,
					name: data.companyName as string,
					industry: data.industry as string,
					location: (data.location as string) || 'Lagos',
					size: (data.size as any) || 'small',
					description: (data.description as string) || `${data.companyName} - ${data.industry} company`
				});
			}
		} catch (profileError: any) {
			console.error('Profile creation error:', profileError);
			// User was created but profile failed - we still return success
			// but log the error for investigation
			return { 
				error: 'Account created but profile setup incomplete. Please contact support.',
				partialSuccess: true 
			};
		}
		const resultSignin = await auth.api.signInEmail({
			body: {
				email,
				password
			},
			headers: event.request.headers
		});

		return {
			success: true
		};
	} catch (error: any) {
		console.error('Registration error:', error);
		const authError = parseAuthError(error);
		return {
			error: authError.message
		};
	}
});
