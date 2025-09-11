import { db } from '$lib/db/index.js';
import { students, placements, companies, applications } from '$lib/db/schema.js';
import { eq, and, not, inArray } from 'drizzle-orm';
import type { Student, Placement, Company } from '$lib/db/schema.js';

export interface MatchScore {
	overall: number;
	breakdown: {
		skillsScore: number;
		locationScore: number;
		industryScore: number;
		levelScore: number;
	};
}

export interface MatchResult {
	placement: Placement & { company: Company };
	score: MatchScore;
	reasons: string[];
}

export async function findMatches(studentId: string): Promise<MatchResult[]> {
	// Get student profile
	const [student] = await db.select().from(students).where(eq(students.id, studentId));
	if (!student) return [];

	// Get all active placements with companies
	const placementsWithCompanies = await db
		.select({
			placement: placements,
			company: companies
		})
		.from(placements)
		.innerJoin(companies, eq(placements.companyId, companies.id))
		.where(eq(placements.isActive, true));

	// Get existing applications to exclude
	const existingApplications = await db
		.select({ placementId: applications.placementId })
		.from(applications)
		.where(eq(applications.studentId, studentId));
	
	const appliedPlacementIds = existingApplications.map(app => app.placementId);

	// Calculate matches
	const matches: MatchResult[] = [];
	
	for (const { placement, company } of placementsWithCompanies) {
		// Skip if already applied
		if (appliedPlacementIds.includes(placement.id)) continue;

		const score = calculateMatchScore(student, placement);
		const reasons = generateMatchReasons(student, placement, score);

		matches.push({
			placement: { ...placement, company },
			score,
			reasons
		});
	}

	// Sort by match score
	return matches.sort((a, b) => b.score.overall - a.score.overall);
}

function calculateMatchScore(student: Student, placement: Placement): MatchScore {
	// Skills matching (40% weight)
	const skillsScore = calculateSkillsMatch(student.skills || [], placement.requiredSkills || []);
	
	// Location matching (25% weight)
	const locationScore = calculateLocationMatch(
		student.location, 
		student.preferredLocations || [], 
		placement.location
	);
	
	// Industry matching (20% weight)
	const industryScore = calculateIndustryMatch(
		student.preferredIndustries || [], 
		placement.department
	);
	
	// Level matching (15% weight)
	const levelScore = calculateLevelMatch(student.level, placement.title);

	const overall = (
		skillsScore * 0.4 +
		locationScore * 0.25 +
		industryScore * 0.2 +
		levelScore * 0.15
	);

	return {
		overall: Math.round(overall * 100) / 100,
		breakdown: {
			skillsScore: Math.round(skillsScore * 100),
			locationScore: Math.round(locationScore * 100),
			industryScore: Math.round(industryScore * 100),
			levelScore: Math.round(levelScore * 100)
		}
	};
}

function calculateSkillsMatch(studentSkills: string[], requiredSkills: string[]): number {
	if (requiredSkills.length === 0) return 0.8;
	
	const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase().trim());
	const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase().trim());
	
	let matches = 0;
	let partialMatches = 0;
	
	for (const required of normalizedRequiredSkills) {
		const exactMatch = normalizedStudentSkills.includes(required);
		if (exactMatch) {
			matches++;
			continue;
		}
		
		const partialMatch = normalizedStudentSkills.some(skill => 
			skill.includes(required) || required.includes(skill) ||
			areRelatedSkills(skill, required)
		);
		
		if (partialMatch) {
			partialMatches++;
		}
	}
	
	const score = (matches + partialMatches * 0.5) / requiredSkills.length;
	return Math.min(score, 1.0);
}

function calculateLocationMatch(studentLocation: string, preferredLocations: string[], placementLocation: string): number {
	const normalizedStudentLocation = studentLocation.toLowerCase().trim();
	const normalizedPlacementLocation = placementLocation.toLowerCase().trim();
	const normalizedPreferred = preferredLocations.map(loc => loc.toLowerCase().trim());
	
	if (normalizedStudentLocation === normalizedPlacementLocation) {
		return 1.0;
	}
	
	if (normalizedPreferred.includes(normalizedPlacementLocation)) {
		return 0.9;
	}
	
	if (isSameRegion(normalizedStudentLocation, normalizedPlacementLocation)) {
		return 0.7;
	}
	
	if (normalizedPlacementLocation.includes('remote')) {
		return 0.8;
	}
	
	return 0.3;
}

function calculateIndustryMatch(preferredIndustries: string[], placementDepartment: string): number {
	if (preferredIndustries.length === 0) return 0.7;
	
	const normalizedPreferred = preferredIndustries.map(ind => ind.toLowerCase().trim());
	const normalizedDepartment = placementDepartment.toLowerCase().trim();
	
	if (normalizedPreferred.includes(normalizedDepartment)) {
		return 1.0;
	}
	
	for (const preferred of normalizedPreferred) {
		if (areRelatedIndustries(preferred, normalizedDepartment)) {
			return 0.8;
		}
	}
	
	return 0.4;
}

