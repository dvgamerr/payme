<script>
  import { ChevronDown } from 'lucide-svelte'

  /**
   * Custom Select Component
   * @prop {string} label - Optional label text
   * @prop {Array} options - Array of {value, label} objects
   * @prop {string|number} value - Selected value
   */
  export let label = ''
  export let options = []
  export let value = ''

  let isOpen = false
  let selectId = `select-${Math.random().toString(36).substr(2, 9)}`

  $: selectedLabel = options.find((opt) => opt.value === value)?.label || ''

  function toggleDropdown() {
    isOpen = !isOpen
  }

  function selectOption(optionValue) {
    value = optionValue
    isOpen = false
  }

  function handleClickOutside(event) {
    if (!event.target.closest(`#${selectId}`)) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="flex flex-col gap-1" id={selectId}>
  {#if label}
    <div class="text-foreground text-sm font-medium">
      {label}
    </div>
  {/if}
  <div class="relative">
    <button
      type="button"
      on:click|stopPropagation={toggleDropdown}
      class="border-border placeholder:text-muted-foreground focus:border-foreground hover:border-accent w-full border-b bg-transparent px-0 py-2 text-left text-sm transition-colors focus:outline-none {isOpen
        ? 'border-foreground'
        : ''}"
      {...$$restProps}
    >
      <div class="flex items-center justify-between">
        <span class={selectedLabel ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedLabel || 'เลือก...'}
        </span>
        <ChevronDown
          size={14}
          class="text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}"
        />
      </div>
    </button>

    {#if isOpen}
      <div
        class="bg-card border-border absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-xs border shadow-lg"
      >
        {#each options as opt}
          <button
            type="button"
            on:click={() => selectOption(opt.value)}
            class="hover:bg-muted text-foreground block w-full px-3 py-2 text-left text-sm transition-colors {opt.value ===
            value
              ? 'bg-muted'
              : ''}"
          >
            {opt.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
