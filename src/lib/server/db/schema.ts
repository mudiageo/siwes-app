import { pgTable, text, integer, real, boolean, timestamp, json, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('user', {
  id: text('id')
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	email: text('email').notNull().unique(),
  password: text('password'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  name: text('name'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),  
  phone: text('phone'),
	userType: text('user_type', { enum: ['student', 'company'] }).notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  userTypeIdx: index('users_user_type_idx').on(table.userType),
}));

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const students = pgTable('students', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	applicationId: text('application_id').references(() => applications.id).notNull(),
	senderId: text('sender_id').references(() => users.id).notNull(),
	content: text('content').notNull(),
	isRead: boolean('is_read').default(false),
	sentAt: timestamp('sent_at').defaultNow()
});

export const notifications = pgTable('notifications', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
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