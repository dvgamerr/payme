<script>
  import {
    Moon,
    Sun,
    LogOut,
    Download,
    Upload,
    Wallet,
    ChartColumn,
    Settings,
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { theme } from '../stores/theme.js';
  import { auth } from '../stores/auth.js';
  import { api } from '../lib/api.js';
  import Modal from './ui/Modal.svelte';
  import Button from './ui/Button.svelte';

  let fileInput;
  let showImportConfirm = false;
  let pendingImport = null;
  let importing = false;

  // Initialize theme on mount
  onMount(() => {
    theme.init();
  });

  // Reset import state when modal closes
  $: if (!showImportConfirm) {
    pendingImport = null;
    importing = false;
  }

  function closeImportModal() {
    showImportConfirm = false;
  }

  $: isDark = $theme;
  $: user = $auth.user;

  function handleExport() {
    api.exportJson().then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payme-${user?.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleImportClick() {
    fileInput?.click();
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.version && data.categories && data.months) {
        pendingImport = data;
        showImportConfirm = true;
      }
    } catch {
      // Invalid JSON, ignore
    }

    if (fileInput) {
      fileInput.value = '';
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    importing = true;
    try {
      await api.importJson(pendingImport);
      window.location.reload();
    } catch {
      // Import failed, ignore
    } finally {
      importing = false;
      showImportConfirm = false;
      pendingImport = null;
    }
  }
</script>

<div class="min-h-screen">
  <header class="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div>
        <h1 class="text-2xl font-bold">Payme</h1>
        <p class="text-muted-foreground text-sm">Track your money, simply.</p>
      </div>
      <div class="flex items-center gap-1">
        {#if user}
          <input
            bind:this={fileInput}
            type="file"
            accept=".json"
            on:change={handleFileSelect}
            class="hidden"
          />
          <button
            on:click={handleImportClick}
            class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            title="Import data"
          >
            <Upload size={16} />
          </button>
          <button
            on:click={handleExport}
            class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            title="Export data"
          >
            <Download size={16} />
          </button>
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

  <Modal bind:isOpen={showImportConfirm} onClose={closeImportModal} title="Import Data">
    <div class="space-y-4">
      <p class="text-muted-foreground text-sm">
        This will replace all your current data with the imported file.
      </p>
      {#if pendingImport}
        <div class="bg-accent/30 rounded-lg p-3 text-sm">
          <div>{pendingImport.categories.length} categories</div>
          <div>{pendingImport.fixed_expenses.length} fixed expenses</div>
          <div>{pendingImport.months.length} months</div>
        </div>
      {/if}
      <div class="flex gap-2">
        <Button on:click={confirmImport} disabled={importing}>
          {importing ? 'Importing...' : 'Replace My Data'}
        </Button>
        <Button variant="ghost" on:click={() => (showImportConfirm = false)}>Cancel</Button>
      </div>
    </div>
  </Modal>
</div>
