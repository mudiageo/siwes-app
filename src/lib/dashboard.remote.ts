import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db/index.js';
import { students, companies, applications, placements, notifications } from '$lib/server/db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';
import { findMatches } from '$lib/server/matching.js';

// Get student dashboard data
export const getStudentDashboard = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'student') {
    throw new Error('Student access required');
  }

  const student = session.user.profile;
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
    user: session.user,
    student,
    stats,
    recentMatches,
    recentApplications,
    upcomingDeadlines
  };
});

// Get company dashboard data
export const getCompanyDashboard = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const company = session.user.profile;
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
    user: session.user,
    company,
    stats,
    recentApplications: recentApplications.slice(0, 5),
    companyPlacements: companyPlacements.slice(0, 5)
  };
});