<script>
  import { Trash2, Check } from 'lucide-svelte'

  export let onDelete = () => {}
  export let confirmText = 'Confirm?'
  export let iconSize = 14

  let pending = false

  const handleClick = () => {
    pending = true
  }

  const handleConfirm = () => {
    onDelete()
    pending = false
  }

  const handleCancel = () => {
    pending = false
  }
</script>

<div class="relative">
  {#if pending}
    <span
      class="bg-destructive text-destructive-foreground absolute top-1/2 right-full mr-2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium whitespace-nowrap"
    >
      {confirmText}
    </span>
    <button
      on:click={handleConfirm}
      on:mouseleave={handleCancel}
      class="text-destructive hover:bg-accent cursor-pointer rounded-lg p-1 transition-all"
      type="button"
    >
      <Check size={iconSize} />
    </button>
  {:else}
    <button
      on:click={handleClick}
      class="text-destructive hover:bg-accent cursor-pointer rounded-lg p-1 opacity-0 transition-opacity group-hover:opacity-90"
      type="button"
    >
      <Trash2 size={iconSize} />
    </button>
  {/if}
</div>
