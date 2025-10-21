<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';
	import { commonSkills } from '$lib/services/sample-data.js';

	interface Props {
		skills?: string[];
		placeholder?: string;
		suggestions?: string[];
		field: any;
	}

	let { skills = $bindable([]), placeholder = "Add skills...", suggestions = commonSkills, field, ...restProps }: Props = $props();

	let inputValue = $state('');
	let showSuggestions = $state(false);
	
	let filteredSuggestions = $derived(suggestions.filter(skill => 
		skill.toLowerCase().includes(inputValue.toLowerCase()) &&
		!skills.includes(skill)
	).slice(0, 8));

	function addSkill() {
		const trimmed = inputValue.trim();
		if (trimmed && !skills.includes(trimmed)) {
			skills.push(trimmed);
			inputValue = '';
			showSuggestions = false;
		}
	}

	function removeSkill(skillToRemove: string) {
		skills = skills.filter(skill => skill !== skillToRemove);
	}

	function addSuggestion(skill: string) {
		skills.push(skill);
		inputValue = '';
		showSuggestions = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addSkill();
		} else if (event.key === 'Escape') {
			showSuggestions = false;
		}
	}
</script>

<div class="space-y-3">
	<!-- Input with suggestions -->
	<div class="relative">
		<div class="flex space-x-2">
			<Input
				bind:value={inputValue}
				{placeholder}
				oninput={() => showSuggestions = inputValue.length > 0}
				onfocus={() => showSuggestions = inputValue.length > 0}
				onkeydown={handleKeydown}
				{...restProps}
				class="flex-1"
			/>
				{#each skills as skill}
      		<input {...field.as("checkbox", skill)} class="hidden"/>
      	{/each}
			<Button 
				type="button" 
				size="sm"
				onclick={addSkill}
				disabled={!inputValue.trim()}
			>
				<Plus class="h-4 w-4" />
			</Button>
		</div>

		<!-- Suggestions dropdown -->
		{#if showSuggestions && filteredSuggestions.length > 0}
			<div class="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover shadow-lg">
				{#each filteredSuggestions as suggestion}
					<button
						type="button"
						class="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
						onclick={() => addSuggestion(suggestion)}
					>
						{suggestion}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Selected skills -->
	{#if skills.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each skills as skill}
				<Badge variant="secondary" class="skill-tag group">
					{skill}
					<button
						type="button"
						class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
						onclick={() => removeSkill(skill)}
					>
						<X class="h-3 w-3" />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}
</div>