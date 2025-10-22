<script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { getApplications, updateApplicationStatus } from '$lib/applications.remote';
    import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import Calendar from '@lucide/svelte/icons/calendar';
    import User from '@lucide/svelte/icons/user';
    import Mail from '@lucide/svelte/icons/mail';
    import GraduationCap from '@lucide/svelte/icons/graduation-cap';
    import TrendingUp from '@lucide/svelte/icons/trending-up';

    const formatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' });

    let applications = $state(await getApplications());
    let selectedApplication = $state<typeof applications[0] | null>(null);

    let applicationsByStatus = $derived({
        pending: applications.filter(a => a.application.status === 'pending'),
        reviewing: applications.filter(a => a.application.status === 'reviewing'),
        interview: applications.filter(a => a.application.status === 'interview'),
        accepted: applications.filter(a => a.application.status === 'accepted'),
        rejected: applications.filter(a => a.application.status === 'rejected')
    });

    async function handleStatusUpdate(applicationId: string, newStatus: string) {
        try {
            await updateApplicationStatus(applicationId, newStatus as any);
            applications = await getApplications();
            toast.success('Application status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    }
</script>

<div class="container mx-auto p-6">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Applications Received</h1>
        <p class="text-muted-foreground">Review and manage applications to your placement opportunities</p>
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

    {#if applications.length === 0}
        <Card>
            <CardContent class="flex flex-col items-center justify-center py-12">
                <p class="text-muted-foreground mb-4">No applications received yet</p>
                <p class="text-sm text-muted-foreground">Create placement opportunities to receive applications</p>
            </CardContent>
        </Card>
    {:else}
        <div class="space-y-4">
            {#each applications as { application, placement, student }}
                <Card class="hover:shadow-md transition-shadow">
                    <CardContent class="p-6">
                        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h3 class="text-lg font-semibold">{student.fullName}</h3>
                                    {#if application.matchScore}
                                        <Badge variant="secondary">
                                            <TrendingUp class="h-3 w-3 mr-1" />
                                            {Math.round(application.matchScore)}% Match
                                        </Badge>
                                    {/if}
                                </div>
                                
                                <div class="text-sm font-medium text-muted-foreground mb-3">
                                    Applied to: {placement.title}
                                </div>

                                <div class="space-y-2 text-sm text-muted-foreground">
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
                                        <DialogTrigger>
                                            <Button variant="outline" size="sm" onclick={() => selectedApplication = { application, placement, student }}>
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
                                                                <SelectValue placeholder="Select status" />
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
                                            <SelectValue placeholder="Change status" />
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
</div>
