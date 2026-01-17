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
    <label for={selectId} class="text-foreground text-sm font-medium">
      {label}
    </label>
  {/if}
  <select
    id={selectId}
    bind:value
    class="border-border focus:border-foreground w-full cursor-pointer border-b bg-transparent px-0 py-2 text-sm transition-colors focus:outline-none"
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
