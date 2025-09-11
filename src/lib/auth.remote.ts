import { query, form, command } from '$app/server';
import { redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import { createUser, authenticateUser, getUserProfile } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { users, students, companies } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// Login form
export const login = form(async (data) => {
  const email = data.get('email');
  const password = data.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Email and password are required');
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Set session cookie here if needed
  redirect(303, user.userType === 'student' ? '/app/student' : '/app/company');
});

// Registration form
export const register = form(async (data) => {
  const email = data.get('email');
  const password = data.get('password');
  const userType = data.get('userType');

  if (typeof email !== 'string' || typeof password !== 'string' || typeof userType !== 'string') {
    throw new Error('Missing required fields');
  }

  if (!['student', 'company'].includes(userType)) {
    throw new Error('Invalid user type');
  }

  try {
    const user = await createUser(email, password, userType as 'student' | 'company');

    // Create profile based on user type
    if (userType === 'student') {
      const firstName = data.get('firstName') as string;
      const lastName = data.get('lastName') as string;
      const university = data.get('university') as string;
      const department = data.get('department') as string || 'Computer Science';
      const level = parseInt(data.get('level') as string || '300');

      await db.insert(students).values({
        userId: user.id,
        firstName,
        lastName,
        university,
        department,
        level,
        location: 'Lagos', // Default
        profileCompleteness: 0.3
      });
    } else {
      const companyName = data.get('companyName') as string;
      const industry = data.get('industry') as string;
      const location = data.get('location') as string || 'Lagos';

      await db.insert(companies).values({
        userId: user.id,
        name: companyName,
        industry,
        location,
        size: 'medium', // Default
        description: 'Company description to be updated'
      });
    }

    redirect(303, userType === 'student' ? '/app/student' : '/app/company');
  } catch (error) {
    throw new Error('Registration failed');
  }
});

// Get current user profile
export const getCurrentUser = query(async () => {
  const userProfile = await getUserProfile('current-user-id'); // This would come from session
  return userProfile;
});