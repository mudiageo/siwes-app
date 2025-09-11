<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { cn } from '$lib/utils';
 import { ModeWatcher } from "mode-watcher";
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let sidebarCollapsed = $state(false);
	let showMobileMenu = $state(false);
	let userType: 'student' | 'company' = 'student';


	function getPageTitle(pathname: string): string {
		const titles: { [key: string]: string } = {
			'/dashboard': 'Dashboard',
			'/matches': 'Find Matches',
			'/applications': 'My Applications',
			'/profile': 'Profile',
			'/settings': 'Settings',
			'/placements': 'Manage Placements',
			'/analytics': 'Analytics'
		};
		
		return titles[pathname] || 'SIWES AI';
	}

	function handleToggleMobileMenu(state: Boolean) {
		showMobileMenu = state;
	}

	// Mock user data - in real app this would come from auth
	let isAuthPage = $derived(page.url.pathname.startsWith('/auth'));
	let pageTitle = $derived(getPageTitle(page.url.pathname));
</script>
 

<svelte:head>
	<title>{pageTitle} - SIWES AI</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
{#if isAuthPage}
	<!-- Auth pages without layout -->
	<main class="min-h-screen">
		{@render children?.()}
	</main>
{:else}
	<!-- Main app layout -->
	<div class="relative flex h-screen overflow-hidden">
		<!-- Desktop Sidebar -->
		<div class="hidden md:block">
			<Sidebar bind:collapsed={sidebarCollapsed} {userType} />
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
					<Sidebar collapsed={false} {userType} />
				</div>
			</div>
		{/if}

		<!-- Main Content -->
		<div class={cn(
			"flex flex-1 flex-col overflow-hidden transition-all duration-300",
			"md:ml-0", // Always start at 0 on mobile
			!sidebarCollapsed ? "lg:ml-64" : "lg:ml-16"
		)}>
			<!-- Header -->
			<Header 
				title={pageTitle}
				{showMobileMenu}
				notificationCount={7}
			/>

			<!-- Page Content -->
			<main class="main-content flex-1 p-6 pb-20 md:pb-6">
				{@render children?.()}
			</main>
		</div>

		<!-- Mobile Navigation -->
		<MobileNav {userType} />
	</div>
{/if}