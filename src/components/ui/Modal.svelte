<script>
  import { onMount, onDestroy } from 'svelte';
  import { X } from 'lucide-svelte';

  /**
   * Modal Component
   * @prop {boolean} isOpen - Modal visibility state
   * @prop {string} title - Optional modal title
   */
  export let isOpen = false;
  export let title = '';

  function handleClose() {
    isOpen = false;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  onMount(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
  });

  onDestroy(() => {
    document.body.style.overflow = '';
  });

  $: {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div
      class="bg-charcoal-900/50 absolute inset-0 backdrop-blur-sm"
      on:click={handleBackdropClick}
      on:keydown={(e) => e.key === 'Escape' && handleClose()}
      role="button"
      tabindex="-1"
    ></div>
    <div
      class="bg-sand-50 dark:bg-charcoal-900 relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
    >
      <div class="mb-4 flex items-center justify-between">
        {#if title}
          <h2 class="text-charcoal-800 dark:text-sand-100 text-lg font-semibold">
            {title}
          </h2>
        {/if}
        <button
          on:click={handleClose}
          class="hover:bg-sand-200 dark:hover:bg-charcoal-800 ml-auto p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <slot />
    </div>
  </div>
{/if}
