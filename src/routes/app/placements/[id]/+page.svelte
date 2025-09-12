<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { Textarea } from '$lib/components/ui/textarea';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Users from '@lucide/svelte/icons/users';
	import Star from '@lucide/svelte/icons/star';
	import Send from '@lucide/svelte/icons/send';
	import Brain from '@lucide/svelte/icons/brain';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Clock from '@lucide/svelte/icons/clock';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import { applyForPlacement } from '$lib/applications.remote';
	import { generateCoverLetter, getMatchAnalysis } from '$lib/matching.remote';

	let applying = $state(false);
	let generatingCoverLetter = $state(false);
	let showApplicationDialog = $state(false);
	let coverLetter = $state('');
	let customMessage = $state('');

	let placementId = $derived(page.params.id);
	let matchAnalysisPromise = $derived(getMatchAnalysis({ placementId }));

	function getScoreColor(score: number) {
		if (score >= 80) return 'bg-green-500';
		if (score >= 60) return 'bg-yellow-500';
		if (score >= 40) return 'bg-orange-500';
		return 'bg-red-500';
	}

	function getScoreLabel(score: number) {
		if (score >= 80) return 'Excellent Match';
		if (score >= 60) return 'Good Match';
		if (score >= 40) return 'Fair Match';
		return 'Requires Development';
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
			case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
			default: return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	async function handleGenerateCoverLetter(placement: any) {
		generatingCoverLetter = true;
		try {
			coverLetter = await generateCoverLetter({ placementId: placement.id });
		} catch (error) {
			toast.error('Failed to generate cover letter');
		} finally {
			generatingCoverLetter = false;
		}
	}

	async function handleApply() {
		if (!coverLetter.trim() && !customMessage.trim()) {
			toast.error('Please provide a cover letter or message');
			return;
		}

		applying = true;
		try {
			await applyForPlacement({
			  placementId: placement.id,
				coverLetter: coverLetter.trim() || customMessage.trim()
			});
			toast.success('Application submitted successfully!');
			showApplicationDialog = false;
			// Refresh page to show new status
			window.location.reload();
		} catch (error) {
			toast.error('Failed to submit application');
		} finally {
			applying = false;
		}
	}
</script>

{#await matchAnalysisPromise}
	<div class="max-w-4xl mx-auto space-y-6">
		<div class="flex items-center justify-center h-64">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
				<p class="text-muted-foreground">Loading placement analysis...</p>
			</div>
		</div>
	</div>
{:then matchAnalysis}
	{@const { placement, score, reasons, hasApplied, applicationStatus } = matchAnalysis}
	<div class="max-w-4xl mx-auto space-y-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" onclick={() => goto('/app/student/matches')}>
				<ArrowLeft class="h-4 w-4" />
				Back to Matches
			</Button>
			<div>
				<h1 class="text-2xl font-bold">{placement.title}</h1>
				<p class="text-muted-foreground">{placement.company.name}</p>
			</div>
		</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- AI Match Score -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Brain class="h-5 w-5 text-purple-500" />
						AI Match Analysis
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="text-center">
						<div class="text-3xl font-bold mb-2">{Math.round(score.overall * 100)}%</div>
						<div class="text-lg font-semibold {score.overall >= 0.8 ? 'text-green-600' : score.overall >= 0.6 ? 'text-yellow-600' : 'text-orange-600'}">
							{getScoreLabel(score.overall * 100)}
						</div>
					</div>

					<!-- Score Breakdown -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Skills Match</span>
								<span>{score.breakdown.skillsScore}%</span>
							</div>
							<Progress value={score.breakdown.skillsScore} class="h-2" />
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Location</span>
								<span>{score.breakdown.locationScore}%</span>
							</div>
							<Progress value={score.breakdown.locationScore} class="h-2" />
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Industry Fit</span>
								<span>{score.breakdown.industryScore}%</span>
							</div>
							<Progress value={score.breakdown.industryScore} class="h-2" />
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Level Match</span>
								<span>{score.breakdown.levelScore}%</span>
							</div>
							<Progress value={score.breakdown.levelScore} class="h-2" />
						</div>
					</div>

					<!-- Match Reasons -->
					<div>
						<h4 class="font-semibold mb-2">Why this is a good match:</h4>
						<ul class="space-y-1">
							{#each reasons as reason}
								<li class="flex items-start gap-2 text-sm">
									<CheckCircle class="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
									{reason}
								</li>
							{/each}
						</ul>
					</div>
				</CardContent>
			</Card>

			<!-- Job Description -->
			<Card>
				<CardHeader>
					<CardTitle>Job Description</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="prose prose-sm max-w-none">
						{@html placement.description?.replace(/\n/g, '<br>') || 'No description available'}
					</div>

					<!-- Required Skills -->
					{#if placement.requiredSkills?.length}
						<div>
							<h4 class="font-semibold mb-2">Required Skills</h4>
							<div class="flex flex-wrap gap-2">
								{#each placement.requiredSkills as skill}
									<Badge variant="secondary">{skill}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Skills to Learn -->
					{#if placement.skillsToLearn?.length}
						<div>
							<h4 class="font-semibold mb-2">Skills You'll Learn</h4>
							<div class="flex flex-wrap gap-2">
								{#each placement.skillsToLearn as skill}
									<Badge variant="outline">{skill}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Requirements -->
					{#if placement.requirements}
						<div>
							<h4 class="font-semibold mb-2">Requirements</h4>
							<div class="text-sm text-muted-foreground">
								{@html placement.requirements.replace(/\n/g, '<br>')}
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Application Status -->
			{#if hasApplied}
				<Card>
					<CardHeader>
						<CardTitle>Application Status</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="flex items-center gap-2">
							{#if applicationStatus === 'accepted'}
								<CheckCircle class="h-5 w-5 text-green-500" />
							{:else if applicationStatus === 'pending'}
								<Clock class="h-5 w-5 text-yellow-500" />
							{:else}
								<AlertCircle class="h-5 w-5 text-red-500" />
							{/if}
							<Badge class={getStatusColor(applicationStatus)}>
								{applicationStatus}
							</Badge>
						</div>
						<p class="text-sm text-muted-foreground mt-2">
							{#if applicationStatus === 'accepted'}
								Congratulations! Your application has been accepted.
							{:else if applicationStatus === 'pending'}
								Your application is being reviewed.
							{:else}
								Your application was not successful this time.
							{/if}
						</p>
					</CardContent>
				</Card>
			{:else}
				<!-- Apply Button -->
				<Card>
					<CardContent class="pt-6">
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
								</DialogHeader>
								<div class="space-y-4">
									<div>
										<div class="flex justify-between items-center mb-2">
											<label class="text-sm font-medium">Cover Letter</label>
											<Button
												variant="outline"
												size="sm"
												onclick={handleGenerateCoverLetter}
												disabled={generatingCoverLetter}
											>
												{#if generatingCoverLetter}
													<Brain class="h-4 w-4 mr-2 animate-spin" />
													Generating...
												{:else}
													<Brain class="h-4 w-4 mr-2" />
													AI Generate
												{/if}
											</Button>
										</div>
										<Textarea
											bind:value={coverLetter}
											placeholder="Write your cover letter or use AI to generate one..."
											rows={8}
											class="min-h-32"
										/>
									</div>

									{#if !coverLetter.trim()}
										<div>
											<label class="text-sm font-medium">Custom Message</label>
											<Textarea
												bind:value={customMessage}
												placeholder="Or write a brief message about your interest..."
												rows={4}
											/>
										</div>
									{/if}

									<div class="flex justify-end gap-2">
										<Button variant="outline" onclick={() => showApplicationDialog = false}>
											Cancel
										</Button>
										<Button onclick={handleApply} disabled={applying}>
											{#if applying}
												Submitting...
											{:else}
												Submit Application
											{/if}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</CardContent>
				</Card>
			{/if}

			<!-- Placement Details -->
			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center gap-2">
						<MapPin class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm">{placement.location}</span>
					</div>
					<div class="flex items-center gap-2">
						<Calendar class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm">{placement.duration} months</span>
					</div>
					<div class="flex items-center gap-2">
						<Users class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm">{placement.maxStudents} positions</span>
					</div>
					{#if placement.stipend}
						<div class="flex items-center gap-2">
							<Star class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm">₦{placement.stipend.toLocaleString()}/month</span>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Company Info -->
			<Card>
				<CardHeader>
					<CardTitle>Company</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<h4 class="font-semibold">{placement.company.name}</h4>
						{#if placement.company.verified}
							<Badge variant="outline" class="text-green-600 border-green-200">
								<CheckCircle class="h-3 w-3 mr-1" />
								Verified
							</Badge>
						{/if}
					</div>
					
					{#if placement.company.description}
						<p class="text-sm text-muted-foreground">
							{placement.company.description}
						</p>
					{/if}

					<div class="space-y-2 text-sm">
						{#if placement.company.industry}
							<div>
								<span class="font-medium">Industry:</span>
								<span class="text-muted-foreground">{placement.company.industry}</span>
							</div>
						{/if}
						{#if placement.company.size}
							<div>
								<span class="font-medium">Size:</span>
								<span class="text-muted-foreground">{placement.company.size} employees</span>
							</div>
						{/if}
						{#if placement.company.website}
							<div>
								<a href={placement.company.website} target="_blank" class="text-primary hover:underline">
									Visit Website
								</a>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
	</div>
{:catch error}
	<div class="max-w-4xl mx-auto space-y-6">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="sm" onclick={() => goto('/app/student/matches')}>
				<ArrowLeft class="h-4 w-4" />
				Back to Matches
			</Button>
		</div>
		<Card>
			<CardContent class="text-center py-8">
				<AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
				<h2 class="text-lg font-semibold mb-2">Failed to Load Placement</h2>
				<p class="text-muted-foreground">
					{error.message || 'An error occurred while loading the placement details.'}
				</p>
			</CardContent>
		</Card>
	</div>
{/await}
