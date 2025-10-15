import { getRequestEvent, form } from '$app/server';
import { redirect } from '@sveltejs/kit'
import { auth } from '$lib/server/auth';
import { isRedirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { students, companies } from '$lib/server/db/schema';
import { parseAuthError } from '$lib/utils/auth-errors';
import * as v from 'valibot';

// Login schema
const loginSchema = v.object({
    email: v.pipe(v.string(), v.email('Please enter a valid email address')),
    password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters'))
});

export const login = form(loginSchema, async (data, invalid) => {
    try {
        const event = getRequestEvent();

        // Use Better Auth API to sign in
        const result = await auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password
            },
            headers: event.request.headers
        });

        // Better Auth returns the user object on success, not an error property
        if (!result || !(result as any).user) {
            invalid('Invalid email or password');
            return;
        }
        
        // Redirect based on user type if needed
        redirect(303, `/app/${event.locals.user?.userType}`)
       
        return {
            success: true
        };
    } catch (e: unknown) {
        if(isRedirect(e)) throw e;
        console.error('Login error:', e);
        const authError = parseAuthError(e);
        invalid(authError.message);
    }
});

// Register schema
const registerSchema = v.object({
    email: v.pipe(v.string(), v.email('Please enter a valid email address')),
    password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
    userType: v.picklist(['student', 'company'], 'Invalid user type'),
    // Student fields (optional, validated conditionally)
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    university: v.optional(v.string()),
    department: v.optional(v.string()),
    level: v.optional(v.string()),
    // Company fields (optional, validated conditionally)
    companyName: v.optional(v.string()),
    industry: v.optional(v.string()),
    location: v.optional(v.string()),
    size: v.optional(v.string()),
    description: v.optional(v.string())
});

export const register = form(registerSchema, async (data, invalid) => {
    try {
        const event = getRequestEvent();

        // Validate user type specific fields
        if (data.userType === 'student') {
            if (!data.firstName || !data.lastName || !data.university) {
                invalid(invalid.firstName('Please fill in all required fields'));
                return;
            }
        } else if (data.userType === 'company') {
            if (!data.companyName || !data.industry) {
                invalid(invalid.companyName('Please fill in all required fields'));
                return;
            }
        }

        // Create user with Better Auth
        const result = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.userType === 'student' 
                    ? `${data.firstName} ${data.lastName}` 
                    : data.companyName as string,
                firstName: data.firstName as string,
                lastName: data.lastName as string,
                userType: data.userType
            },
            headers: event.request.headers
        });

        // Better Auth returns user object on success
        if (!result || !(result as any).user) {
            invalid('Failed to create account. Please try again.');
            return;
        }

        const userId = (result as any).user.id;

        if (!userId) {
            invalid('Failed to create user account');
            return;
        }

        // Create student or company profile
        try {
            if (data.userType === 'student') {
                await db.insert(students).values({
                    userId: userId,
                    firstName: data.firstName as string,
                    lastName: data.lastName as string,
                    university: data.university as string,
                    department: (data.department as string) || 'Computer Engineering',
                    level: parseInt((data.level as string) || '300'),
                    location: (data.location as string) || 'Lagos'
                });
            } else if (data.userType === 'company') {
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
            // User was created but profile failed
            invalid('Account created but profile setup incomplete. Please contact support.');
            return;
        }
        
        // Sign in the newly created user
        const resultSignin = await auth.api.signInEmail({
            body: {
                email: data.email,
                password: data.password
            },
            headers: event.request.headers
        });
        
        // Better Auth returns the user object on success, not an error property
        if (!resultSignin || !(resultSignin as any).user) {
            invalid('Invalid email or password');
            return;
        }
        
        // Redirect based on user type if needed
        redirect(303, `/app/${event.locals.user?.userType}`)


        return {
            success: true
        };
    } catch (error: unknown) {
        if(isRedirect(error)) throw error;

        console.error('Registration error:', error);
        const authError = parseAuthError(error);
        invalid(authError.message);
    }
});