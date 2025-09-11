<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { ApplicationStatus as Status } from '$lib/db/schema.js';
	
  import CheckCircle from '@lucide/svelte/icons/check-circle';
  import Clock from '@lucide/svelte/icons/clock';
  import Eye from '@lucide/svelte/icons/eye';
  import MessageSquare from '@lucide/svelte/icons/message-square';
  import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
  import ThumbsDown from '@lucide/svelte/icons/thumbs-up';
  import X from '@lucide/svelte/icons/x';


	interface Props {
		status: Status;
		appliedDate: Date;
		reviewedDate?: Date | null;
		interviewDate?: Date | null;
	}

	let {
		status,
		appliedDate,
		reviewedDate = null,
		interviewDate = null
	}: Props = $props();

	const statusConfig = {
		pending: { 
			label: 'Pending Review', 
			icon: Clock, 
			variant: 'secondary' as const,
			color: 'text-warning-600',
			step: 1
		},
		reviewing: { 
			label: 'Under Review', 
			icon: Eye, 
			variant: 'default' as const,
			color: 'text-primary',
			step: 2
		},
		interview: { 
			label: 'Interview Scheduled', 
			icon: MessageSquare, 
			variant: 'default' as const,
			color: 'text-primary',
			step: 3
		},
		accepted: { 
			label: 'Accepted', 
			icon: ThumbsUp, 
			variant: 'default' as const,
			color: 'text-success-600',
			step: 4
		},
		rejected: { 
			label: 'Not Selected', 
			icon: ThumbsDown, 
			variant: 'destructive' as const,
			color: 'text-error-600',
			step: 4
		},
		withdrawn: { 
			label: 'Withdrawn', 
			icon: X, 
			variant: 'secondary' as const,
			color: 'text-muted-foreground',
			step: 0
		}
	};

	let config = $derived(statusConfig[status]);
	let progressValue = $derived((config.step / 4) * 100);

	const timeline = [
		{ label: 'Applied', completed: true, date: appliedDate },
		{ label: 'Review', completed: status !== 'pending', date: reviewedDate },
		{ label: 'Interview', completed: ['interview', 'accepted'].includes(status), date: interviewDate },
		{ label: 'Decision', completed: ['accepted', 'rejected'].includes(status), date: null }
	];
</script>

<Card class="p-4">
	<div class="space-y-4">
		<!-- Status Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<config.icon class="h-5 w-5 {config.color}" />
				<span class="font-medium text-foreground">{config.label}</span>
			</div>
			<Badge variant={config.variant}>{config.label}</Badge>
		</div>

		<!-- Progress Bar -->
		{#if status !== 'withdrawn'}
			<div class="space-y-2">
				<Progress value={progressValue} class="h-2" />
				<div class="flex justify-between text-xs text-muted-foreground">
					<span>Applied</span>
					<span>Review</span>
					<span>Interview</span>
					<span>Decision</span>
				</div>
			</div>
		{/if}

		<!-- Timeline -->
		<div class="space-y-2">
			{#each timeline as step}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center space-x-2">
						{#if step.completed}
							<CheckCircle class="h-4 w-4 text-success-600" />
						{:else}
							<div class="h-4 w-4 rounded-full border-2 border-muted-foreground/30"></div>
						{/if}
						<span class="text-foreground">{step.label}</span>
					</div>
					{#if step.date}
						<span class="text-muted-foreground">
							{step.date.toLocaleDateString()}
						</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Interview Date -->
		{#if interviewDate && status === 'interview'}
			<div class="border-t border-border pt-3">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-foreground">Interview Scheduled</span>
					<span class="text-sm text-primary">
						{interviewDate.toLocaleDateString()} at {interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			</div>
		{/if}
	</div>
</Card>