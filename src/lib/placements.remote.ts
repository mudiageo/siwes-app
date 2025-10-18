import { query, form, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { placements, companies, applications, students } from '$lib/server/db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { getProfile } from './profile.remote'

// Get placement details
export const getPlacement = query(v.string(), async (placementId) => {
  const [placement] = await db
    .select({
      placement: placements,
      company: companies
    })
    .from(placements)
    .innerJoin(companies, eq(placements.companyId, companies.id))
    .where(eq(placements.id, placementId));

  if (!placement) {
    throw new Error('Placement not found');
  }

  return placement;
});

// Get company placements
export const getCompanyPlacements = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const company = await getProfile();
  if (!company) throw new Error('Company profile not found');

  const companyPlacements = await db
    .select()
    .from(placements)
    .where(eq(placements.companyId, company.id))
    .orderBy(desc(placements.createdAt));

  return { placements: companyPlacements };
});

// Create new placement
export const createPlacement = form(async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const company = await getProfile();
  if (!company) throw new Error('Company profile not found');

  const title = data.get('title') as string;
  const department = data.get('department') as string;
  const description = data.get('description') as string;
  const requirements = data.get('requirements') as string;
  const duration = parseInt(data.get('duration') as string);
  const slots = parseInt(data.get('slots') as string);
  const salaryRange = data.get('salaryRange') as string;
  const location = data.get('location') as string;
  const isRemote = data.get('isRemote') === 'true';
  const applicationDeadline = new Date(data.get('applicationDeadline') as string);
  const startDate = new Date(data.get('startDate') as string);
  const endDate = new Date(data.get('endDate') as string);

  // Parse skills
  const requiredSkills = JSON.parse(data.get('requiredSkills') as string || '[]');
  const skillsToLearn = JSON.parse(data.get('skillsToLearn') as string || '[]');

  const [placement] = await db.insert(placements).values({
    companyId: company.id,
    title,
    department,
    description,
    requirements,
    duration,
    slots,
    salaryRange,
    location,
    isRemote,
    applicationDeadline,
    startDate,
    endDate,
    requiredSkills,
    skillsToLearn,
    isActive: true
  }).returning();

  return { success: true, placementId: placement.id };
});

// Update placement
export const updatePlacement = form(async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const placementId = data.get('placementId') as string;
  const title = data.get('title') as string;
  const department = data.get('department') as string;
  const description = data.get('description') as string;
  const requirements = data.get('requirements') as string;
  const duration = parseInt(data.get('duration') as string);
  const slots = parseInt(data.get('slots') as string);
  const salaryRange = data.get('salaryRange') as string;
  const location = data.get('location') as string;
  const isRemote = data.get('isRemote') === 'true';
  const isActive = data.get('isActive') === 'true';

  const requiredSkills = JSON.parse(data.get('requiredSkills') as string || '[]');
  const skillsToLearn = JSON.parse(data.get('skillsToLearn') as string || '[]');

  await db
    .update(placements)
    .set({
      title,
      department,
      description,
      requirements,
      duration,
      slots,
      salaryRange,
      location,
      isRemote,
      isActive,
      requiredSkills,
      skillsToLearn,
      updatedAt: new Date()
    })
    .where(eq(placements.id, placementId));

  return { success: true };
});

// Toggle placement active status
export const togglePlacementStatus = command(
  v.object({
    placementId: v.string(),
    isActive: v.boolean()
  }),
  async ({ placementId, isActive }) => {
    const event = getRequestEvent();
    const session = await event.locals.auth();
    
    if (!session?.user || session.user.userType !== 'company') {
      throw new Error('Company access required');
    }

    await db
      .update(placements)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(placements.id, placementId));

    return { success: true };
  }
);

// Get placement applications (for company)
export const getPlacementApplications = query(v.string(), async (placementId) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const placementApplications = await db
    .select({
      application: applications,
      student: students,
      placement: placements
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.id))
    .innerJoin(placements, eq(applications.placementId, placements.id))
    .where(eq(applications.placementId, placementId))
    .orderBy(desc(applications.appliedAt));

  return { applications: placementApplications };
});

// Get all active placements for search
export const searchPlacements = query(
  v.optional(v.object({
    search: v.optional(v.string()),
    industry: v.optional(v.string()),
    location: v.optional(v.string()),
    duration: v.optional(v.string()),
    isRemote: v.optional(v.boolean())
  })),
  async (filters = {}) => {
    let query = db
      .select({
        placement: placements,
        company: companies
      })
      .from(placements)
      .innerJoin(companies, eq(placements.companyId, companies.id))
      .where(eq(placements.isActive, true));

    const allPlacements = await query.orderBy(desc(placements.createdAt));
    
    // Apply filters
    let filteredPlacements = allPlacements;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPlacements = filteredPlacements.filter(p => 
        p.placement.title.toLowerCase().includes(searchTerm) ||
        p.placement.description.toLowerCase().includes(searchTerm) ||
        p.company.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.industry) {
      filteredPlacements = filteredPlacements.filter(p => 
        p.placement.department.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.location) {
      filteredPlacements = filteredPlacements.filter(p => 
        p.placement.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.duration) {
      filteredPlacements = filteredPlacements.filter(p => {
        const duration = p.placement.duration;
        if (filters.duration === '< 20') return duration < 20;
        if (filters.duration === '20-24') return duration >= 20 && duration <= 24;
        if (filters.duration === '> 24') return duration > 24;
        return true;
      });
    }

    if (filters.isRemote !== undefined) {
      filteredPlacements = filteredPlacements.filter(p => 
        p.placement.isRemote === filters.isRemote
      );
    }

    return { placements: filteredPlacements, filters };
  }
);
