<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import ProfileCompletion from '$lib/components/profile/ProfileCompletion.svelte';
	import MatchCard from '$lib/components/match/MatchCard.svelte';
	import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Users from '@lucide/svelte/icons/users';
	import FileText from '@lucide/svelte/icons/file-text';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Star from '@lucide/svelte/icons/star';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Target from '@lucide/svelte/icons/target';
	import Clock from '@lucide/svelte/icons/clock';
	import Search from '@lucide/svelte/icons/search';
	import User from '@lucide/svelte/icons/user';
	import { getStudentDashboard } from '$lib/dashboard.remote';
	import { getMatchingStats } from '$lib/matching.remote';

	let dashboardData = $derived(getStudentDashboard());
	let matchingStats = $derived(getMatchingStats());
</script>

<svelte:head>
	<title>Dashboard - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Section -->
	{#await Promise.all([dashboardData, matchingStats])}
		<div class="p-6 space-y-6">
            <!-- Loading skeleton -->
            <div class="space-y-4">
                <Skeleton class="h-8 w-64" />
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {#each Array(4) as _}
                        <Card>
                            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton class="h-4 w-24" />
                                <Skeleton class="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton class="h-8 w-16 mb-2" />
                                <Skeleton class="h-3 w-32" />
                            </CardContent>
                        </Card>
                    {/each}
                </div>
            </div>
        </div>
	{:then [dashboard, matching]}
		<div class="flex flex-col space-y-2">
			<h1 class="text-2xl font-bold text-foreground">Good morning, {dashboard.student?.firstName}! 👋</h1>
			<p class="text-muted-foreground">
				You have {matching?.excellentMatches || 0} new matches and {matching?.applicationsCount || 0} active applications.
			</p>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<Card class="p-4">
				<div class="flex items-center space-x-2">
					<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<Target class="h-4 w-4 text-primary" />
					</div>
					<div>
						<div class="text-2xl font-bold text-foreground">{matching?.totalMatches || 0}</div>
						<div class="text-xs text-muted-foreground">Total Matches</div>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center space-x-2">
					<div class="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center">
						<Star class="h-4 w-4 text-success-600" />
					</div>
					<div>
						<div class="text-2xl font-bold text-foreground">{matching?.excellentMatches || 0}</div>
						<div class="text-xs text-muted-foreground">Excellent Matches</div>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center space-x-2">
					<div class="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
						<FileText class="h-4 w-4 text-warning-600" />
					</div>
					<div>
						<div class="text-2xl font-bold text-foreground">{matching?.applicationsCount || 0}</div>
						<div class="text-xs text-muted-foreground">Active Apps</div>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center space-x-2">
					<div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
						<Users class="h-4 w-4 text-blue-600" />
					</div>
					<div>
						<div class="text-2xl font-bold text-foreground">{dashboard.stats?.profileViews || 0}</div>
						<div class="text-xs text-muted-foreground">Profile Views</div>
					</div>
				</div>
			</Card>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<!-- Left Column -->
			<div class="lg:col-span-2 space-y-6">
				<!-- New Matches -->
				<Card class="p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-lg font-semibold text-foreground">New Matches</h2>
						<Button variant="ghost" size="sm" href="/app/student/matches">
							View All
							<ArrowRight class="h-4 w-4 ml-1" />
						</Button>
					</div>

					<div class="space-y-4">
						{#each matching.topMatches || [] as match}
							<MatchCard {match} />
						{:else}
							<div class="text-center py-8">
								<Search class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p class="text-muted-foreground">No matches found yet. Complete your profile to get better matches!</p>
							</div>
						{/each}
					</div>
				</Card>

				<!-- Recent Applications -->
				<Card class="p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-lg font-semibold text-foreground">Recent Applications</h2>
						<Button variant="ghost" size="sm" href="/app/student/applications">
							View All
							<ArrowRight class="h-4 w-4 ml-1" />
						</Button>
					</div>

					<div class="space-y-4">
						{#each dashboard.recentApplications || [] as application}
							<div class="flex items-center justify-between p-4 border border-border rounded-lg">
								<div class="space-y-1">
									<h4 class="font-medium text-foreground">{application.placement.title}</h4>
									<p class="text-sm text-muted-foreground">{application.company.name}</p>
								</div>
								<div class="w-48">
									<ApplicationStatus 
										status={application.application.status}
										appliedDate={application.application.appliedAt}
										reviewedDate={application.application.reviewedAt}
										interviewDate={application.application.interviewDate}
									/>
								</div>
							</div>
						{:else}
						<div class="flex items-center justify-between p-4 border border-border rounded-lg">
							<FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground">No applications yet. Start applying to placements!</p>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Profile Completion -->
			<ProfileCompletion completeness={dashboard.student?.profileCompleteness || 0} userType="student" />

			<!-- Upcoming Deadlines -->
			<Card class="p-6">
				<div class="flex items-center space-x-2 mb-4">
					<Clock class="h-5 w-5 text-warning-600" />
					<h3 class="text-lg font-semibold text-foreground">Upcoming Deadlines</h3>
				</div>

				<div class="space-y-3">
					{#each dashboard.upcomingDeadlines || [] as deadline}
						<div class="flex items-center justify-between p-3 border border-border rounded-lg">
							<div class="space-y-1">
								<h4 class="text-sm font-medium text-foreground">{deadline.title}</h4>
								<p class="text-xs text-muted-foreground">
									{deadline.deadline.toLocaleDateString()}
								</p>
							</div>
							<Badge 
								variant={deadline.daysLeft <= 3 ? 'destructive' : deadline.daysLeft <= 7 ? 'secondary' : 'outline'}
								class="text-xs"
							>
								{deadline.daysLeft} days
							</Badge>
						</div>
					{:else}
						<p class="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
					{/each}
				</div>
			</Card>

			<!-- Quick Actions -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
				<div class="space-y-2">
					<Button variant="outline" class="w-full justify-start" href="/app/student/matches">
						<Search class="h-4 w-4 mr-2" />
						Find New Matches
					</Button>
					<Button variant="outline" class="w-full justify-start" href="/app/student/profile">
						<FileText class="h-4 w-4 mr-2" />
						Update Resume
					</Button>
					<Button variant="outline" class="w-full justify-start" href="/app/student/profile">
						<User class="h-4 w-4 mr-2" />
						Edit Profile
					</Button>
				</div>
			</Card>
		</div>
	</div>
	{:catch error}
		<Card class="border-destructive">
                <CardHeader>
                    <CardTitle class="flex items-center gap-2 text-destructive">
                        <XCircle class="h-5 w-5" />
                        Error Loading Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p class="text-muted-foreground mb-4">
                        {error.message || 'Failed to load dashboard data. Please try again.'}
                    </p>
                    <Button onclick={() => getStudentDashboard().refresh()} variant="outline">
                        Retry
                    </Button>
                </CardContent>
            </Card>
	{/await}
</div>