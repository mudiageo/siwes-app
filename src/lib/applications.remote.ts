import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { applications, placements, companies, students } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { notifyApplicationStatusChange, notifyNewApplication } from '$lib/server/notifications.js';
import { calculateAIMatchScore } from '$lib/server/ai-matching';
import { getProfile } from './profile.remote'

// Get user applications
export const getApplications = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  let userApplications;

  if (session.user.userType === 'student') {
    const student = await getProfile();
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
      .where(eq(applications.studentId, student.user.id));
  } else {
    const company = await getProfile();
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
      .where(eq(placements.companyId, company.user.id));
  }

  return userApplications;
});

// Update application status (company only)
export const updateApplicationStatus = command(
  v.object({
    applicationId: v.string(),
    status: v.picklist(['pending', 'reviewing', 'interview', 'accepted', 'rejected'])
  }),
  async ({ applicationId, status }) => {
    const event = getRequestEvent();
    const session = await event.locals.auth();
    
    if (!session?.user || session.user.userType !== 'company') {
      throw new Error('Company access required');
    }

    // Get application details
    const [application] = await db
      .select({
        application: applications,
        placement: placements,
        student: students
      })
      .from(applications)
      .innerJoin(placements, eq(applications.placementId, placements.id))
      .innerJoin(students, eq(applications.studentId, students.id))
      .where(eq(applications.id, applicationId));

    if (!application) {
      throw new Error('Application not found');
    }

    // Update status
    await db
      .update(applications)
      .set({ 
        status,
        reviewedAt: new Date()
      })
      .where(eq(applications.id, applicationId));

    // Notify student
    await notifyApplicationStatusChange(
      application.student.userId,
      application.placement.title,
      status,
      applicationId
    );

    return { success: true };
  }
);

export const applyForPlacement = command(v.object({ placementId: v.string(), coverLetter: v.string()}), async  (placementId: string, coverLetter?: string) => {
	const event = getRequestEvent();
    const session = await event.locals.auth();
    
    if (!session?.user || session.user.userType !== 'student') {
      throw new Error('student access required');
    }
    
	const student = await getProfile();
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
			eq(applications.studentId, student.user.id),
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
})