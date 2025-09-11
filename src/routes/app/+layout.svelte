<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../../app.css';
	import { Toaster } from '$lib/components/ui/sonner';

	let { data } = $props();

	$: session = data.session;
	$: user = session?.user;
	$: userType = user?.userType;

	// Redirect to appropriate app section
	onMount(() => {
		if (user) {
			const currentPath = $page.url.pathname;
			if (currentPath === '/app' || currentPath === '/app/') {
				const redirectPath = userType === 'student' ? '/app/student' : '/app/company';
				window.location.href = redirectPath;
			}
		}
	});
</script>

<slot />

<!-- Toast notifications -->
<Toaster />