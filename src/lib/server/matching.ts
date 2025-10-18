import { db } from '$lib/server/db';
import { students, placements, companies, applications } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Student, Placement, Company } from '$lib/server/db/schema';
import { GEMINI_API_KEY } from '$env/static/private';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface MatchScore {
    overall: number;
    breakdown: {
        skillsScore: number;
        locationScore: number;
        industryScore: number;
        levelScore: number;
        nlpScore?: number; // Optional for traditional matching
    };
}

export interface MatchResult {
    placement: Placement & { company: Company };
    score: MatchScore;
    reasons: string[];
}

// =============================================================================
// DATABASE FUNCTIONS
// =============================================================================

/**
 * Find matches for a student from the database
 * Supports both traditional and AI-powered matching
 */
export async function findMatches(studentId: string, useAI: boolean = true): Promise<MatchResult[]> {
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

        // Use AI or traditional scoring based on flag
        const score = useAI 
            ? await calculateAIMatchScore(student, placement)
            : calculateMatchScore(student, placement);
        
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

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Traditional rule-based matching (no AI)
 */
export function calculateMatchScore(student: Student, placement: Placement): MatchScore {
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

/**
 * AI-powered matching with Gemini NLP integration
 */
export async function calculateAIMatchScore(student: Student, placement: Placement): Promise<MatchScore> {
    // Traditional scoring components
    const skillsScore = calculateSkillsMatch(student.skills || [], placement.requiredSkills || []);
    const locationScore = calculateLocationMatch(student.location, student.preferredLocations || [], placement.location);
    const industryScore = calculateIndustryMatch(student.preferredIndustries || [], placement.department);
    const levelScore = calculateLevelMatch(student.level, placement.title);
    
    // AI-powered NLP scoring
    const nlpScore = await calculateNLPMatch(student, placement);

    // Weighted calculation with NLP (adjusted weights)
    const overall = (
        skillsScore * 0.35 +
        locationScore * 0.20 +
        industryScore * 0.15 +
        levelScore * 0.15 +
        nlpScore * 0.15
    );

    return {
        overall: Math.round(overall * 100) / 100,
        breakdown: {
            skillsScore: Math.round(skillsScore * 100),
            locationScore: Math.round(locationScore * 100),
            industryScore: Math.round(industryScore * 100),
            levelScore: Math.round(levelScore * 100),
            nlpScore: Math.round(nlpScore * 100)
        }
    };
}

// =============================================================================
// COMPONENT SCORING FUNCTIONS
// =============================================================================

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

// =============================================================================
// AI/NLP FUNCTIONS
// =============================================================================

async function generateText(options: { prompt: string; model: string }): Promise<{ text: string }> {
    const { prompt, model } = options;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}`, {
            method: 'POST',
            headers: {
				'Content-Type': 'application/json',
				'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return {
                text: data.candidates[0].content.parts[0].text
            };
        }

        throw new Error('Invalid response from Gemini API');
    } catch (e) {
        console.error('Gemini API error:', e);
        throw e;
    }
}

async function calculateNLPMatch(student: Student, placement: Placement): Promise<number> {
    try {
        const prompt = `
Analyze the compatibility between this student and placement opportunity. Return a score from 0 to 1.

Student Profile:
- Department: ${student.department}
- Level: ${student.level}
- Skills: ${(student.skills || []).join(', ')}
- Bio: ${student.bio || 'No bio provided'}
- Desired Skills: ${(student.desiredSkills || []).join(', ')}

Placement:
- Title: ${placement.title}
- Department: ${placement.department}
- Description: ${placement.description}
- Required Skills: ${(placement.requiredSkills || []).join(', ')}
- Skills to Learn: ${(placement.skillsToLearn || []).join(', ')}
- Requirements: ${placement.requirements}

Consider:
1. Alignment between student's background and placement requirements
2. Growth potential and learning opportunities
3. Career progression relevance
4. Skill development match

Respond with only a number between 0 and 1 (e.g., 0.85).
`;

        const { text } = await generateText({
            model: 'gemini-2.0-flash-exp',
            prompt
        });

        const score = parseFloat(text.trim());
        return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch (error) {
        console.error('NLP matching error:', error);
        return 0.5; // Fallback score
    }
}

/**
 * Generate an AI-powered cover letter for a student application
 */
export async function generateAICoverLetter(student: Student, placement: Placement, company: Company): Promise<string> {
    try {
        const prompt = `
Generate a professional cover letter for a Nigerian engineering student applying for an industrial placement.

Student Details:
- Name: ${student.firstName} ${student.lastName}
- University: ${student.university}
- Department: ${student.department}
- Level: ${student.level}
- Skills: ${(student.skills || []).join(', ')}
- Bio: ${student.bio || ''}

Placement Details:
- Position: ${placement.title}
- Company: ${company.name}
- Department: ${placement.department}
- Required Skills: ${(placement.requiredSkills || []).join(', ')}
- Skills to Learn: ${(placement.skillsToLearn || []).join(', ')}

Requirements:
- Professional tone appropriate for Nigerian corporate environment
- Highlight relevant skills and academic background
- Express enthusiasm for learning opportunities
- Keep it concise (200-300 words)
- Include proper salutation and closing
`;

        const { text } = await generateText({
            model: 'gemini-2.0-flash-exp',
            prompt
        });

        return text.trim();
    } catch (error) {
        console.error('Cover letter generation error:', error);
        return generateFallbackCoverLetter(student, placement, company);
    }
}

function generateFallbackCoverLetter(student: Student, placement: Placement, company: Company): string {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${placement.title} position at ${company.name}. As a ${student.level}-level ${student.department} student at ${student.university}, I am excited about the opportunity to contribute to your team and gain valuable industry experience.

My technical skills in ${(student.skills || []).slice(0, 3).join(', ')} align well with your requirements, and I am particularly eager to learn ${(placement.skillsToLearn || []).slice(0, 2).join(' and ')} during this placement.

I am confident that my academic background, combined with my passion for ${student.department.toLowerCase()}, makes me a strong candidate for this position. I look forward to the opportunity to discuss how I can contribute to your team.

Thank you for your consideration.

Best regards,
${student.firstName} ${student.lastName}`;
}

// =============================================================================
// MATCH REASONS GENERATION
// =============================================================================

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

    // Add NLP insight if available
    if (score.breakdown.nlpScore !== undefined && score.breakdown.nlpScore >= 70) {
        reasons.push('AI recommends this match');
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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