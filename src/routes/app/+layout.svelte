<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import '../../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import StudentSidebar from '$lib/components/layout/StudentSidebar.svelte';
	import CompanySidebar from '$lib/components/layout/CompanySidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import StudentHeader from '$lib/components/layout/StudentHeader.svelte';
	import CompanyHeader from '$lib/components/layout/CompanyHeader.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import StudentMobileNav from '$lib/components/layout/StudentMobileNav.svelte';
	import CompanyMobileNav from '$lib/components/layout/CompanyMobileNav.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();

	let session = $derived(data.session);
	let user = $derived(session?.user);
	let userType = $derived(user?.userType);
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
	<!-- Desktop Layout -->
	<div class="hidden lg:flex h-screen bg-background">
		<!-- Sidebar -->
		<div class="w-64 border-r bg-card">
			{#if userType === 'student'}
				<StudentSidebar {user} />
			{:else if userType === 'company'}
				<CompanySidebar {user} />
			{:else}
				<Sidebar {user} />
			{/if}
		</div>
		
		<!-- Main Content -->
		<div class="flex-1 flex flex-col overflow-hidden">
			<!-- Header -->
			<div class="border-b bg-card">
				{#if userType === 'student'}
					<StudentHeader {user} />
				{:else if userType === 'company'}
					<CompanyHeader {user} />
				{:else}
					<Header {user} />
				{/if}
			</div>
			
			<!-- Page Content -->
			<main class="flex-1 overflow-auto p-6">
				{@render children()}
			</main>
		</div>
	</div>

	<!-- Mobile Layout -->
	<div class="lg:hidden flex flex-col h-screen bg-background">
		<!-- Mobile Header -->
		<div class="border-b bg-card">
			{#if userType === 'student'}
				<StudentHeader {user} />
			{:else if userType === 'company'}
				<CompanyHeader {user} />
			{:else}
				<Header {user} />
			{/if}
		</div>
		
		<!-- Page Content -->
		<main class="flex-1 overflow-auto p-4">
			{@render children()}
		</main>
		
		<!-- Bottom Navigation -->
		<div class="border-t bg-card">
			{#if userType === 'student'}
				<StudentMobileNav />
			{:else if userType === 'company'}
				<CompanyMobileNav />
			{:else}
				<MobileNav />
			{/if}
		</div>
	</div>
{:else}
	<!-- Non-app pages (auth, landing, etc.) -->
	{@render children()}
{/if}

<!-- Toast notifications -->
<Toaster />