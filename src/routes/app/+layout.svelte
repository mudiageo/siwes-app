<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import '../../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();

	let session = $derived(data.session);
	let user = $derived(session?.user);
	let userType = $derived(user?.userType as 'student' | 'company' | undefined);
	let isOnAppPage = $derived(page.url.pathname.startsWith('/app'));

	// Redirect to appropriate app section
	onMount(() => {
		if (user && browser) {
			const currentPath = page.url.pathname;
			if (currentPath === '/app' || currentPath === '/app/') {
				const redirectPath = userType === 'student' ? '/app/student' : '/app/company';
				window.location.href = redirectPath;
			}
		}
	});
</script>

<ModeWatcher />

{#if isOnAppPage && user}
	<!-- Unified Responsive Layout -->
	<div class="flex h-screen bg-background">
		<!-- Desktop Sidebar (hidden on mobile) -->
		<div class="hidden lg:block border-r bg-card">
			<Sidebar userType={userType} />
		</div>
		
		<!-- Main Content Area -->
		<div class="flex-1 flex flex-col overflow-hidden">
			<!-- Header -->
			<div class="border-b bg-card">
				<Header userType={userType} />
			</div>
			
			<!-- Page Content -->
			<main class="flex-1 overflow-auto p-4 lg:p-6">
				{@render children()}
			</main>
			
			<!-- Mobile Bottom Navigation (hidden on desktop) -->
			<div class="lg:hidden border-t bg-card">
				<MobileNav userType={userType} />
			</div>
		</div>
	</div>
{:else}
	<!-- Non-app pages (auth, landing, etc.) -->
	{@render children()}
{/if}

<!-- Toast notifications -->
<Toaster />