import { writable } from 'svelte/store';

// Legacy store for backward compatibility - will be replaced with runes
export const user = writable(null);
export const isAuthenticated = writable(false);

// These functions are now handled by Auth.js
export async function login(email: string, password: string) {
	// This will be handled by the auth system
	return { success: false, error: 'Use Auth.js login' };
}

export async function register(userData: any) {
	// This will be handled by the auth system
	return { success: false, error: 'Use Auth.js registration' };
}

export async function logout() {
	// This will be handled by the auth system
}