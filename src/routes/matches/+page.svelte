<script lang="ts">
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
import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import { industries, nigerianStates } from '$lib/services/sample-data.js';

	let searchQuery = $state('');
	let selectedIndustry = $state('');
	let selectedLocation = $state('');
	let selectedDuration = $state('');
	let sortBy = $state('match-score');
	let showFilters = $state(false);

	// Mock matches data
	const matches = [
		{
			placement: {
				id: '1',
				title: 'Software Engineering Intern',
				department: 'Technology',
				location: 'Lagos',
				duration: 24,
				slots: 5,
				filledSlots: 2,
				salaryRange: '₦80,000 - ₦120,000',
				requiredSkills: ['JavaScript', 'React', 'Node.js', 'Git'],
				skillsToLearn: ['TypeScript', 'AWS', 'Docker', 'Microservices'],
				applicationDeadline: new Date('2025-03-15'),
				isRemote: false
			},
			score: {
				overall: 0.92,
				breakdown: { skillsScore: 95, locationScore: 100, industryScore: 90, levelScore: 85 }
			},
			reasons: ['Strong skills match (95%)', 'Perfect location match', 'Excellent industry alignment']
		},
		{
			placement: {
				id: '2',
				title: 'Data Science Intern',
				department: 'Data & Analytics',
				location: 'Lagos',
				duration: 20,
				slots: 3,
				filledSlots: 1,
				salaryRange: '₦100,000 - ₦150,000',
				requiredSkills: ['Python', 'Statistics', 'Mathematics'],
				skillsToLearn: ['Machine Learning', 'TensorFlow', 'Data Visualization'],
				applicationDeadline: new Date('2025-03-01'),
				isRemote: true
			},
			score: {
				overall: 0.85,
				breakdown: { skillsScore: 80, locationScore: 100, industryScore: 85, levelScore: 80 }
			},
			reasons: ['Good skills alignment (80%)', 'Remote work available', 'Growing field opportunity']
		},
		{
			placement: {
				id: '3',
				title: 'Network Engineering Trainee',
				department: 'Network Operations',
				location: 'Abuja',
				duration: 22,
				slots: 10,
				filledSlots: 4,
				salaryRange: '₦90,000 - ₦130,000',
				requiredSkills: ['Networking Basics', 'Computer Science Fundamentals'],
				skillsToLearn: ['5G Technology', 'Network Security', 'Fiber Optics'],
				applicationDeadline: new Date('2025-04-01'),
				isRemote: false
			},
			score: {
				overall: 0.78,
				breakdown: { skillsScore: 70, locationScore: 75, industryScore: 85, levelScore: 85 }
			},
			reasons: ['Good level fit', 'Learn cutting-edge 5G technology', 'Multiple openings available']
		}
	];

	let filteredMatches = $derived(matches.filter(match => {
		const matchesSearch = !searchQuery || 
			match.placement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			match.placement.department.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesIndustry = !selectedIndustry || match.placement.department === selectedIndustry;
		const matchesLocation = !selectedLocation || match.placement.location === selectedLocation;
		const matchesDuration = !selectedDuration || 
			(selectedDuration === '< 20' && match.placement.duration < 20) ||
			(selectedDuration === '20-24' && match.placement.duration >= 20 && match.placement.duration <= 24) ||
			(selectedDuration === '> 24' && match.placement.duration > 24);

		return matchesSearch && matchesIndustry && matchesLocation && matchesDuration;
	}));

	function clearFilters() {
		searchQuery = '';
		selectedIndustry = '';
		selectedLocation = '';
		selectedDuration = '';
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Find Your Perfect Match</h1>
			<p class="text-muted-foreground">Discover placements tailored to your skills and preferences</p>
		</div>
		
		<div class="flex items-center space-x-2">
			<Badge variant="secondary" class="text-sm">
				{filteredMatches.length} matches found
			</Badge>
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
							{selectedIndustry ??"Any industry"}
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
							{selectedLocation ?? "Any location" }
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
								{selectedDuration ?? "Any duration"}
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
					<Button variant="ghost" size="sm" on:click={clearFilters}>
						Clear All
					</Button>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Matches Grid -->
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
					<p class="text-muted-foreground">Try adjusting your search criteria or filters</p>
				</div>
				<Button variant="outline" on:click={clearFilters}>
					Clear Filters
				</Button>
			</div>
		</Card>
	{/if}
</div>