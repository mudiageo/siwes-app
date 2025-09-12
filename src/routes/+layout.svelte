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

	<main class="min-h-screen">
		{@render children?.()}
	</main>