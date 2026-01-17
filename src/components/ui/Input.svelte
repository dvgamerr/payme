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
    <label for={inputId} class="text-foreground text-sm font-medium">
      {label}
    </label>
  {/if}
  <input
    id={inputId}
    {type}
    {placeholder}
    bind:value
    class="border-border placeholder:text-muted-foreground focus:border-foreground w-full border-b bg-transparent px-0 py-2 text-sm transition-colors focus:outline-none"
    on:input
    on:change
    on:blur
    on:focus
    {...$$restProps}
  />
</div>
