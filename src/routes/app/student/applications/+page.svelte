<script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { getApplications } from '$lib/applications.remote';
    import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
    import { goto } from '$app/navigation';
    import Calendar from '@lucide/svelte/icons/calendar';
    import Building2 from '@lucide/svelte/icons/building-2';
    import MapPin from '@lucide/svelte/icons/map-pin';
    import TrendingUp from '@lucide/svelte/icons/trending-up';

    const formatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' });

    let applications = $derived(await getApplications());

    let applicationsByStatus = $derived({
        pending: applications.filter(a => a.application.status === 'pending'),
        reviewing: applications.filter(a => a.application.status === 'reviewing'),
        interview: applications.filter(a => a.application.status === 'interview'),
        accepted: applications.filter(a => a.application.status === 'accepted'),
        rejected: applications.filter(a => a.application.status === 'rejected')
    });
</script>

<div class="container mx-auto p-6">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">My Applications</h1>
        <p class="text-muted-foreground">Track and manage your placement applications</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
            <CardContent class="p-4">
                <p class="text-sm font-medium text-muted-foreground">Total</p>
                <p class="text-2xl font-bold">{applications.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent class="p-4">
                <p class="text-sm font-medium text-muted-foreground">Pending</p>
                <p class="text-2xl font-bold text-yellow-600">{applicationsByStatus.pending.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent class="p-4">
                <p class="text-sm font-medium text-muted-foreground">Under Review</p>
                <p class="text-2xl font-bold text-blue-600">{applicationsByStatus.reviewing.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent class="p-4">
                <p class="text-sm font-medium text-muted-foreground">Interview</p>
                <p class="text-2xl font-bold text-purple-600">{applicationsByStatus.interview.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent class="p-4">
                <p class="text-sm font-medium text-muted-foreground">Accepted</p>
                <p class="text-2xl font-bold text-green-600">{applicationsByStatus.accepted.length}</p>
            </CardContent>
        </Card>
    </div>

    {#if applications.length === 0}
        <Card>
            <CardContent class="flex flex-col items-center justify-center py-12">
                <p class="text-muted-foreground mb-4">You haven't submitted any applications yet</p>
                <Button onclick={() => goto('/app/student/placements')}>Browse Placements</Button>
            </CardContent>
        </Card>
    {:else}
        <div class="space-y-4">
            {#each applications as { application, placement, company }}
                <Card class="hover:shadow-md transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold mb-1">{placement.title}</h3>
                                <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Building2 class="h-4 w-4" />
                                    <span>{company.name}</span>
                                    <span>•</span>
                                    <MapPin class="h-4 w-4" />
                                    <span>{placement.location}</span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar class="h-4 w-4" />
                                    <span>Applied {formatter.format(new Date(application.appliedAt))}</span>
                                    {#if application.matchScore}
                                        <span>•</span>
                                        <TrendingUp class="h-4 w-4" />
                                        <span>Match: {Math.round(application.matchScore)}%</span>
                                    {/if}
                                </div>
                            </div>
                            <div class="flex flex-col items-end gap-3">
                                <ApplicationStatus status={application.status} />
                                <Button variant="outline" size="sm" onclick={() => goto(`/app/student/applications/${application.id}`)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                        {#if application.coverLetter}
                            <div class="mt-4 pt-4 border-t">
                                <p class="text-sm font-medium mb-2">Cover Letter</p>
                                <p class="text-sm text-muted-foreground line-clamp-2">{application.coverLetter}</p>
                            </div>
                        {/if}
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div>
