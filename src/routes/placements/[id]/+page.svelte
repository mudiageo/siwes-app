<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
    import MapPin from '@lucide/svelte/icons/map-pin';
    import Clock from '@lucide/svelte/icons/clock';
    import Users from '@lucide/svelte/icons/users';
    import Calendar from '@lucide/svelte/icons/calendar';
    import Star from '@lucide/svelte/icons/star';
    import Building2 from '@lucide/svelte/icons/building-2';
    import Globe from '@lucide/svelte/icons/globe';
    import Phone from '@lucide/svelte/icons/phone';
    import Mail from '@lucide/svelte/icons/mail';
    import ArrowLeft from '@lucide/svelte/icons/arrow-left';
    import Send from '@lucide/svelte/icons/send';
    import Heart from '@lucide/svelte/icons/heart';
    import Share from '@lucide/svelte/icons/share';
    import BookOpen from '@lucide/svelte/icons/book-open';
    import Award from '@lucide/svelte/icons/award';
    import CheckCircle from '@lucide/svelte/icons/check-circle';
    import AlertCircle from '@lucide/svelte/icons/alert-circle';
    import Wifi from '@lucide/svelte/icons/wifi';
	
	import { getPlacement } from '$lib/placements.remote.js';
	import { applyToPlacement } from '$lib/matches.remote.js';
	import { calculateMatchScore } from '$lib/server/matching.js';

	let { data } = $props();
	
	let placement = $state(data.placement);
	let company = $state(data.company);
	let user = $state(data.user);
	let matchScore = $state(data.matchScore);
	let hasApplied = $state(data.hasApplied);
	
	let showApplicationDialog = $state(false);
	let coverLetter = $state('');
	let isApplying = $state(false);
	let isSaved = $state(false);

	async function handleApply(e) {
		e.preventDefault()
		if (!placement?.id || hasApplied) return;
		
		isApplying = true;
		try {
			await applyToPlacement(placement.id);
			hasApplied = true;
			showApplicationDialog = false;
		} catch (error) {
			console.error('Failed to apply:', error);
		} finally {
			isApplying = false;
		}
	}

	function toggleSave() {
		isSaved = !isSaved;
		// Here you would implement saving to favorites
	}

	function getMatchScoreColor(score: number): string {
		if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
		if (score >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200';
		if (score >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
		return 'text-gray-600 bg-gray-50 border-gray-200';
	}

	function formatMatchScore(score: number): string {
		return `${Math.round(score * 100)}%`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	function getDaysUntilDeadline(deadlineString: string): number {
		const deadline = new Date(deadlineString);
		const now = new Date();
		return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	}

	function getUrgencyBadge(daysLeft: number) {
		if (daysLeft <= 0) return { variant: 'destructive', text: 'Expired' };
		if (daysLeft <= 3) return { variant: 'destructive', text: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` };
		if (daysLeft <= 7) return { variant: 'secondary', text: `${daysLeft} days left` };
		return { variant: 'outline', text: `${daysLeft} days left` };
	}

	const daysLeft = $derived(placement ? getDaysUntilDeadline(placement.applicationDeadline) : 0);
	const urgencyBadge = $derived(getUrgencyBadge(daysLeft));
</script>

<svelte:head>
	<title>{placement?.title} - {company?.name} - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<Button variant="ghost" href="/app/student/matches">
			<ArrowLeft class="h-4 w-4 mr-2" />
			Back to Matches
		</Button>
		
		<div class="flex items-center gap-2 ml-auto">
			<Button variant="ghost" onclick={toggleSave}>
                <Heart class={["h-4 w-4 mr-2", isSaved && "fill-red-500 text-red-500"]} />
				{isSaved ? 'Saved' : 'Save'}
			</Button>
			
			<Button variant="ghost">
				<Share class="h-4 w-4 mr-2" />
				Share
			</Button>
		</div>
	</div>

	{#if placement && company}
		<div class="grid lg:grid-cols-3 gap-6">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Placement Header -->
				<Card class="p-6">
					<div class="space-y-4">
						<!-- Title and Company -->
						<div>
							<h1 class="text-3xl font-bold text-foreground mb-2">
								{placement.title}
							</h1>
							<p class="text-xl text-muted-foreground flex items-center">
								<Building2 class="h-5 w-5 mr-2" />
								{company.name}
							</p>
						</div>

						<!-- Key Details -->
						<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
							<div class="flex items-center">
								<MapPin class="h-4 w-4 mr-1" />
								{placement.location}
								{#if placement.isRemote}
									<Badge variant="outline" class="ml-2">
										<Wifi class="h-3 w-3 mr-1" />
										Remote
									</Badge>
								{/if}
							</div>
							
							<div class="flex items-center">
								<Clock class="h-4 w-4 mr-1" />
								{placement.duration} weeks
							</div>

							<div class="flex items-center">
								<Users class="h-4 w-4 mr-1" />
								{placement.filledSlots || 0}/{placement.slots} filled
							</div>

							<div class="flex items-center">
								<Building2 class="h-4 w-4 mr-1" />
								{placement.department}
							</div>
						</div>

						<!-- Match Score and Urgency -->
						<div class="flex flex-wrap items-center gap-3">
							{#if matchScore}
								<Badge variant="outline" class={`border ${getMatchScoreColor(matchScore.overall)}`}>
									<Star class="h-3 w-3 mr-1" />
									{formatMatchScore(matchScore.overall)} Match
								</Badge>
							{/if}
							
							<Badge variant={urgencyBadge.variant}>
								<Calendar class="h-3 w-3 mr-1" />
								{urgencyBadge.text}
							</Badge>

							{#if placement.salaryRange}
								<Badge variant="outline">
									💰 {placement.salaryRange}
								</Badge>
							{/if}
						</div>
					</div>
				</Card>

				<!-- Match Score Breakdown -->
				{#if matchScore}
					<Card class="p-6">
						<h3 class="text-lg font-semibold mb-4 flex items-center">
							<Star class="h-5 w-5 mr-2" />
							AI Match Analysis
						</h3>

						<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
							<div class="text-center p-4 bg-muted rounded-lg">
								<div class="text-2xl font-bold text-primary mb-1">
									{Math.round(matchScore.breakdown.skillsScore * 100)}%
								</div>
								<div class="text-sm text-muted-foreground mb-2">Skills Match</div>
								<Progress value={matchScore.breakdown.skillsScore * 100} class="h-2" />
							</div>
							
							<div class="text-center p-4 bg-muted rounded-lg">
								<div class="text-2xl font-bold text-primary mb-1">
									{Math.round(matchScore.breakdown.locationScore * 100)}%
								</div>
								<div class="text-sm text-muted-foreground mb-2">Location</div>
								<Progress value={matchScore.breakdown.locationScore * 100} class="h-2" />
							</div>
							
							<div class="text-center p-4 bg-muted rounded-lg">
								<div class="text-2xl font-bold text-primary mb-1">
									{Math.round(matchScore.breakdown.industryScore * 100)}%
								</div>
								<div class="text-sm text-muted-foreground mb-2">Industry</div>
								<Progress value={matchScore.breakdown.industryScore * 100} class="h-2" />
							</div>
							
							<div class="text-center p-4 bg-muted rounded-lg">
								<div class="text-2xl font-bold text-primary mb-1">
									{Math.round(matchScore.breakdown.levelScore * 100)}%
								</div>
								<div class="text-sm text-muted-foreground mb-2">Level</div>
								<Progress value={matchScore.breakdown.levelScore * 100} class="h-2" />
							</div>
						</div>

						<div class="mt-4 p-4 bg-blue-50 rounded-lg">
							<p class="text-sm text-blue-700">
								<strong>Why this is a great match:</strong>
								{#if matchScore.breakdown.skillsScore >= 0.8}
									Your skills align well with the requirements.
								{/if}
								{#if matchScore.breakdown.locationScore >= 0.8}
									The location matches your preferences.
								{/if}
								{#if matchScore.breakdown.industryScore >= 0.8}
									This industry aligns with your interests.
								{/if}
							</p>
						</div>
					</Card>
				{/if}

				<!-- Job Description -->
				<Card class="p-6">
					<h3 class="text-lg font-semibold mb-4 flex items-center">
						<BookOpen class="h-5 w-5 mr-2" />
						Job Description
					</h3>
					<div class="prose prose-sm max-w-none">
						<p class="whitespace-pre-wrap text-muted-foreground">
							{placement.description}
						</p>
					</div>
				</Card>

				<!-- Requirements -->
				<Card class="p-6">
					<h3 class="text-lg font-semibold mb-4 flex items-center">
						<CheckCircle class="h-5 w-5 mr-2" />
						Requirements
					</h3>
					<div class="prose prose-sm max-w-none">
						<p class="whitespace-pre-wrap text-muted-foreground">
							{placement.requirements}
						</p>
					</div>
				</Card>

				<!-- Skills -->
				<div class="grid md:grid-cols-2 gap-6">
					<Card class="p-6">
						<h3 class="text-lg font-semibold mb-4">Required Skills</h3>
						<div class="flex flex-wrap gap-2">
							{#each placement.requiredSkills as skill}
								<Badge variant="outline">{skill}</Badge>
							{/each}
						</div>
					</Card>

					<Card class="p-6">
						<h3 class="text-lg font-semibold mb-4 flex items-center">
							<Award class="h-4 w-4 mr-2" />
							You'll Learn
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each placement.skillsToLearn as skill}
								<Badge variant="secondary">{skill}</Badge>
							{/each}
						</div>
					</Card>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Application Action -->
				<Card class="p-6">
					<div class="space-y-4">
						{#if hasApplied}
							<Button variant="outline" disabled class="w-full">
								<CheckCircle class="h-4 w-4 mr-2" />
								Application Submitted
							</Button>
							<p class="text-sm text-muted-foreground text-center">
								You've already applied to this position. Check your applications page for updates.
							</p>
						{:else if daysLeft <= 0}
							<Button variant="destructive" disabled class="w-full">
								<AlertCircle class="h-4 w-4 mr-2" />
								Application Closed
							</Button>
						{:else}
							<Dialog bind:open={showApplicationDialog}>
								<DialogTrigger asChild>
									<Button class="w-full" size="lg">
										<Send class="h-4 w-4 mr-2" />
										Apply Now
									</Button>
								</DialogTrigger>
								<DialogContent class="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Apply for {placement.title}</DialogTitle>
										<DialogDescription>
											Submit your application for this placement. A cover letter will be generated automatically based on your profile.
										</DialogDescription>
									</DialogHeader>
									
									<form onsubmit={handleApply} class="space-y-4">
										<div class="space-y-2">
											<Label for="coverLetter">Cover Letter (Optional)</Label>
											<Textarea
												id="coverLetter"
												bind:value={coverLetter}
												placeholder="Add any additional information or customize your cover letter..."
												rows="6"
											/>
											<p class="text-xs text-muted-foreground">
												If left empty, an AI-generated cover letter will be created based on your profile and this placement.
											</p>
										</div>

										<div class="flex justify-end gap-2">
											<Button 
												type="button" 
												variant="outline" 
												onclick={() => showApplicationDialog = false}
											>
												Cancel
											</Button>
											<Button type="submit" disabled={isApplying}>
												{isApplying ? 'Submitting...' : 'Submit Application'}
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>

							<p class="text-sm text-muted-foreground text-center">
								Your profile shows a {matchScore ? formatMatchScore(matchScore.overall) : '85%'} match for this role
							</p>
						{/if}
					</div>
				</Card>

				<!-- Key Information -->
				<Card class="p-6">
					<h3 class="text-lg font-semibold mb-4">Key Information</h3>
					
					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Duration:</span>
							<span>{placement.duration} weeks</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-muted-foreground">Start Date:</span>
							<span>{formatDate(placement.startDate)}</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-muted-foreground">End Date:</span>
							<span>{formatDate(placement.endDate)}</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-muted-foreground">Application Deadline:</span>
							<span class={daysLeft <= 7 ? 'text-red-600' : ''}>
								{formatDate(placement.applicationDeadline)}
							</span>
						</div>
						
						<div class="flex justify-between">
							<span class="text-muted-foreground">Available Slots:</span>
							<span>{placement.slots - (placement.filledSlots || 0)} remaining</span>
						</div>
					</div>
				</Card>

				<!-- Company Information -->
				<Card class="p-6">
					<h3 class="text-lg font-semibold mb-4 flex items-center">
						<Building2 class="h-5 w-5 mr-2" />
						About {company.name}
					</h3>
					
					<div class="space-y-4">
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Industry:</span>
								<span>{company.industry}</span>
							</div>
							
							<div class="flex justify-between">
								<span class="text-muted-foreground">Size:</span>
								<span class="capitalize">{company.size}</span>
							</div>
							
							<div class="flex justify-between">
								<span class="text-muted-foreground">Location:</span>
								<span>{company.location}</span>
							</div>
							
							{#if company.establishedYear}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Established:</span>
									<span>{company.establishedYear}</span>
								</div>
							{/if}
						</div>

						{#if company.description}
							<div>
								<p class="text-sm text-muted-foreground line-clamp-4">
									{company.description}
								</p>
							</div>
						{/if}

						<div class="space-y-2">
							{#if company.website}
								<Button variant="outline" size="sm" class="w-full justify-start">
									<Globe class="h-4 w-4 mr-2" />
									<a href={company.website} target="_blank" class="flex-1 text-left">
										Visit Website
									</a>
								</Button>
							{/if}

							{#if company.contactEmail}
								<Button variant="outline" size="sm" class="w-full justify-start">
									<Mail class="h-4 w-4 mr-2" />
									<a href="mailto:{company.contactEmail}" class="flex-1 text-left">
										Contact Email
									</a>
								</Button>
							{/if}

							{#if company.contactPhone}
								<Button variant="outline" size="sm" class="w-full justify-start">
									<Phone class="h-4 w-4 mr-2" />
									<a href="tel:{company.contactPhone}" class="flex-1 text-left">
										Call Company
									</a>
								</Button>
							{/if}
						</div>
					</div>
				</Card>

				<!-- Similar Positions -->
				<Card class="p-6">
					<h3 class="text-lg font-semibold mb-4">Similar Positions</h3>
					<div class="space-y-3">
						<div class="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
							<h4 class="font-medium text-sm">Backend Developer Intern</h4>
							<p class="text-xs text-muted-foreground">MTN Nigeria - Lagos</p>
							<div class="flex items-center justify-between mt-2">
								<Badge variant="outline" class="text-xs">88% Match</Badge>
								<span class="text-xs text-muted-foreground">24 weeks</span>
							</div>
						</div>

						<div class="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
							<h4 class="font-medium text-sm">Data Science Intern</h4>
							<p class="text-xs text-muted-foreground">Andela - Remote</p>
							<div class="flex items-center justify-between mt-2">
								<Badge variant="outline" class="text-xs">85% Match</Badge>
								<span class="text-xs text-muted-foreground">20 weeks</span>
							</div>
						</div>

						<Button variant="ghost" size="sm" class="w-full mt-2">
							View More Similar Positions
						</Button>
					</div>
				</Card>
			</div>
		</div>
	{/if}
</div>
