<script>
  /**
   * Input Component
   * @prop {string} label - Optional label text
   * @prop {string} type - Input HTML type
   * @prop {string} value - Input value
   * @prop {string} placeholder - Placeholder text
   */
  export let label = '';
  export let type = 'text';
  export let value = '';
  export let placeholder = '';

  let inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={inputId} class="text-charcoal-600 dark:text-sand-400 text-xs">
      {label}
    </label>
  {/if}
  <input
    id={inputId}
    {type}
    {placeholder}
    bind:value
    class="border-sand-300 dark:border-charcoal-600 text-charcoal-900 dark:text-sand-100 focus:border-sage-500 dark:focus:border-sage-400 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-600 w-full border-b-2 bg-transparent px-1 py-2 text-sm transition-colors focus:outline-none"
    on:input
    on:change
    on:blur
    on:focus
    {...$$restProps}
  />
</div>
