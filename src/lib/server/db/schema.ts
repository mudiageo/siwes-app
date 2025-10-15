import { pgTable, text, integer, real, boolean, timestamp, json, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Better Auth core schema
export const users = pgTable('user', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  userType: text('user_type').notNull(),
  isActive: boolean('is_active').default(true)
}, (table) => [
	index('users_email_idx').on(table.email),
	index('users_user_type_idx').on(table.userType)
]);

export const sessions = pgTable('session', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by')
});

export const accounts = pgTable('account', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull()
});

export const verifications = pgTable('verification', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
});

export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
});

// Application-specific tables
export const students = pgTable('students', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: text('user_id').references(() => users.id).notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	phoneNumber: text('phone_number'),
	university: text('university').notNull(),
	department: text('department').notNull(),
	level: integer('level').notNull(),
	cgpa: real('cgpa'),
	skills: json('skills').$type<string[]>().default([]),
	desiredSkills: json('desired_skills').$type<string[]>().default([]),
	location: text('location').notNull(),
	preferredLocations: json('preferred_locations').$type<string[]>().default([]),
	preferredIndustries: json('preferred_industries').$type<string[]>().default([]),
	resumeUrl: text('resume_url'),
	bio: text('bio'),
	linkedinUrl: text('linkedin_url'),
	githubUrl: text('github_url'),
	portfolioUrl: text('portfolio_url'),
	profileCompleteness: real('profile_completeness').default(0),
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const companies = pgTable('companies', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: text('user_id').references(() => users.id).notNull(),
	name: text('name').notNull(),
	industry: text('industry').notNull(),
	location: text('location').notNull(),
	size: text('size', { enum: ['startup', 'small', 'medium', 'large', 'enterprise'] }).notNull(),
	description: text('description').notNull(),
	website: text('website'),
	logoUrl: text('logo_url'),
	contactEmail: text('contact_email'),
	contactPhone: text('contact_phone'),
	establishedYear: integer('established_year'),
	isVerified: boolean('is_verified').default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const placements = pgTable('placements', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	companyId: text('company_id').references(() => companies.id).notNull(),
	title: text('title').notNull(),
	department: text('department').notNull(),
	description: text('description').notNull(),
	requiredSkills: json('required_skills').$type<string[]>().default([]),
	skillsToLearn: json('skills_to_learn').$type<string[]>().default([]),
	requirements: text('requirements').notNull(),
	duration: integer('duration').notNull(), // in weeks
	slots: integer('slots').notNull(),
	filledSlots: integer('filled_slots').default(0),
	salaryRange: text('salary_range'),
	location: text('location').notNull(),
	applicationDeadline: timestamp('application_deadline'),
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	isActive: boolean('is_active').default(true),
	isRemote: boolean('is_remote').default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const applications = pgTable('applications', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	studentId: text('student_id').references(() => students.id).notNull(),
	placementId: text('placement_id').references(() => placements.id).notNull(),
	status: text('status', { 
		enum: ['pending', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn'] 
	}).default('pending'),
	matchScore: real('match_score').notNull(),
	matchBreakdown: json('match_breakdown').$type<{
		skillsScore: number;
		locationScore: number;
		industryScore: number;
		levelScore: number;
	}>().notNull(),
	coverLetter: text('cover_letter'),
	additionalDocuments: json('additional_documents').$type<string[]>().default([]),
	appliedAt: timestamp('applied_at').defaultNow(),
	reviewedAt: timestamp('reviewed_at'),
	interviewDate: timestamp('interview_date'),
	notes: text('notes'),
	feedback: text('feedback')
});

export const messages = pgTable('messages', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	applicationId: text('application_id').references(() => applications.id).notNull(),
	senderId: text('sender_id').references(() => users.id).notNull(),
	content: text('content').notNull(),
	isRead: boolean('is_read').default(false),
	sentAt: timestamp('sent_at').defaultNow()
});

export const notifications = pgTable('notifications', {
	id: text('id').primaryKey().default(sql`gen_random_uuid()`),
	userId: text('user_id').references(() => users.id).notNull(),
	title: text('title').notNull(),
	message: text('message').notNull(),
	type: text('type', { enum: ['match', 'application', 'message', 'system'] }).notNull(),
	isRead: boolean('is_read').default(false),
	actionUrl: text('action_url'),
	createdAt: timestamp('created_at').defaultNow()
});

// Types
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type UserType = 'student' | 'company';
export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';