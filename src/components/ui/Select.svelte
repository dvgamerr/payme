<script>
  /**
   * Select Component
   * @prop {string} label - Optional label text
   * @prop {Array} options - Array of {value, label} objects
   * @prop {string|number} value - Selected value
   */
  export let label = '';
  export let options = [];
  export let value = '';

  let selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={selectId} class="text-charcoal-600 dark:text-sand-400 text-xs">
      {label}
    </label>
  {/if}
  <select
    id={selectId}
    bind:value
    class="border-sand-300 dark:border-charcoal-600 text-charcoal-900 dark:text-sand-100 focus:border-sage-500 dark:focus:border-sage-400 w-full cursor-pointer border-b-2 bg-transparent px-1 py-2 text-sm transition-colors focus:outline-none"
    on:change
    on:blur
    on:focus
    {...$$restProps}
  >
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
</div>
