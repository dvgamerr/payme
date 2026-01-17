<script>
  import { Moon, Sun, LogOut, ChartColumn, Settings } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme.js';
  import { auth } from '../stores/auth.js';

  // Initialize theme on mount
  onMount(() => {
    theme.init();
  });

  $: isDark = $theme;
  $: user = $auth.user;
</script>

<div class="min-h-screen">
  <header class="bg-background/95 sticky top-0 z-40">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div>
        <h1 class="text-2xl font-bold">Payme</h1>
        <p class="text-muted-foreground text-sm">Track your money, simply.</p>
      </div>
      <div class="flex items-center gap-1">
        {#if user}
          <button
            class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            title="Statistics"
          >
            <ChartColumn size={16} />
          </button>
          <button
            class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        {/if}
        <button
          on:click={() => theme.toggle()}
          class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          title="Toggle theme"
        >
          {#if isDark}
            <Sun size={16} />
          {:else}
            <Moon size={16} />
          {/if}
          <span class="sr-only">Toggle theme</span>
        </button>
        {#if user}
          <button
            on:click={() => auth.logout()}
            class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        {/if}
      </div>
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-4 py-8">
    <slot />
  </main>
</div>
