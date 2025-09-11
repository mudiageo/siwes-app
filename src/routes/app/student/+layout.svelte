<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import StudentSidebar from '$lib/components/layout/StudentSidebar.svelte';
	import StudentMobileNav from '$lib/components/layout/StudentMobileNav.svelte';
	import StudentHeader from '$lib/components/layout/StudentHeader.svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();

	let sidebarCollapsed = $state(false);
	let showMobileMenu = $state(false);
	let isDarkMode = $state(false);
	let notificationCount = $state(0);
	
	$: session = data.session;
	$: user = session?.user;

	// Initialize theme
	onMount(() => {
		isDarkMode = document.documentElement.classList.contains('dark');
		// Fetch notification count if needed
	});

	function handleToggleMobileMenu(event: CustomEvent) {
		showMobileMenu = event.detail.open;
	}

	function handleToggleTheme(event: CustomEvent) {
		isDarkMode = event.detail.dark;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<div class="relative flex h-screen overflow-hidden">
	<!-- Desktop Sidebar -->
	<div class="hidden md:block">
		<StudentSidebar bind:collapsed={sidebarCollapsed} />
	</div>

	<!-- Mobile Sidebar Overlay -->
	{#if showMobileMenu}
		<div 
			class="fixed inset-0 z-50 md:hidden"
			onclick={() => showMobileMenu = false}
			onkeydown={(e) => e.key === 'Escape' && (showMobileMenu = false)}
			role="button"
			tabindex="0"
		>
			<div class="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
			<div class="absolute left-0 top-0 h-full">
				<StudentSidebar collapsed={false} />
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<div class={cn(
		"flex flex-1 flex-col overflow-hidden transition-all duration-300",
		"md:ml-0",
		!sidebarCollapsed ? "lg:ml-64" : "lg:ml-16"
	)}>
		<!-- Header -->
		<StudentHeader 
			{showMobileMenu}
			{isDarkMode}
			{notificationCount}
			on:toggle-mobile-menu={handleToggleMobileMenu}
			on:toggle-theme={handleToggleTheme}
		/>

		<!-- Page Content -->
		<main class="main-content flex-1 p-6 pb-20 md:pb-6">
			<slot />
		</main>
	</div>

	<!-- Mobile Navigation -->
	<StudentMobileNav />
</div>