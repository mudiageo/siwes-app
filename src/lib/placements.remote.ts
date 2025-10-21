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
    .where(eq(placements.companyId, company.profile.id))
    .orderBy(desc(placements.createdAt));

  return companyPlacements;
});

const createPlacementSchema = v.object({
  title: v.string(),
  department: v.string(),
  description: v.string(),
  requirements: v.string(),
  duration: v.number(),
  slots: v.number(),
  salaryRange: v.string(),
  location: v.string(),
  isRemote: v.optional(v.boolean(), false),
  applicationDeadline: v.pipe(v.string(), v.transform(str => new Date(str))),
  startDate: v.pipe(v.string(), v.transform(str => new Date(str))),
  endDate: v.pipe(v.string(), v.transform(str => new Date(str))),
  requiredSkills: v.optional(v.array(v.string()), []),
  skillsToLearn: v.optional(v.array(v.string()), [])
});

// Create new placement
export const createPlacement = form(createPlacementSchema, async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();

  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const company = await getProfile();
  if (!company) throw new Error('Company profile not found');

  const [placement] = await db.insert(placements).values({
    companyId: company.profile.id,
    title: data.title,
    department: data.department,
    description: data.description,
    requirements: data.requirements,
    duration: data.duration,
    slots: data.slots,
    salaryRange: data.salaryRange,
    location: data.location,
    isRemote: data.isRemote,
    applicationDeadline: data.applicationDeadline,
    startDate: data.startDate,
    endDate: data.endDate,
    requiredSkills: data.requiredSkills,
    skillsToLearn: data.skillsToLearn,
    isActive: true
  }).returning();

  return { success: true, placementId: placement.id };
});


const updatePlacementSchema = v.object({
  placementId: v.string(),
  title: v.string(),
  department: v.string(),
  description: v.string(),
  requirements: v.string(),
  duration: v.number(),
  slots: v.number(),
  salaryRange: v.string(),
  location: v.string(),
  isRemote: v.boolean(),
  isActive: v.boolean(),
  requiredSkills: v.array(v.string()),
  skillsToLearn: v.array(v.string())
});

// Update placement
export const updatePlacement = form(updatePlacementSchema, async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  await db
    .update(placements)
    .set({
      title: data.title,
      department: data.department,
      description: data.description,
      requirements: data.requirements,
      duration: data.duration,
      slots: data.slots,
      salaryRange: data.salaryRange,
      location: data.location,
      isRemote: data.isRemote,
      isActive: data.isActive,
      requiredSkills: data.requiredSkills,
      skillsToLearn: data.skillsToLearn,
      updatedAt: new Date()
    })
    .where(eq(placements.id, data.placementId));

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
