<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { toast } from 'svelte-sonner';
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
    import ArrowLeft from '@lucide/svelte/icons/arrow-left';
    import MapPin from '@lucide/svelte/icons/map-pin';
    import Calendar from '@lucide/svelte/icons/calendar';
    import Users from '@lucide/svelte/icons/users';
    import Star from '@lucide/svelte/icons/star';
    import CheckCircle from '@lucide/svelte/icons/check-circle';
    import AlertCircle from '@lucide/svelte/icons/alert-circle';
    import Mail from '@lucide/svelte/icons/mail';
    import GraduationCap from '@lucide/svelte/icons/graduation-cap';
    import TrendingUp from '@lucide/svelte/icons/trending-up';
    import { getPlacement } from '$lib/placements.remote';
    import { getApplications, updateApplicationStatus } from '$lib/applications.remote';
    import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';

    let placementId = $derived(page.params.id);
    let placementPromise = $derived(getPlacement(placementId));
    let applicationsPromise = $derived(getApplications());
    
    let selectedApplication = $state<any>(null);

    const formatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' });

    async function handleStatusUpdate(applicationId: string, newStatus: string) {
        try {
            await updateApplicationStatus(applicationId, newStatus as any);
            applicationsPromise = getApplications();
            toast.success('Application status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    }
</script>

{#await Promise.all([placementPromise, applicationsPromise])}
    <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-center h-64">
            <div class="text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-muted-foreground">Loading placement details...</p>
            </div>
        </div>
    </div>
{:then [placementData, allApplications]}
    {@const { placement, company } = placementData}
    {@const placementApplications = allApplications.filter(app => app.placement.id === placementId)}
    {@const applicationsByStatus = {
        pending: placementApplications.filter(a => a.application.status === 'pending'),
        reviewing: placementApplications.filter(a => a.application.status === 'reviewing'),
        interview: placementApplications.filter(a => a.application.status === 'interview'),
        accepted: placementApplications.filter(a => a.application.status === 'accepted'),
        rejected: placementApplications.filter(a => a.application.status === 'rejected')
    }}

    <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <Button variant="ghost" size="sm" onclick={() => goto('/app/company/placements')}>
                    <ArrowLeft class="h-4 w-4" />
                    Back to Placements
                </Button>
                <div>
                    <h1 class="text-2xl font-bold">{placement.title}</h1>
                    <p class="text-muted-foreground">{company.name}</p>
                </div>
            </div>
            <Button onclick={() => goto(`/app/company/placements/edit/${placement.id}`)}>
                Edit Placement
            </Button>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
                <CardContent class="p-4">
                    <p class="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p class="text-2xl font-bold">{placementApplications.length}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-4">
                    <p class="text-sm font-medium text-muted-foreground">Pending Review</p>
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
                    <p class="text-sm font-medium text-muted-foreground">Interview Stage</p>
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

        <div class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Applications Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {#if placementApplications.length === 0}
                            <div class="text-center py-8">
                                <p class="text-muted-foreground">No applications received yet</p>
                            </div>
                        {:else}
                            <div class="space-y-4">
                                {#each placementApplications as { application, student }}
                                    <Card class="hover:shadow-md transition-shadow">
                                        <CardContent class="p-4">
                                            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-3 mb-2">
                                                        <h4 class="font-semibold">{student.fullName}</h4>
                                                        {#if application.matchScore}
                                                            <Badge variant="secondary">
                                                                <TrendingUp class="h-3 w-3 mr-1" />
                                                                {Math.round(application.matchScore)}% Match
                                                            </Badge>
                                                        {/if}
                                                    </div>

                                                    <div class="space-y-1 text-sm text-muted-foreground">
                                                        <div class="flex items-center gap-2">
                                                            <Mail class="h-4 w-4" />
                                                            <span>{student.email}</span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            <GraduationCap class="h-4 w-4" />
                                                            <span>{student.university} - {student.course}</span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            <Calendar class="h-4 w-4" />
                                                            <span>Applied {formatter.format(new Date(application.appliedAt))}</span>
                                                        </div>
                                                    </div>

                                                    {#if student.skills && student.skills.length > 0}
                                                        <div class="mt-3 flex flex-wrap gap-2">
                                                            {#each student.skills.slice(0, 5) as skill}
                                                                <Badge variant="outline">{skill}</Badge>
                                                            {/each}
                                                            {#if student.skills.length > 5}
                                                                <Badge variant="outline">+{student.skills.length - 5} more</Badge>
                                                            {/if}
                                                        </div>
                                                    {/if}
                                                </div>

                                                <div class="flex flex-col items-end gap-3">
                                                    <ApplicationStatus status={application.status} />
                                                    
                                                    <div class="flex gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" onclick={() => selectedApplication = { application, student }}>
                                                                    View Details
                                                                </Button>
                                                            </DialogTrigger>
                                                            {#if selectedApplication}
                                                                <DialogContent class="max-w-2xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Application Details</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div class="space-y-4">
                                                                        <div>
                                                                            <h4 class="font-semibold mb-2">Student Information</h4>
                                                                            <div class="space-y-1 text-sm">
                                                                                <p><strong>Name:</strong> {selectedApplication.student.fullName}</p>
                                                                                <p><strong>Email:</strong> {selectedApplication.student.email}</p>
                                                                                <p><strong>University:</strong> {selectedApplication.student.university}</p>
                                                                                <p><strong>Course:</strong> {selectedApplication.student.course}</p>
                                                                                <p><strong>Year:</strong> {selectedApplication.student.yearOfStudy}</p>
                                                                            </div>
                                                                        </div>

                                                                        {#if selectedApplication.student.bio}
                                                                            <div>
                                                                                <h4 class="font-semibold mb-2">Bio</h4>
                                                                                <p class="text-sm text-muted-foreground">{selectedApplication.student.bio}</p>
                                                                            </div>
                                                                        {/if}

                                                                        {#if selectedApplication.application.coverLetter}
                                                                            <div>
                                                                                <h4 class="font-semibold mb-2">Cover Letter</h4>
                                                                                <p class="text-sm text-muted-foreground whitespace-pre-wrap">{selectedApplication.application.coverLetter}</p>
                                                                            </div>
                                                                        {/if}

                                                                        <div>
                                                                            <h4 class="font-semibold mb-2">Update Status</h4>
                                                                            <Select
                                                                                value={selectedApplication.application.status}
                                                                                onValueChange={(value) => {
                                                                                    if (value && selectedApplication) {
                                                                                        handleStatusUpdate(selectedApplication.application.id, value);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger class="w-full">
                                                                                    <span>{selectedApplication.application.status}</span>
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                                    <SelectItem value="reviewing">Under Review</SelectItem>
                                                                                    <SelectItem value="interview">Interview</SelectItem>
                                                                                    <SelectItem value="accepted">Accepted</SelectItem>
                                                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            {/if}
                                                        </Dialog>

                                                        <Select
                                                            value={application.status}
                                                            onValueChange={(value) => {
                                                                if (value) {
                                                                    handleStatusUpdate(application.id, value);
                                                                }
                                                            }}
                                                        >
                                                            <SelectTrigger class="w-[140px]">
                                                                <span>{application.status}</span>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="reviewing">Under Review</SelectItem>
                                                                <SelectItem value="interview">Interview</SelectItem>
                                                                <SelectItem value="accepted">Accepted</SelectItem>
                                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                {/each}
                            </div>
                        {/if}
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Placement Details</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div>
                            <h4 class="font-semibold mb-2">Description</h4>
                            <div class="text-sm text-muted-foreground prose prose-sm">
                                {@html placement.description?.replace(/\n/g, '<br>') || 'No description'}
                            </div>
                        </div>

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
                            <span class="text-sm">{placement.maxStudents} positions available</span>
                        </div>
                        {#if placement.stipend}
                            <div class="flex items-center gap-2">
                                <Star class="h-4 w-4 text-muted-foreground" />
                                <span class="text-sm">₦{placement.stipend.toLocaleString()}/month</span>
                            </div>
                        {/if}
                    </CardContent>
                </Card>

                {#if placement.requiredSkills?.length}
                    <Card>
                        <CardHeader>
                            <CardTitle>Required Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="flex flex-wrap gap-2">
                                {#each placement.requiredSkills as skill}
                                    <Badge variant="secondary">{skill}</Badge>
                                {/each}
                            </div>
                        </CardContent>
                    </Card>
                {/if}

                {#if placement.skillsToLearn?.length}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills Students Will Learn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="flex flex-wrap gap-2">
                                {#each placement.skillsToLearn as skill}
                                    <Badge variant="outline">{skill}</Badge>
                                {/each}
                            </div>
                        </CardContent>
                    </Card>
                {/if}

                <Card>
                    <CardHeader>
                        <CardTitle>Placement Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            {#if placement.isActive}
                                <CheckCircle class="h-5 w-5 text-green-500" />
                                <Badge class="bg-green-50 text-green-600 border-green-200">Active</Badge>
                            {:else}
                                <AlertCircle class="h-5 w-5 text-gray-500" />
                                <Badge variant="secondary">Inactive</Badge>
                            {/if}
                        </div>
                        <p class="text-sm text-muted-foreground mt-2">
                            {#if placement.isActive}
                                This placement is currently accepting applications.
                            {:else}
                                This placement is not currently accepting applications.
                            {/if}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
{:catch error}
    <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center gap-4">
            <Button variant="ghost" size="sm" onclick={() => goto('/app/company/placements')}>
                <ArrowLeft class="h-4 w-4" />
                Back to Placements
            </Button>
        </div>
        <Card>
            <CardContent class="text-center py-8">
                <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 class="text-lg font-semibold mb-2">Failed to Load Placement</h2>
                <p class="text-muted-foreground">
                    {error?.message || 'An error occurred while loading the placement details.'}
                </p>
            </CardContent>
        </Card>
    </div>
{/await}