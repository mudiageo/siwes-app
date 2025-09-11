<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Redirect to dashboard if authenticated, otherwise to login
		goto('/auth/login');
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<div class="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 mx-auto animate-pulse"></div>
		<p class="mt-4 text-muted-foreground">Loading SIWES AI...</p>
	</div>
</div>