import { query, form, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db/index.js';
import { students, companies, users } from '$lib/server/db/schema.js';
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
export const updateStudentProfile = form(async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'student') {
    throw new Error('Student access required');
  }

  const student = session.user.profile;
  if (!student) throw new Error('Student profile not found');

  const firstName = data.get('firstName') as string;
  const lastName = data.get('lastName') as string;
  const phoneNumber = data.get('phoneNumber') as string;
  const university = data.get('university') as string;
  const department = data.get('department') as string;
  const level = parseInt(data.get('level') as string);
  const cgpa = parseFloat(data.get('cgpa') as string);
  const location = data.get('location') as string;
  const bio = data.get('bio') as string;
  const linkedinUrl = data.get('linkedinUrl') as string;
  const githubUrl = data.get('githubUrl') as string;
  const portfolioUrl = data.get('portfolioUrl') as string;
  
  // Parse skills and preferences
  const skills = JSON.parse(data.get('skills') as string || '[]');
  const desiredSkills = JSON.parse(data.get('desiredSkills') as string || '[]');
  const preferredLocations = JSON.parse(data.get('preferredLocations') as string || '[]');
  const preferredIndustries = JSON.parse(data.get('preferredIndustries') as string || '[]');

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

  return { success: true, profileCompleteness };
});

// Update company profile
export const updateCompanyProfile = form(async (data) => {
  const event = getRequestEvent();
  const session = await event.locals.auth();
  
  if (!session?.user || session.user.userType !== 'company') {
    throw new Error('Company access required');
  }

  const company = session.user.profile;
  if (!company) throw new Error('Company profile not found');

  const name = data.get('name') as string;
  const industry = data.get('industry') as string;
  const location = data.get('location') as string;
  const size = data.get('size') as string;
  const description = data.get('description') as string;
  const website = data.get('website') as string;
  const contactEmail = data.get('contactEmail') as string;
  const contactPhone = data.get('contactPhone') as string;
  const establishedYear = parseInt(data.get('establishedYear') as string);

  await db
    .update(companies)
    .set({
      name,
      industry,
      location,
      size: size as any,
      description,
      website,
      contactEmail,
      contactPhone,
      establishedYear,
      updatedAt: new Date()
    })
    .where(eq(companies.id, company.id));

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

    const student = session.user.profile;
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

    return { success: true, extractedSkills: extractedSkills.length };
  }
);

function calculateStudentProfileCompleteness(profile: any): number {
  const fields = [
    'firstName', 'lastName', 'phoneNumber', 'university', 'department',
    'level', 'cgpa', 'location', 'bio', 'linkedinUrl'
  ];
  
  let completedFields = 0;
  
  fields.forEach(field => {
    if (profile[field] && profile[field] !== '') {
      completedFields++;
    }
  });

  // Add weight for skills and preferences
  if (profile.skills && profile.skills.length >= 3) completedFields += 0.5;
  if (profile.desiredSkills && profile.desiredSkills.length >= 2) completedFields += 0.5;
  if (profile.preferredLocations && profile.preferredLocations.length >= 1) completedFields += 0.5;
  if (profile.preferredIndustries && profile.preferredIndustries.length >= 1) completedFields += 0.5;

  return Math.min((completedFields / (fields.length + 2)) * 100, 100);
}
