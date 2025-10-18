import { db } from '$lib/server/db';
import { students, companies, applications, placements, notifications, users } from '$lib/server/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { findMatches } from '$lib/server/matching.js';
import { calculateAIMatchScore } from '$lib/server/ai-matching';
import { createNotification, notifyNewApplication } from '$lib/server/notifications.js';
import { auth } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { getProfile } from '../profile.remote.ts'
// Authentication helpers
export async function getUser(event: RequestEvent) {
	const session = await event.locals.auth();
	return session?.user || null;
}

export async function requireAuth(event: RequestEvent) {
	const user = await getUser(event);
	if (!user) {
		throw new Error('Authentication required');
	}
	return user;
}

export async function requireStudent(event: RequestEvent) {
	const user = await requireAuth(event);
	if (user.userType !== 'student') {
		throw new Error('Student access required');
	}
	return user;
}

export async function requireCompany(event: RequestEvent) {
	const user = await requireAuth(event);
	if (user.userType !== 'company') {
		throw new Error('Company access required');
	}
	return user;
}

// Dashboard functions
export async function getDashboardData(event: RequestEvent) {
	const user = await requireAuth(event);

	if (user.userType === 'student') {
		const student = user.profile;
		if (!student) throw new Error('Student profile not found');

		// Get recent matches
		const matches = await findMatches(student.id);
		const recentMatches = matches.slice(0, 3);

		// Get recent applications
		const recentApplications = await db
			.select({
				application: applications,
				placement: placements,
				company: companies
			})
			.from(applications)
			.innerJoin(placements, eq(applications.placementId, placements.id))
			.innerJoin(companies, eq(placements.companyId, companies.id))
			.where(eq(applications.studentId, student.id))
			.orderBy(desc(applications.appliedAt))
			.limit(5);

		// Get stats
		const stats = {
			totalMatches: matches.length,
			newMatches: matches.filter(m => m.score.overall >= 0.8).length,
			activeApplications: recentApplications.filter(app => 
				['pending', 'reviewing', 'interview'].includes(app.application.status)
			).length,
			profileViews: Math.floor(Math.random() * 50) + 20
		};

		// Get upcoming deadlines
		const upcomingDeadlines = matches
			.filter(m => m.placement.applicationDeadline)
			.map(m => ({
				title: `${m.placement.title} - ${m.placement.company.name}`,
				deadline: m.placement.applicationDeadline!,
				daysLeft: Math.ceil((m.placement.applicationDeadline!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
			}))
			.filter(d => d.daysLeft > 0)
			.sort((a, b) => a.daysLeft - b.daysLeft)
			.slice(0, 5);

		return {
			user,
			student,
			stats,
			recentMatches,
			recentApplications,
			upcomingDeadlines
		};
	} else {
		// Company dashboard
		const company = user.profile;
		if (!company) throw new Error('Company profile not found');

		// Get company placements
		const companyPlacements = await db
			.select()
			.from(placements)
			.where(eq(placements.companyId, company.id))
			.orderBy(desc(placements.createdAt));

		// Get recent applications
		const recentApplications = await db
			.select({
				application: applications,
				placement: placements,
				student: students
			})
			.from(applications)
			.innerJoin(placements, eq(applications.placementId, placements.id))
			.innerJoin(students, eq(applications.studentId, students.id))
			.where(eq(placements.companyId, company.id))
			.orderBy(desc(applications.appliedAt))
			.limit(10);

		// Get stats
		const totalApplicationsResult = await db
			.select({ count: count() })
			.from(applications)
			.innerJoin(placements, eq(applications.placementId, placements.id))
			.where(eq(placements.companyId, company.id));

		const stats = {
			totalPlacements: companyPlacements.length,
			activePlacements: companyPlacements.filter(p => p.isActive).length,
			totalApplications: totalApplicationsResult[0]?.count || 0,
			pendingReviews: recentApplications.filter(app => app.application.status === 'pending').length
		};

		return {
			user,
			company,
			stats,
			recentApplications: recentApplications.slice(0, 5),
			companyPlacements: companyPlacements.slice(0, 5)
		};
	}
}

// Matches functions
export async function getMatches(event: RequestEvent, filters: any = {}) {
	const user = await requireStudent(event);
	const student = await getProfile();
	if (!student) throw new Error('Student profile not found');

	const matches = await findMatches(student.id);
	
	// Apply filters
	let filteredMatches = matches;

	if (filters.industry) {
		filteredMatches = filteredMatches.filter(match => 
			match.placement.department.toLowerCase().includes(filters.industry.toLowerCase())
		);
	}

	if (filters.location) {
		filteredMatches = filteredMatches.filter(match => 
			match.placement.location.toLowerCase().includes(filters.location.toLowerCase())
		);
	}

	if (filters.duration) {
		filteredMatches = filteredMatches.filter(match => {
			const placementDuration = match.placement.duration;
			if (filters.duration === '< 20') return placementDuration < 20;
			if (filters.duration === '20-24') return placementDuration >= 20 && placementDuration <= 24;
			if (filters.duration === '> 24') return placementDuration > 24;
			return true;
		});
	}

	if (filters.search) {
		filteredMatches = filteredMatches.filter(match => 
			match.placement.title.toLowerCase().includes(filters.search.toLowerCase()) ||
			match.placement.department.toLowerCase().includes(filters.search.toLowerCase()) ||
			match.placement.company.name.toLowerCase().includes(filters.search.toLowerCase())
		);
	}

	return { matches: filteredMatches };
}

// Applications functions
export async function getApplications(event: RequestEvent) {
	const user = await requireAuth(event);

	let userApplications;

	if (user.userType === 'student') {
		const student = user.profile;
		if (!student) throw new Error('Student profile not found');

		userApplications = await db
			.select({
				application: applications,
				placement: placements,
				company: companies
			})
			.from(applications)
			.innerJoin(placements, eq(applications.placementId, placements.id))
			.innerJoin(companies, eq(placements.companyId, companies.id))
			.where(eq(applications.studentId, student.id));
	} else {
		const company = user.profile;
		if (!company) throw new Error('Company profile not found');

		userApplications = await db
			.select({
				application: applications,
				placement: placements,
				student: students
			})
			.from(applications)
			.innerJoin(placements, eq(applications.placementId, placements.id))
			.innerJoin(students, eq(applications.studentId, students.id))
			.where(eq(placements.companyId, company.id));
	}

	return { applications: userApplications };
}

export async function createApplication(event: RequestEvent, placementId: string, coverLetter?: string) {
	const user = await requireStudent(event);
	const student = user.profile;
	if (!student) throw new Error('Student profile not found');

	// Get placement details
	const [placement] = await db
		.select()
		.from(placements)
		.where(eq(placements.id, placementId));

	if (!placement) {
		throw new Error('Placement not found');
	}

	// Check if already applied
	const [existingApplication] = await db
		.select()
		.from(applications)
		.where(and(
			eq(applications.studentId, student.id),
			eq(applications.placementId, placementId)
		));

	if (existingApplication) {
		throw new Error('Already applied to this placement');
	}

	// Calculate match score
	const matchScore = calculateAIMatchScore(student, placement);

	// Create application
	const [application] = await db.insert(applications).values({
		studentId: student.id,
		placementId,
		matchScore: matchScore.overall,
		matchBreakdown: matchScore.breakdown,
		coverLetter: coverLetter || generateCoverLetter(student, placement)
	}).returning();

	// Get company user ID for notification
	const [company] = await db
		.select({ userId: companies.userId, name: companies.name })
		.from(companies)
		.where(eq(companies.id, placement.companyId));

	if (company) {
		await notifyNewApplication(
			company.userId,
			`${student.firstName} ${student.lastName}`,
			placement.title
		);
	}

	return { application };
}

// Notifications functions
export async function getNotifications(event: RequestEvent, countOnly = false) {
	const user = await requireAuth(event);

	if (countOnly) {
		const result = await db
			.select({ count: count() })
			.from(notifications)
			.where(and(
				eq(notifications.userId, user.id),
				eq(notifications.isRead, false)
			));
		return { count: result[0]?.count || 0 };
	}

	const userNotifications = await db
		.select()
		.from(notifications)
		.where(eq(notifications.userId, user.id))
		.orderBy(desc(notifications.createdAt))
		.limit(50);

	return { notifications: userNotifications };
}

export async function markAllNotificationsAsRead(event: RequestEvent) {
	const user = await requireAuth(event);

	await db
		.update(notifications)
		.set({ isRead: true })
		.where(eq(notifications.userId, user.id));

	return { success: true };
}

// Note: Registration is now handled in auth.remote.ts using Better Auth API

// Settings functions
export async function getUserSettings(event: RequestEvent) {
	const user = await requireAuth(event);
	
	// Get user data
	const [userData] = await db.select().from(users).where(eq(users.id, user.id));
	
	return {
		user: userData,
		profile: user.profile,
		userType: user.userType
	};
}

export async function updateUserSettings(event: RequestEvent, settings: any) {
	const user = await requireAuth(event);
	
	// Update user email if provided
	if (settings.email && settings.email !== user.email) {
		await db
			.update(users)
			.set({ email: settings.email })
			.where(eq(users.id, user.id));
	}
	
	// Update password if provided
	if (settings.newPassword && settings.currentPassword) {
		// Use Better Auth's change password API
		await auth.api.changePassword({
			body: {
				newPassword: settings.newPassword,
				currentPassword: settings.currentPassword,
				revokeOtherSessions: false
			},
			headers: event.request.headers
		});
	}
	
	// Update profile settings based on user type
	if (user.userType === 'student') {
		const profileUpdates: any = {};
		
		if (settings.emailNotifications !== undefined) {
			profileUpdates.emailNotifications = settings.emailNotifications;
		}
		if (settings.profileVisibility !== undefined) {
			profileUpdates.profileVisibility = settings.profileVisibility;
		}
		if (settings.matchNotifications !== undefined) {
			profileUpdates.matchNotifications = settings.matchNotifications;
		}
		
		if (Object.keys(profileUpdates).length > 0) {
			await db
				.update(students)
				.set(profileUpdates)
				.where(eq(students.userId, user.id));
		}
	} else {
		const profileUpdates: any = {};
		
		if (settings.emailNotifications !== undefined) {
			profileUpdates.emailNotifications = settings.emailNotifications;
		}
		if (settings.companyVisibility !== undefined) {
			profileUpdates.companyVisibility = settings.companyVisibility;
		}
		
		if (Object.keys(profileUpdates).length > 0) {
			await db
				.update(companies)
				.set(profileUpdates)
				.where(eq(companies.userId, user.id));
		}
	}
	
	return { success: true };
}

export async function deleteUserAccount(event: RequestEvent) {
	const user = await requireAuth(event);
	
	// Delete profile first (foreign key constraint)
	if (user.userType === 'student') {
		await db.delete(students).where(eq(students.userId, user.id));
	} else {
		await db.delete(companies).where(eq(companies.userId, user.id));
	}
	
	// Delete user
	await db.delete(users).where(eq(users.id, user.id));
	
	return { success: true };
}

// Helper function
function generateCoverLetter(student: any, placement: any): string {
	return `Dear Hiring Manager,

I am writing to express my strong interest in the ${placement.title} position at your company. As a ${student.level}-level ${student.department} student at ${student.university}, I am excited about the opportunity to contribute to your team and gain valuable industry experience.

My technical skills in ${(student.skills || []).slice(0, 3).join(', ')} align well with your requirements, and I am particularly eager to learn ${(placement.skillsToLearn || []).slice(0, 2).join(' and ')} during this placement.

I am confident that my academic background, combined with my passion for ${student.department.toLowerCase()}, makes me a strong candidate for this position. I look forward to the opportunity to discuss how I can contribute to your team.

Thank you for your consideration.

Best regards,
${student.firstName} ${student.lastName}`;
}