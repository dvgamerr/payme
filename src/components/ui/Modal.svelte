<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { X } from 'lucide-svelte';

  /**
   * Modal Component
   * @prop {boolean} isOpen - Modal visibility state
   * @prop {string} title - Optional modal title
   */
  export let isOpen = false;
  export let title = '';
  export let onClose = () => {};

  const dispatch = createEventDispatcher();

  function handleClose() {
    isOpen = false;
    onClose();
    dispatch('close');
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  // Reactive statement to handle body overflow
  $: if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center" on:keydown={handleKeydown}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      class="bg-charcoal-900/50 absolute inset-0 backdrop-blur-sm"
      on:click={handleBackdropClick}
    ></div>
    <div
      class="bg-sand-50 dark:bg-charcoal-900 animate-fadeIn relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
    >
      <div class="mb-4 flex items-center justify-between">
        {#if title}
          <h2 class="text-charcoal-800 dark:text-sand-100 text-lg font-semibold">
            {title}
          </h2>
        {/if}
        <button
          on:click={handleClose}
          class="hover:bg-sand-200 dark:hover:bg-charcoal-800 ml-auto rounded p-1 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>
      <slot />
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
</style>
