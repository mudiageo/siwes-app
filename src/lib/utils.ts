import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
	
	if (diffInHours < 1) return 'Just now';
	if (diffInHours < 24) return `${diffInHours}h ago`;
	
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) return `${diffInDays}d ago`;
	
	return formatDate(date);
}

export function calculateDaysUntil(date: Date): number {
	const now = new Date();
	const diffInMs = date.getTime() - now.getTime();
	return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

export function formatSalary(range: string): string {
	return range.replace(/₦/g, '₦ ');
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
	return `${firstName[0]?.toUpperCase() || ''}${lastName[0]?.toUpperCase() || ''}`;
}

export function generateMatchReasons(score: { breakdown: { skillsScore: number; locationScore: number; industryScore: number; levelScore: number } }): string[] {
	const reasons: string[] = [];
	
	if (score.breakdown.skillsScore >= 80) {
		reasons.push(`Strong skills match (${score.breakdown.skillsScore}%)`);
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
	
	return reasons.slice(0, 3);
}
