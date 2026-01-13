<script>
  import { Moon, Sun, LogOut, Download, Upload } from 'lucide-svelte';
  import { theme } from '../stores/theme.js';
  import { auth } from '../stores/auth.js';
  import { api } from '../lib/api.js';
  import Modal from './ui/Modal.svelte';
  import Button from './ui/Button.svelte';

  let fileInput;
  let showImportConfirm = false;
  let pendingImport = null;
  let importing = false;

  $: isDark = $theme === 'dark';
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
  <header
    class="bg-sand-50/80 dark:bg-charcoal-950/80 border-sand-200 dark:border-charcoal-800 sticky top-0 z-40 border-b backdrop-blur-md"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <span class="text-charcoal-800 dark:text-sand-100 text-xl font-semibold tracking-tight">
        payme
      </span>
      {#if user}
        <span class="text-charcoal-600 dark:text-charcoal-300 text-sm">
          Welcome, {user.username}
        </span>
      {/if}
      <div class="flex items-center gap-2">
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
            class="hover:bg-sand-200 dark:hover:bg-charcoal-800 cursor-pointer p-2 transition-colors"
            title="Import data"
          >
            <Upload size={18} />
          </button>
          <button
            on:click={handleExport}
            class="hover:bg-sand-200 dark:hover:bg-charcoal-800 cursor-pointer p-2 transition-colors"
            title="Export data"
          >
            <Download size={18} />
          </button>
        {/if}
        <button
          on:click={() => theme.toggle()}
          class="hover:bg-sand-200 dark:hover:bg-charcoal-800 cursor-pointer p-2 transition-colors"
        >
          {#if isDark}
            <Sun size={18} />
          {:else}
            <Moon size={18} />
          {/if}
        </button>
        {#if user}
          <button
            on:click={() => auth.logout()}
            class="hover:bg-sand-200 dark:hover:bg-charcoal-800 cursor-pointer p-2 transition-colors"
          >
            <LogOut size={18} />
          </button>
        {/if}
      </div>
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-4 py-8">
    <slot />
  </main>

  <Modal isOpen={showImportConfirm} onClose={() => (showImportConfirm = false)} title="Import Data">
    <div class="space-y-4">
      <p class="text-charcoal-600 dark:text-charcoal-300 text-sm">
        This will replace all your current data with the imported file.
      </p>
      {#if pendingImport}
        <div
          class="text-charcoal-500 dark:text-charcoal-400 bg-sand-100 dark:bg-charcoal-800 p-3 text-xs"
        >
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
