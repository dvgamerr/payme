<script>
  import { ChevronRight } from 'lucide-svelte'

  /**
   * Toggle Component
   * @prop {Array} options - Array of {value, label} objects (max 2 options)
   * @prop {string|number} value - Selected value
   * @prop {string} width - Fixed width (e.g., 'w-16', 'w-20')
   */
  export let options = []
  export let value = ''
  export let width = 'w-16'

  $: selectedLabel = options.find((opt) => opt.value === value)?.label || ''

  function toggle() {
    const currentIndex = options.findIndex((opt) => opt.value === value)
    const nextIndex = (currentIndex + 1) % options.length
    value = options[nextIndex].value
  }
</script>

<button
  type="button"
  on:click={toggle}
  class="border-border hover:bg-muted hover:border-accent text-muted-foreground hover:text-foreground {width} flex cursor-pointer items-center justify-between gap-1 rounded-xs border px-2 py-1 text-sm transition-colors"
>
  <ChevronRight size={12} class="opacity-50" />
  <span>{selectedLabel}</span>
</button>
