/**
 * Better Auth error handling utilities
 * Provides user-friendly error messages for common authentication errors
 */

export type AuthErrorCode =
	| 'INVALID_EMAIL'
	| 'INVALID_PASSWORD'
	| 'USER_NOT_FOUND'
	| 'USER_ALREADY_EXISTS'
	| 'WEAK_PASSWORD'
	| 'PASSWORD_MISMATCH'
	| 'EMAIL_NOT_VERIFIED'
	| 'INVALID_TOKEN'
	| 'EXPIRED_TOKEN'
	| 'RATE_LIMIT_EXCEEDED'
	| 'NETWORK_ERROR'
	| 'SERVER_ERROR'
	| 'UNAUTHORIZED'
	| 'SESSION_EXPIRED'
	| 'ACCOUNT_LOCKED'
	| 'PASSWORD_COMPROMISED'
	| 'MISSING_FIELDS'
	| 'INVALID_CREDENTIALS';

export interface AuthError {
	code?: AuthErrorCode | string;
	message: string;
	status?: number;
	field?: string;
}

/**
 * Error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
	// Authentication errors
	INVALID_EMAIL: 'Please enter a valid email address',
	INVALID_PASSWORD: 'Password must be at least 8 characters long',
	INVALID_CREDENTIALS: 'Invalid email or password',
	USER_NOT_FOUND: 'No account found with this email address',
	USER_ALREADY_EXISTS: 'An account with this email already exists',
	EMAIL_ALREADY_TAKEN: 'This email address is already registered',
	
	// Password errors
	WEAK_PASSWORD: 'Password is too weak. Use a combination of letters, numbers, and symbols',
	PASSWORD_MISMATCH: 'Passwords do not match',
	PASSWORD_COMPROMISED: 'This password has been compromised in a data breach. Please choose a different password',
	PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
	PASSWORD_TOO_LONG: 'Password must be less than 128 characters',
	
	// Verification errors
	EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in',
	INVALID_TOKEN: 'Invalid or expired verification link',
	EXPIRED_TOKEN: 'This link has expired. Please request a new one',
	TOKEN_EXPIRED: 'This link has expired. Please request a new one',
	
	// Rate limiting
	RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again in a few minutes',
	TOO_MANY_REQUESTS: 'Too many requests. Please slow down',
	
	// Account status
	ACCOUNT_LOCKED: 'Your account has been locked. Please contact support',
	ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support',
	ACCOUNT_NOT_FOUND: 'Account not found',
	UNAUTHORIZED: 'You are not authorized to perform this action',
	SESSION_EXPIRED: 'Your session has expired. Please sign in again',
	
	// Validation errors
	MISSING_FIELDS: 'Please fill in all required fields',
	INVALID_INPUT: 'Please check your input and try again',
	VALIDATION_ERROR: 'Please check your input and try again',
	
	// Network/Server errors
	NETWORK_ERROR: 'Network error. Please check your connection and try again',
	SERVER_ERROR: 'Something went wrong. Please try again later',
	INTERNAL_SERVER_ERROR: 'Server error. Please try again later',
	SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later',
	
	// Registration errors
	SIGNUP_FAILED: 'Failed to create account. Please try again',
	PROFILE_CREATION_FAILED: 'Account created but profile setup failed. Please contact support',
	
	// Reset password errors
	RESET_FAILED: 'Failed to reset password. Please try again',
	RESET_TOKEN_INVALID: 'Invalid or expired reset link. Please request a new one'
};

/**
 * Get a user-friendly error message from an error code or message
 */
export function getAuthErrorMessage(error: string | AuthError | null | undefined): string {
	if (!error) {
		return 'An unexpected error occurred. Please try again';
	}

	// If it's a string, try to match it
	if (typeof error === 'string') {
		// Check if it's a known error code
		if (error in ERROR_MESSAGES) {
			return ERROR_MESSAGES[error];
		}
		// Return the error string as-is if it's a custom message
		return error;
	}

	// If it's an error object
	if (typeof error === 'object') {
		// Try error code first
		if (error.code && error.code in ERROR_MESSAGES) {
			return ERROR_MESSAGES[error.code];
		}
		// Fall back to error message
		if (error.message) {
			// Check if the message matches a known error code
			const upperMessage = error.message.toUpperCase().replace(/\s+/g, '_');
			if (upperMessage in ERROR_MESSAGES) {
				return ERROR_MESSAGES[upperMessage];
			}
			return error.message;
		}
	}

	return 'An unexpected error occurred. Please try again';
}

/**
 * Parse Better Auth API error response
 */
export function parseAuthError(error: any): AuthError {
	if (!error) {
		return {
			code: 'SERVER_ERROR',
			message: getAuthErrorMessage('SERVER_ERROR')
		};
	}

	// Handle Better Auth error format
	if (error.error) {
		return {
			code: error.error.code || 'SERVER_ERROR',
			message: getAuthErrorMessage(error.error.message || error.error.code),
			status: error.error.status
		};
	}

	// Handle direct error object
	if (error.code || error.message) {
		return {
			code: error.code || 'SERVER_ERROR',
			message: getAuthErrorMessage(error.message || error.code),
			status: error.status
		};
	}

	// Handle string errors
	if (typeof error === 'string') {
		return {
			message: getAuthErrorMessage(error)
		};
	}

	return {
		code: 'SERVER_ERROR',
		message: getAuthErrorMessage('SERVER_ERROR')
	};
}

/**
 * Validate email format
 */
export function validateEmail(email: string): AuthError | null {
	if (!email || email.trim() === '') {
		return {
			code: 'MISSING_FIELDS',
			message: 'Email is required',
			field: 'email'
		};
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return {
			code: 'INVALID_EMAIL',
			message: getAuthErrorMessage('INVALID_EMAIL'),
			field: 'email'
		};
	}

	return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): AuthError | null {
	if (!password || password.trim() === '') {
		return {
			code: 'MISSING_FIELDS',
			message: 'Password is required',
			field: 'password'
		};
	}

	if (password.length < 8) {
		return {
			code: 'PASSWORD_TOO_SHORT',
			message: getAuthErrorMessage('PASSWORD_TOO_SHORT'),
			field: 'password'
		};
	}

	if (password.length > 128) {
		return {
			code: 'PASSWORD_TOO_LONG',
			message: getAuthErrorMessage('PASSWORD_TOO_LONG'),
			field: 'password'
		};
	}

	return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): AuthError | null {
	if (password !== confirmPassword) {
		return {
			code: 'PASSWORD_MISMATCH',
			message: getAuthErrorMessage('PASSWORD_MISMATCH'),
			field: 'confirmPassword'
		};
	}
	return null;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: AuthError): boolean {
	return error.code === 'RATE_LIMIT_EXCEEDED' || 
	       error.code === 'TOO_MANY_REQUESTS' ||
	       error.status === 429;
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: AuthError): boolean {
	return error.code === 'SESSION_EXPIRED' ||
	       error.code === 'UNAUTHORIZED' ||
	       error.status === 401;
}