function calculateLevelMatch(studentLevel: number, placementTitle: string): number {
	const normalizedTitle = placementTitle.toLowerCase();
	
	if (studentLevel >= 300) {
		if (normalizedTitle.includes('senior') || normalizedTitle.includes('lead')) {
			return 0.9;
		}
		if (normalizedTitle.includes('intermediate') || normalizedTitle.includes('developer')) {
			return 1.0;
		}
		return 0.8;
	}
	
	if (normalizedTitle.includes('intern') || normalizedTitle.includes('junior') || normalizedTitle.includes('trainee')) {
		return 1.0;
	}
	
	return 0.6;
}

function areRelatedSkills(skill1: string, skill2: string): boolean {
	const relatedSkillsMap: { [key: string]: string[] } = {
		'javascript': ['js', 'node', 'react', 'vue', 'angular'],
		'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy'],
		'java': ['spring', 'hibernate', 'maven', 'gradle'],
		'react': ['javascript', 'jsx', 'redux', 'next'],
		'vue': ['javascript', 'vuex', 'nuxt'],
		'angular': ['javascript', 'typescript', 'rxjs'],
		'database': ['sql', 'mysql', 'postgresql', 'mongodb'],
		'aws': ['cloud', 'ec2', 's3', 'lambda'],
		'docker': ['kubernetes', 'containerization', 'devops']
	};
	
	for (const [key, related] of Object.entries(relatedSkillsMap)) {
		if ((skill1.includes(key) && related.some(r => skill2.includes(r))) ||
			(skill2.includes(key) && related.some(r => skill1.includes(r)))) {
			return true;
		}
	}
	
	return false;
}

function isSameRegion(location1: string, location2: string): boolean {
	const nigerianStates = {
		'north': ['kano', 'kaduna', 'katsina', 'sokoto', 'kebbi', 'zamfara', 'jigawa', 'bauchi', 'gombe', 'plateau', 'borno', 'yobe', 'adamawa', 'taraba', 'benue', 'nasarawa', 'niger', 'kwara', 'kogi', 'fct'],
		'south': ['lagos', 'ogun', 'oyo', 'osun', 'ondo', 'ekiti', 'edo', 'delta', 'rivers', 'bayelsa', 'cross river', 'akwa ibom', 'abia', 'imo', 'enugu', 'anambra', 'ebonyi']
	};
	
	for (const [region, states] of Object.entries(nigerianStates)) {
		const loc1InRegion = states.some(state => location1.includes(state));
		const loc2InRegion = states.some(state => location2.includes(state));
		
		if (loc1InRegion && loc2InRegion) {
			return true;
		}
	}
	
	return false;
}

function areRelatedIndustries(industry1: string, industry2: string): boolean {
	const relatedIndustries: { [key: string]: string[] } = {
		'oil': ['energy', 'petroleum', 'gas', 'upstream', 'downstream'],
		'tech': ['software', 'it', 'computer', 'digital', 'startup'],
		'manufacturing': ['production', 'industrial', 'factory', 'engineering'],
		'finance': ['banking', 'fintech', 'financial', 'investment'],
		'telecommunications': ['telecom', 'mobile', 'network', 'communication']
	};
	
	for (const [key, related] of Object.entries(relatedIndustries)) {
		if ((industry1.includes(key) && related.some(r => industry2.includes(r))) ||
			(industry2.includes(key) && related.some(r => industry1.includes(r)))) {
			return true;
		}
	}
	
	return false;
}

function generateMatchReasons(student: Student, placement: Placement, score: MatchScore): string[] {
	const reasons: string[] = [];
	
	if (score.breakdown.skillsScore >= 80) {
		reasons.push(`Strong skills match (${score.breakdown.skillsScore}%)`);
	} else if (score.breakdown.skillsScore >= 60) {
		reasons.push(`Good skills alignment (${score.breakdown.skillsScore}%)`);
	}
	
	if (score.breakdown.locationScore >= 90) {
		reasons.push('Perfect location match');
	} else if (score.breakdown.locationScore >= 70) {
		reasons.push('Good location fit');
	}
	
	if (score.breakdown.industryScore >= 80) {
		reasons.push('Excellent industry alignment');
	}
	
	if (score.breakdown.levelScore >= 80) {
		reasons.push('Perfect for your academic level');
	}
	
	const skillsToLearn = placement.skillsToLearn || [];
	const studentSkills = student.skills || [];
	const newSkills = skillsToLearn.filter(skill => 
		!studentSkills.some(studentSkill => 
			studentSkill.toLowerCase().includes(skill.toLowerCase())
		)
	);
	
	if (newSkills.length > 0) {
		reasons.push(`Learn ${newSkills.slice(0, 2).join(', ')}${newSkills.length > 2 ? ' and more' : ''}`);
	}
	
	return reasons.slice(0, 4);
}