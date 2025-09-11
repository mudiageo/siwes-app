<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import MatchCard from '$lib/components/match/MatchCard.svelte';
	import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-svelte';
	import { industries, nigerianStates } from '$lib/services/sample-data.js';

	let { data } = $props();

	let searchQuery = $state(data.filters.search || '');
	let selectedIndustry = $state(data.filters.industry || '');
	let selectedLocation = $state(data.filters.location || '');
	let selectedDuration = $state(data.filters.duration || '');
	let sortBy = $state('match-score');
	let showFilters = $state(false);
	let refreshing = $state(false);

	$: matches = data.matches || [];

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedIndustry) params.set('industry', selectedIndustry);
		if (selectedLocation) params.set('location', selectedLocation);
		if (selectedDuration) params.set('duration', selectedDuration);
		
		goto(`/app/student/matches?${params.toString()}`);
	}

	function clearFilters() {
		searchQuery = '';
		selectedIndustry = '';
		selectedLocation = '';
		selectedDuration = '';
		goto('/app/student/matches');
	}

	async function refreshMatches() {
		refreshing = true;
		// Simulate refresh
		setTimeout(() => {
			refreshing = false;
			window.location.reload();
		}, 1000);
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
			<Badge variant="secondary" class="text-sm">
				{matches.length} matches found
			</Badge>
			<Button variant="outline" size="sm" on:click={refreshMatches} disabled={refreshing}>
				<RefreshCw class="h-4 w-4 mr-2 {refreshing ? 'animate-spin' : ''}" />
				Refresh
			</Button>
			<Button variant="outline" size="sm" on:click={() => showFilters = !showFilters}>
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
					on:keydown={handleSearch}
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
								<SelectValue placeholder="Any industry" />
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
								<SelectValue placeholder="Any location" />
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
								<SelectValue placeholder="Any duration" />
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
								<SelectValue />
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
					<Button variant="ghost" size="sm" on:click={clearFilters}>
						Clear All
					</Button>
					<Button size="sm" on:click={applyFilters}>
						Apply Filters
					</Button>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Matches Grid -->
	{#if matches.length > 0}
		<div class="grid lg:grid-cols-2 gap-6">
			{#each matches as match}
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
					<Button variant="outline" on:click={clearFilters}>
						Clear Filters
					</Button>
					<Button href="/app/student/profile">
						Complete Profile
					</Button>
				</div>
			</div>
		</Card>
	{/if}
</div>