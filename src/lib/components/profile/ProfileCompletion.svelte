<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
import AlertCircle from '@lucide/svelte/icons/alert-circle';

	interface Props {
		completeness?: number;
		userType?: 'student' | 'company';
	}

	let { completeness = 0, userType = 'student' }: Props = $props();

	const studentTasks = [
		{ label: 'Personal Information', completed: true, href: '/profile' },
		{ label: 'Academic Details', completed: true, href: '/profile' },
		{ label: 'Skills & Preferences', completed: false, href: '/profile' },
		{ label: 'Upload Resume', completed: false, href: '/profile' },
		{ label: 'Profile Photo', completed: false, href: '/profile' }
	];

	const companyTasks = [
		{ label: 'Company Information', completed: true, href: '/profile' },
		{ label: 'Company Logo', completed: false, href: '/profile' },
		{ label: 'Verification Documents', completed: false, href: '/profile' },
		{ label: 'Post First Placement', completed: false, href: '/placements/new' },
		{ label: 'Contact Details', completed: true, href: '/profile' }
	];

	let tasks = $derived(userType === 'student' ? studentTasks : companyTasks);
	let completedTasks = $derived(tasks.filter(task => task.completed).length);
	let completionPercentage = $derived(Math.round((completedTasks / tasks.length) * 100));
</script>

<Card class="p-6">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-foreground">Profile Completion</h3>
			<span class="text-2xl font-bold text-primary">{completionPercentage}%</span>
		</div>

		<Progress value={completionPercentage} class="h-2" />

		<div class="space-y-3">
			{#each tasks as task}
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						{#if task.completed}
							<CheckCircle class="h-5 w-5 text-success-600" />
						{:else}
							<AlertCircle class="h-5 w-5 text-warning-600" />
						{/if}
						<span class="text-sm font-medium text-foreground">{task.label}</span>
					</div>
					
					{#if !task.completed}
						<Button variant="ghost" size="sm" href={task.href} class="text-xs">
							Complete
						</Button>
					{/if}
				</div>
			{/each}
		</div>

		{#if completionPercentage < 100}
			<div class="border-t border-border pt-4">
				<p class="text-sm text-muted-foreground mb-3">
					Complete your profile to get better matches and increase your visibility.
				</p>
				<Button href="/profile" class="w-full">
					Complete Profile
				</Button>
			</div>
		{/if}
	</div>
</Card>