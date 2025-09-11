import { db } from '$lib/server/db/index.js';
import { students, placements, companies, applications } from '$lib/server/db/schema.js';
import { calculateAIMatchScore, generateAICoverLetter, type MatchResult } from '$lib/server/ai-matching.js';
import { eq, and, sql, desc } from 'drizzle-orm';

/**
 * Find best matching placements for a student using AI scoring
 */
export async function findMatches(studentId: string, limit = 10): Promise<MatchResult[]> {
	// Get student profile
	const student = await db.query.students.findFirst({
		where: eq(students.userId, studentId)
	});

	if (!student) {
		throw new Error('Student profile not found');
	}

	// Get available placements with company info
	const availablePlacements = await db
		.select({
			placement: placements,
			company: companies
		})
		.from(placements)
		.innerJoin(companies, eq(placements.companyId, companies.userId))
		.where(eq(placements.status, 'active'))
		.orderBy(desc(placements.createdAt));

	// Calculate match scores for each placement
	const matchResults: MatchResult[] = [];
	
	for (const { placement, company } of availablePlacements) {
		const score = await calculateAIMatchScore(student, placement);
		
		// Generate match reasons
		const reasons = generateMatchReasons(student, placement, score);
		
		matchResults.push({
			placement: { ...placement, company },
			score,
			reasons
		});
	}

	// Sort by overall score and return top matches
	return matchResults
		.sort((a, b) => b.score.overall - a.score.overall)
		.slice(0, limit);
}

/**
 * Get detailed match analysis between student and specific placement
 */
export async function getMatchAnalysis(studentId: string, placementId: string) {
	const student = await db.query.students.findFirst({
		where: eq(students.userId, studentId)
	});

	if (!student) {
		throw new Error('Student profile not found');
	}

	const placementData = await db
		.select({
			placement: placements,
			company: companies
		})
		.from(placements)
		.innerJoin(companies, eq(placements.companyId, companies.userId))
		.where(eq(placements.id, placementId))
		.limit(1);

	if (!placementData.length) {
		throw new Error('Placement not found');
	}

	const { placement, company } = placementData[0];
	const score = await calculateAIMatchScore(student, placement);
	const reasons = generateMatchReasons(student, placement, score);
	
	// Check if student has already applied
	const existingApplication = await db.query.applications.findFirst({
		where: and(
			eq(applications.studentId, studentId),
			eq(applications.placementId, placementId)
		)
	});

	return {
		placement: { ...placement, company },
		score,
		reasons,
		hasApplied: !!existingApplication,
		applicationStatus: existingApplication?.status
	};
}

/**
 * Generate AI-powered cover letter for application
 */
export async function generateCoverLetter(studentId: string, placementId: string): Promise<string> {
	const student = await db.query.students.findFirst({
		where: eq(students.userId, studentId)
	});

	if (!student) {
		throw new Error('Student profile not found');
	}

	const placementData = await db
		.select({
			placement: placements,
			company: companies
		})
		.from(placements)
		.innerJoin(companies, eq(placements.companyId, companies.userId))
		.where(eq(placements.id, placementId))
		.limit(1);

	if (!placementData.length) {
		throw new Error('Placement not found');
	}

	const { placement, company } = placementData[0];
	return await generateAICoverLetter(student, placement, company);
}

/**
 * Get matching statistics for student dashboard
 */
export async function getMatchingStats(studentId: string) {
	const matches = await findMatches(studentId, 50); // Get more for stats
	
	const totalPlacements = await db
		.select({ count: sql<number>`count(*)` })
		.from(placements)
		.where(eq(placements.status, 'active'));

	const excellentMatches = matches.filter(m => m.score.overall >= 0.8).length;
	const goodMatches = matches.filter(m => m.score.overall >= 0.6 && m.score.overall < 0.8).length;
	const fairMatches = matches.filter(m => m.score.overall >= 0.4 && m.score.overall < 0.6).length;

	// Get student's applications
	const studentApplications = await db.query.applications.findMany({
		where: eq(applications.studentId, studentId),
		with: {
			placement: {
				with: {
					company: true
				}
			}
		}
	});

	return {
		totalPlacements: totalPlacements[0].count,
		totalMatches: matches.length,
		excellentMatches,
		goodMatches,
		fairMatches,
		applicationsCount: studentApplications.length,
		pendingApplications: studentApplications.filter(a => a.status === 'pending').length,
		acceptedApplications: studentApplications.filter(a => a.status === 'accepted').length,
		topMatches: matches.slice(0, 5)
	};
}

/**
 * Get recommended skills based on market trends and student profile
 */
