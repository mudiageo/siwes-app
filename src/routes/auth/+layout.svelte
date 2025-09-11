<script lang="ts">
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
	<div class="flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-md">
			<!-- Logo -->
			<div class="mb-8 text-center">
				<div class="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600"></div>
				<h1 class="mt-4 text-2xl font-bold gradient-text">SIWES AI</h1>
				<p class="text-sm text-muted-foreground mt-1">Smart placement matching for Nigerian engineering students</p>
			</div>

			{@render children?.()}
		</div>
	</div>
</div>