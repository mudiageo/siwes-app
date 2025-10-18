import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { findMatches } from '$lib/server/matching.js';
import { db } from '$lib/server/db/index.js';
import { applications, placements, companies } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { calculateMatchScore } from '$lib/server/matching.js';
import { notifyNewApplication } from '$lib/server/notifications.js';
import { getProfile } from './profile.remote'

const FiltersSchema = v.object({
  industry: v.optional(v.string()),
  location: v.optional(v.string()),
  duration: v.optional(v.string()),
  search: v.optional(v.string())
});

// Get matches with filters
export const getMatches = query(FiltersSchema, async (filters = {}) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'student') {
    throw new Error('Student access required');
  }

  const student = await getProfile();
  if (!student) throw new Error('Student profile not found');

  const matches = await findMatches(student.id);
  
  // Apply filters
  let filteredMatches = matches;

  if (filters.industry) {
    filteredMatches = filteredMatches.filter(match => 
      match.placement.department.toLowerCase().includes(filters.industry!.toLowerCase())
    );
  }

  if (filters.location) {
    filteredMatches = filteredMatches.filter(match => 
      match.placement.location.toLowerCase().includes(filters.location!.toLowerCase())
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
      match.placement.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
      match.placement.department.toLowerCase().includes(filters.search!.toLowerCase()) ||
      match.placement.company.name.toLowerCase().includes(filters.search!.toLowerCase())
    );
  }

  return { matches: filteredMatches, filters };
});

// Apply to placement
export const applyToPlacement = command(v.string(), async (placementId) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'student') {
    throw new Error('Student access required');
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
      eq(applications.studentId, student.id),
      eq(applications.placementId, placementId)
    ));

  if (existingApplication) {
    throw new Error('Already applied to this placement');
  }

  // Calculate match score
  const matchScore = calculateMatchScore(student, placement);

  // Create application
  const [application] = await db.insert(applications).values({
    studentId: student.id,
    placementId,
    matchScore: matchScore.overall,
    matchBreakdown: matchScore.breakdown,
    coverLetter: generateCoverLetter(student, placement)
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

  return { success: true, applicationId: application.id };
});

function generateCoverLetter(student: any, placement: any): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${placement.title} position at your company. As a ${student.level}-level ${student.department} student at ${student.university}, I am excited about the opportunity to contribute to your team and gain valuable industry experience.

My technical skills in ${(student.skills || []).slice(0, 3).join(', ')} align well with your requirements, and I am particularly eager to learn ${(placement.skillsToLearn || []).slice(0, 2).join(' and ')} during this placement.

I am confident that my academic background, combined with my passion for ${student.department.toLowerCase()}, makes me a strong candidate for this position. I look forward to the opportunity to discuss how I can contribute to your team.

Thank you for your consideration.

Best regards,
${student.firstName} ${student.lastName}`;
}