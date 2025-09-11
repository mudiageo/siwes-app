import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { applications, placements, companies, students } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { notifyApplicationStatusChange } from '$lib/server/notifications.js';

// Get user applications
export const getApplications = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  let userApplications;

  if (session.user.userType === 'student') {
    const student = session.user.profile;
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
    const company = session.user.profile;
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