export async function getSkillRecommendations(studentId: string) {
	const student = await db.query.students.findFirst({
		where: eq(students.userId, studentId)
	});

	if (!student) {
		throw new Error('Student profile not found');
	}

	// Get top skills from recent placements in student's department
	const departmentPlacements = await db.query.placements.findMany({
		where: eq(placements.department, student.department),
		orderBy: desc(placements.createdAt),
		limit: 100
	});

	// Count skill frequency
	const skillCounts: Record<string, number> = {};
	departmentPlacements.forEach(placement => {
		(placement.requiredSkills || []).forEach(skill => {
			skillCounts[skill] = (skillCounts[skill] || 0) + 1;
		});
		(placement.skillsToLearn || []).forEach(skill => {
			skillCounts[skill] = (skillCounts[skill] || 0) + 1;
		});
	});

	// Filter out skills student already has
	const currentSkills = (student.skills || []).map(s => s.toLowerCase());
	const recommendedSkills = Object.entries(skillCounts)
		.filter(([skill]) => !currentSkills.includes(skill.toLowerCase()))
		.sort(([,a], [,b]) => b - a)
		.slice(0, 10)
		.map(([skill, count]) => ({
			skill,
			frequency: count,
			category: categorizeSkill(skill),
			priority: calculateSkillPriority(skill, student.department)
		}));

	return {
		recommended: recommendedSkills,
		trending: recommendedSkills.slice(0, 5),
		departmentSpecific: recommendedSkills.filter(s => s.category === 'technical').slice(0, 3)
	};
}

function generateMatchReasons(student: any, placement: any, score: any): string[] {
	const reasons: string[] = [];

	// Skills alignment
	if (score.breakdown.skillsScore >= 70) {
		reasons.push(`Strong skills match - you have ${Math.round(score.breakdown.skillsScore)}% of required skills`);
	} else if (score.breakdown.skillsScore >= 40) {
		reasons.push(`Good foundation - ${Math.round(score.breakdown.skillsScore)}% skills match with room to grow`);
	}

	// Location preference
	if (score.breakdown.locationScore >= 80) {
		reasons.push(`Perfect location match in ${placement.location}`);
	} else if (score.breakdown.locationScore >= 60) {
		reasons.push(`Good location fit - manageable commute or preferred region`);
	}

	// Industry alignment
	if (score.breakdown.industryScore >= 80) {
		reasons.push(`Excellent industry fit for ${student.department} background`);
	}

	// Level appropriateness
	if (score.breakdown.levelScore >= 80) {
		reasons.push(`Role perfectly suited for your ${student.level}-level experience`);
	}

	// Learning opportunities
	const skillsToLearn = placement.skillsToLearn || [];
	if (skillsToLearn.length > 0) {
		reasons.push(`Great learning opportunity in ${skillsToLearn.slice(0, 2).join(', ')}`);
	}

	// AI insights
	if (score.breakdown.nlpScore >= 70) {
		reasons.push(`AI analysis shows strong compatibility based on your profile`);
	}

	// Company reputation (if available)
	if (placement.company?.verified) {
		reasons.push(`Verified company with established internship programs`);
	}

	return reasons.length > 0 ? reasons : ['This placement offers valuable experience in your field'];
}

function categorizeSkill(skill: string): string {
	const skillLower = skill.toLowerCase();
	
	if (['javascript', 'python', 'java', 'c++', 'react', 'vue', 'angular', 'node'].some(tech => skillLower.includes(tech))) {
		return 'technical';
	}
	
	if (['leadership', 'communication', 'teamwork', 'problem solving'].some(soft => skillLower.includes(soft))) {
		return 'soft';
	}
	
	if (['aws', 'docker', 'kubernetes', 'ci/cd', 'devops'].some(tool => skillLower.includes(tool))) {
		return 'tools';
	}
	
	return 'general';
}

function calculateSkillPriority(skill: string, department: string): 'high' | 'medium' | 'low' {
	const skillLower = skill.toLowerCase();
	const deptLower = department.toLowerCase();
	
	// High priority for department-specific skills
	if (deptLower.includes('computer') && ['javascript', 'python', 'react', 'node', 'database'].some(s => skillLower.includes(s))) {
		return 'high';
	}
	
	if (deptLower.includes('electrical') && ['embedded', 'arduino', 'raspberry pi', 'matlab'].some(s => skillLower.includes(s))) {
		return 'high';
	}
	
	if (deptLower.includes('mechanical') && ['autocad', 'solidworks', 'ansys', 'catia'].some(s => skillLower.includes(s))) {
		return 'high';
	}
	
	// Medium priority for transferable technical skills
	if (['git', 'agile', 'scrum', 'testing'].some(s => skillLower.includes(s))) {
		return 'medium';
	}
	
	return 'low';
}
