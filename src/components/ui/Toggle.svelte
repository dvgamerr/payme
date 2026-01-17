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
  class="hover:bg-muted hover:border-accent {width} border-border placeholder:text-muted-foreground hover:border-foreground hover:border-accent border-b bg-transparent px-2 py-2 text-left text-sm capitalize transition-colors focus:outline-none"
>
  <span>{selectedLabel}</span>
</button>
