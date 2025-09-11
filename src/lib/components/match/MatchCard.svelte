<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import type { MatchResult } from '$lib/services/matching.js';
	import Building2 from '@lucide/svelte/icons/building-2';
import MapPin from '@lucide/svelte/icons/map-pin';
import Calendar from '@lucide/svelte/icons/calendar';
import Users from '@lucide/svelte/icons/users';
import ExternalLink from '@lucide/svelte/icons/external-link';

	interface Props {
		match: MatchResult;
		showDetails?: boolean;
	}

	let { match, showDetails = false }: Props = $props();

	let placement = $derived(match.placement);
	let score = $derived(match.score);
	let reasons = $derived(match.reasons);

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-success-600';
		if (score >= 60) return 'text-warning-600';
		return 'text-error-600';
	}

	function getScoreVariant(score: number): 'default' | 'secondary' | 'destructive' {
		if (score >= 80) return 'default';
		if (score >= 60) return 'secondary';
		return 'destructive';
	}
</script>

<Card class="match-card">
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="space-y-1">
				<h3 class="text-lg font-semibold text-foreground">{placement.title}</h3>
				<div class="flex items-center space-x-2 text-sm text-muted-foreground">
					<Building2 class="h-4 w-4" />
					<span>Company Name</span>
				</div>
			</div>
			
			<div class="text-right">
				<div class="text-2xl font-bold {getScoreColor(score.overall * 100)}">
					{Math.round(score.overall * 100)}%
				</div>
				<Badge variant={getScoreVariant(score.overall * 100)} class="text-xs">
					{score.overall >= 0.8 ? 'Excellent' : score.overall >= 0.6 ? 'Good' : 'Fair'} Match
				</Badge>
			</div>
		</div>

		<!-- Details -->
		<div class="grid grid-cols-2 gap-4 text-sm">
			<div class="flex items-center space-x-2 text-muted-foreground">
				<MapPin class="h-4 w-4" />
				<span>{placement.location}</span>
			</div>
			<div class="flex items-center space-x-2 text-muted-foreground">
				<Calendar class="h-4 w-4" />
				<span>{placement.duration} weeks</span>
			</div>
			<div class="flex items-center space-x-2 text-muted-foreground">
				<Users class="h-4 w-4" />
				<span>{placement.filledSlots}/{placement.slots} filled</span>
			</div>
			<div class="text-muted-foreground">
				<span class="font-medium text-foreground">{placement.salaryRange || 'Unpaid'}</span>
			</div>
		</div>

		<!-- Skills -->
		<div class="space-y-2">
			<div class="text-sm font-medium text-foreground">Required Skills</div>
			<div class="flex flex-wrap gap-1">
				{#each (placement.requiredSkills || []).slice(0, 4) as skill}
					<Badge variant="outline" class="text-xs">{skill}</Badge>
				{/each}
				{#if (placement.requiredSkills || []).length > 4}
					<Badge variant="outline" class="text-xs">+{(placement.requiredSkills || []).length - 4} more</Badge>
				{/if}
			</div>
		</div>

		<!-- Match breakdown (when expanded) -->
		{#if showDetails}
			<div class="space-y-3 border-t border-border pt-4">
				<div class="text-sm font-medium text-foreground">Match Breakdown</div>
				
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Skills Match</span>
						<span class="font-medium">{score.breakdown.skillsScore}%</span>
					</div>
					<Progress value={score.breakdown.skillsScore} class="h-1.5" />
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Location</span>
						<span class="font-medium">{score.breakdown.locationScore}%</span>
					</div>
					<Progress value={score.breakdown.locationScore} class="h-1.5" />
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Industry</span>
						<span class="font-medium">{score.breakdown.industryScore}%</span>
					</div>
					<Progress value={score.breakdown.industryScore} class="h-1.5" />
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Level</span>
						<span class="font-medium">{score.breakdown.levelScore}%</span>
					</div>
					<Progress value={score.breakdown.levelScore} class="h-1.5" />
				</div>

				<!-- Reasons -->
				{#if reasons.length > 0}
					<div class="space-y-2">
						<div class="text-sm font-medium text-foreground">Why this matches</div>
						<ul class="space-y-1">
							{#each reasons as reason}
								<li class="text-sm text-muted-foreground flex items-center">
									<div class="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
									{reason}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex space-x-2 border-t border-border pt-4">
			<Button class="flex-1" size="sm">
				Apply Now
			</Button>
			<Button variant="outline" size="sm">
				<ExternalLink class="h-4 w-4" />
			</Button>
		</div>
	</div>
</Card>