<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
 	import { ModeWatcher } from "mode-watcher";
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();


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