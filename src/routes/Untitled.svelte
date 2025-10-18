<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Progress } from '$lib/components/ui/progress';
    import { Skeleton } from '$lib/components/ui/skeleton';
    import { 
        Calendar,
        Building2,
        MapPin,
        Clock,
        CheckCircle2,
        XCircle,
        AlertCircle,
        Briefcase
    } from 'lucide-svelte';


<svelte:boundary onerror={(error) => {
    console.error('Dashboard error:', error);
}}>
    {#snippet fallback()}
        
    {/snippet}

    {#snippet error(err)}
      
    {/snippet}

    <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div class="flex items-center justify-between space-y-2">
            <h2 class="text-3xl font-bold tracking-tight">Student Dashboard</h2>
            <div class="flex items-center space-x-2">
                <Button onclick={() => getStudentDashboard().refresh()}>
                    Refresh Data
                </Button>
            </div>
        </div>

        <!-- Profile Completion Card -->
        {#if dashboardData.profileCompletion < 100}
            <ProfileCompletion 
                completion={dashboardData.profileCompletion}
                missingFields={dashboardData.missingProfileFields || []}
            />
        {/if}

        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Active Applications</CardTitle>
                    <Briefcase class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{dashboardData.stats.activeApplications}</div>
                    <p class="text-xs text-muted-foreground">
                        {dashboardData.stats.pendingApplications} pending review
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Matches Found</CardTitle>
                    <Users class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{dashboardData.stats.totalMatches}</div>
                    <p class="text-xs text-muted-foreground">
                        {dashboardData.stats.newMatches} new this week
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Success Rate</CardTitle>
                    <TrendingUp class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{dashboardData.stats.successRate}%</div>
                    <p class="text-xs text-muted-foreground">
                        Based on {dashboardData.stats.totalApplications} applications
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Profile Views</CardTitle>
                    <Star class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{dashboardData.stats.profileViews}</div>
                    <p class="text-xs text-muted-foreground">
                        Last 30 days
                    </p>
                </CardContent>
            </Card>
        </div>

        <!-- Recent Applications -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        {#if dashboardData.recentApplications.length === 0}
                            <div class="text-center py-8 text-muted-foreground">
                                <Briefcase class="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No applications yet</p>
                                <Button href="/app/student/matches" class="mt-4">
                                    Browse Opportunities
                                </Button>
                            </div>
                        {:else}
                            {#each dashboardData.recentApplications as application}
                                <div class="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div class="space-y-1 flex-1">
                                        <div class="flex items-center gap-2">
                                            <Building2 class="h-4 w-4 text-muted-foreground" />
                                            <p class="font-medium leading-none">
                                                {application.companyName}
                                            </p>
                                        </div>
                                        <div class="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span class="flex items-center gap-1">
                                                <MapPin class="h-3 w-3" />
                                                {application.location}
                                            </span>
                                            <span class="flex items-center gap-1">
                                                <Clock class="h-3 w-3" />
                                                {new Date(application.appliedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        {#if application.status === 'accepted'}
                                            <Badge variant="default" class="bg-green-500">
                                                <CheckCircle2 class="h-3 w-3 mr-1" />
                                                Accepted
                                            </Badge>
                                        {:else if application.status === 'rejected'}
                                            <Badge variant="destructive">
                                                <XCircle class="h-3 w-3 mr-1" />
                                                Rejected
                                            </Badge>
                                        {:else if application.status === 'pending'}
                                            <Badge variant="secondary">
                                                <AlertCircle class="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        {:else}
                                            <Badge variant="outline">
                                                {application.status}
                                            </Badge>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </CardContent>
            </Card>

            <!-- Top Matches -->
            <Card class="col-span-3">
                <CardHeader>
                    <CardTitle>Top Matches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        {#if dashboardData.topMatches.length === 0}
                            <div class="text-center py-8 text-muted-foreground">
                                <Users class="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No matches yet</p>
                                <p class="text-sm mt-2">Complete your profile to get better matches</p>
                            </div>
                        {:else}
                            {#each dashboardData.topMatches as match}
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <Building2 class="h-4 w-4 text-muted-foreground" />
                                            <p class="font-medium text-sm">{match.companyName}</p>
                                        </div>
                                        <Badge variant="outline" class="text-xs">
                                            {match.matchScore}% match
                                        </Badge>
                                    </div>
                                    <div class="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin class="h-3 w-3" />
                                        {match.location}
                                    </div>
                                    <Progress value={match.matchScore} class="h-2" />
                                </div>
                            {/each}
                        {/if}
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Upcoming Deadlines -->
        {#if dashboardData.upcomingDeadlines.length > 0}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-3">
                        {#each dashboardData.upcomingDeadlines as deadline}
                            <div class="flex items-center justify-between border-b pb-3 last:border-0">
                                <div class="flex items-center gap-3">
                                    <Calendar class="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p class="font-medium">{deadline.title}</p>
                                        <p class="text-sm text-muted-foreground">{deadline.description}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium">
                                        {new Date(deadline.date).toLocaleDateString()}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {deadline.daysRemaining} days remaining
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                </CardContent>
            </Card>
        {/if}
    </div>
</svelte:boundary>