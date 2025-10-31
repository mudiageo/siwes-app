import { query, form, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { students, companies, users } from '$lib/server/db/schema.js';
import { calculateStudentProfileCompleteness } from '$lib/utils.js'
import { eq } from 'drizzle-orm';

// Get user profile
export const getProfile = query(async () => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const user = session.user;
  let profile;

  if (user.userType === 'student') {
    const [studentProfile] = await db
      .select()
      .from(students)
      .where(eq(students.userId, user.id));
    profile = studentProfile;
  } else {
    const [companyProfile] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, user.id));
    profile = companyProfile;
  }

  return { user, profile };
});

// Update student profile
export const updateStudentProfile = form(v.object({
    firstName: v.pipe(v.string(), v.nonEmpty()),
    lastName: v.pipe(v.string(), v.nonEmpty()),
    phoneNumber: v.optional(v.string()),
    university: v.pipe(v.string(), v.nonEmpty()), 
    department: v.pipe(v.string(), v.nonEmpty()),
    level: v.pipe(v.union([v.string(), v.number()]), v.transform(val => typeof val === 'string' ? parseInt(val) : val)),
    cgpa: v.optional(v.pipe(v.union([v.string(), v.number()]), v.transform(val => typeof val === 'string' ? parseFloat(val) : val))),
    bio: v.optional(v.string()),
    resumeUrl: v.optional(v.pipe(v.string(), v.url())),
    linkedinUrl: v.optional(v.pipe(v.string(), v.url())),
    githubUrl: v.optional(v.pipe(v.string(), v.url())),
    portfolioUrl: v.optional(v.pipe(v.string(), v.url())),
    skills: v.optional(v.array(v.string()), []),
    desiredSkills: v.optional(v.array(v.string()), []),
    location: v.pipe(v.string(), v.nonEmpty()),
    preferredLocations: v.optional(v.array(v.string()), []),
    preferredIndustries: v.optional(v.array(v.string()), []),
  }),
  async ({ firstName, lastName, phoneNumber, university, department, level, cgpa, location, bio, resumeUrl, linkedinUrl, githubUrl, portfolioUrl, skills, desiredSkills, preferredLocations, preferredIndustries  }) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'student') {
    throw new Error('Student access required');
  }

  const { profile: student } = await getProfile();

  if (!student) throw new Error('Student profile not found');

  // Calculate profile completeness
  const profileCompleteness = calculateStudentProfileCompleteness({
    firstName, lastName, phoneNumber, university, department, level,
    cgpa, location, bio, skills, desiredSkills, preferredLocations,
    preferredIndustries, linkedinUrl, githubUrl, portfolioUrl
  });

  await db
    .update(students)
    .set({
      firstName,
      lastName,
      phoneNumber,
      university,
      department,
      level,
      cgpa,
      location,
      bio,
      resumeUrl,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      desiredSkills,
      preferredLocations,
      preferredIndustries,
      profileCompleteness,
      updatedAt: new Date()
    })
    .where(eq(students.id, student.id));
    
    getProfile().refresh;

  return { success: true, profileCompleteness };
});

// Update company profile
export const updateCompanyProfile = form(
  v.object({ 
    name: v.pipe(v.string(), v.nonEmpty()),
    industry: v.pipe(v.string(), v.nonEmpty()),
    location: v.pipe(v.string(), v.nonEmpty()),
    size: v.picklist(['startup', 'small', 'medium', 'large', 'enterprise']), 
    description: v.pipe(v.string(), v.nonEmpty()),
    website: v.optional(v.pipe(v.string(), v.url())),
    contactEmail: v.optional(v.pipe(v.string(), v.email())),
    contactPhone: v.optional(v.string()),
    establishedYear: v.optional(v.pipe(v.union([v.string(), v.number()]), v.transform(val => typeof val === 'string' ? parseInt(val) : val)))
  }), 
  async ({ name, industry, location, size, description, website, contactEmail, contactPhone, establishedYear}) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const { profile: company} = await getProfile();
  if (!company) throw new Error('Company profile not found');

  await db
    .update(companies)
    .set({
      name,
      industry,
      location,
      size,
      description,
      website,
      contactEmail,
      contactPhone,
      establishedYear,
      updatedAt: new Date()
    })
    .where(eq(companies.id, company.id));
    getProfile().refresh;

  return { success: true };
});

// Upload CV/Resume
export const uploadResume = command(
  v.object({
    fileUrl: v.string(),
    extractedSkills: v.array(v.string())
  }),
  async ({ fileUrl, extractedSkills }) => {
    const event = getRequestEvent();
    const session = await event.locals.auth();
    
    if (!session?.user || session.user.userType !== 'student') {
      throw new Error('Student access required');
    }

    const { profile: student } = await getProfile();
    if (!student) throw new Error('Student profile not found');

    // Update student profile with resume and extracted skills
    const existingSkills = student.skills || [];
    const newSkills = [...new Set([...existingSkills, ...extractedSkills])];

    await db
      .update(students)
      .set({
        resumeUrl: fileUrl,
        skills: newSkills,
        updatedAt: new Date()
      })
      .where(eq(students.id, student.id));
    getProfile().refresh;

    return { success: true, extractedSkills: extractedSkills.length };
  }
);

