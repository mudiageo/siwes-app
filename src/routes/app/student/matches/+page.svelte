<script lang="ts">
	import { goto } from '$app/navigation';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import MatchCard from '$lib/components/match/MatchCard.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { industries, nigerianStates } from '$lib/services/sample-data.js';
	import { findMatches, getSkillRecommendations } from '$lib/matching.remote';
	import { getProfile } from '$lib/profile.remote';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedIndustry = $state('');
	let selectedLocation = $state('');
	let selectedDuration = $state('');
	let sortBy = $state('match-score');
	let showFilters = $state(false);
	let refreshing = $state(false);

	let profileData = $derived(await getProfile());

	let matchesQuery = $derived(await findMatches(profileData.user.id));
	let skillsQuery = $derived(await getSkillRecommendations(profileData.user.id));

	function filterMatches(matches, search, industry, location, duration) {
		if (!matches) return [];
		return matches.filter(match => {
			const searchMatch = !search || 
				match.placement.title.toLowerCase().includes(search.toLowerCase()) ||
				match.placement.company.name.toLowerCase().includes(search.toLowerCase());
			
			const industryMatch = !industry || 
				match.placement.department.toLowerCase().includes(industry.toLowerCase());
			
			const locationMatch = !location || 
				match.placement.location.toLowerCase().includes(location.toLowerCase());
			
			const durationMatch = !duration || 
				match.placement.duration.toString() === duration;
			
			return searchMatch && industryMatch && locationMatch && durationMatch;
		});
	}

	function sortMatches(matches, sort) {
		if (!matches) return [];
		const sortedMatches = [...matches];
		switch (sort) {
			case 'match-score':
				return sortedMatches.sort((a, b) => b.score.overall - a.score.overall);
			case 'recent':
				return sortedMatches.sort((a, b) => new Date(b.placement.createdAt) - new Date(a.placement.createdAt));
			case 'company':
				return sortedMatches.sort((a, b) => a.placement.company.name.localeCompare(b.placement.company.name));
			default:
				return sortedMatches;
		}
	}

	function clearFilters() {
		searchQuery = '';
		selectedIndustry = '';
		selectedLocation = '';
		selectedDuration = '';
	}

	async function refreshMatches() {
		refreshing = true;
		try {
			await matchesQuery.refresh();
		} catch (error) {
			console.error('Failed to refresh matches:', error);
		} finally {
			refreshing = false;
		}
	}

	function handleSearch(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			applyFilters();
		}
	}
</script>

<svelte:head>
	<title>Matches - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Find Your Perfect Match</h1>
			<p class="text-muted-foreground">AI-powered placement recommendations tailored for you</p>
		</div>
		
		<div class="flex items-center space-x-2">
			{#await matchesQuery then matches}
				<Badge variant="secondary" class="text-sm">
					{matches.length} matches found
				</Badge>
			{/await}
			<Button variant="outline" size="sm" onclick={refreshMatches} disabled={refreshing}>
				<RefreshCw class="h-4 w-4 mr-2 {refreshing ? 'animate-spin' : ''}" />
				Refresh
			</Button>
			<Button variant="outline" size="sm" onclick={() => showFilters = !showFilters}>
				<SlidersHorizontal class="h-4 w-4 mr-2" />
				Filters
			</Button>
		</div>
	</div>

	<!-- Search and Filters -->
	<Card class="p-4">
		<div class="space-y-4">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					bind:value={searchQuery}
					placeholder="Search placements, companies, or skills..."
					class="pl-10"
				/>
			</div>

			<!-- Filters -->
			{#if showFilters}
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-border pt-4">
					<div class="space-y-2">
						<Label>Industry</Label>
						<Select bind:value={selectedIndustry}>
							<SelectTrigger>
								{selectedIndustry || "Any industry"}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Any industry</SelectItem>
								{#each industries as industry}
									<SelectItem value={industry}>{industry}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label>Location</Label>
						<Select bind:value={selectedLocation}>
							<SelectTrigger>
								{selectedLocation || "Any location"}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Any location</SelectItem>
								{#each nigerianStates as state}
									<SelectItem value={state}>{state}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label>Duration</Label>
						<Select bind:value={selectedDuration}>
							<SelectTrigger>
								{selectedDuration || "Any duration"}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Any duration</SelectItem>
								<SelectItem value="< 20">Less than 20 weeks</SelectItem>
								<SelectItem value="20-24">20-24 weeks</SelectItem>
								<SelectItem value="> 24">More than 24 weeks</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label>Sort by</Label>
						<Select bind:value={sortBy}>
							<SelectTrigger>
								{sortBy}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="match-score">Match Score</SelectItem>
								<SelectItem value="deadline">Application Deadline</SelectItem>
								<SelectItem value="salary">Salary Range</SelectItem>
								<SelectItem value="newest">Newest First</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div class="flex items-center justify-end space-x-2">
					<Button variant="ghost" size="sm" onclick={clearFilters}>
						Clear All
					</Button>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Matches Grid -->
	{#await matchesQuery}
		<div class="text-center py-12">
			<p class="text-muted-foreground">Finding your perfect matches...</p>
		</div>
	{:then matches}
		{@const filteredMatches = sortMatches(filterMatches(matches, searchQuery, selectedIndustry, selectedLocation, selectedDuration), sortBy)}
		{#if filteredMatches.length > 0}
			<div class="grid lg:grid-cols-2 gap-6">
				{#each filteredMatches as match}
					<MatchCard {match} showDetails={true} />
				{/each}
			</div>
		{:else}
			<Card class="p-12 text-center">
				<div class="space-y-4">
					<div class="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
						<Search class="h-6 w-6 text-muted-foreground" />
					</div>
					<div class="space-y-2">
						<h3 class="text-lg font-semibold text-foreground">No matches found</h3>
						<p class="text-muted-foreground">Try adjusting your search criteria or complete your profile for better matches</p>
					</div>
					<div class="flex space-x-2 justify-center">
						<Button variant="outline" onclick={clearFilters}>
							Clear Filters
						</Button>
						<Button href="/app/student/profile">
							Complete Profile
						</Button>
					</div>
				</div>
			</Card>
		{/if}
	{:catch error}
		<div class="text-center py-12">
			<p class="text-red-500">Error loading matches: {error.message}</p>
		</div>
	{/await}

	<!-- Skill Recommendations -->
	{#await skillsQuery then skills}
		{#if skills.recommended.length > 0}
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4">Recommended Skills to Learn</h3>
				<div class="flex flex-wrap gap-2">
					{#each skills.recommended.slice(0, 10) as skill}
						<Badge variant="outline" class="text-sm">
							{skill.skill}
							<span class="ml-1 text-xs text-muted-foreground">({skill.frequency})</span>
						</Badge>
					{/each}
				</div>
			</Card>
		{/if}
	{/await}
</div>