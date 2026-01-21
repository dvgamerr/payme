<script>
  import { Check, X } from 'lucide-svelte'

  export let onSave = () => {}
  export let onCancel = () => {}
  export let iconSize = 16
</script>

<div class="flex items-center gap-1">
  <button
    on:click={onSave}
    class="text-success hover:bg-accent my-1.5 cursor-pointer rounded-lg p-1 opacity-70 transition-colors hover:opacity-100"
    title="บันทึก"
    type="button"
  >
    <Check size={iconSize} />
  </button>
  <button
    on:click={onCancel}
    class="text-muted-foreground hover:bg-accent my-1.5 cursor-pointer rounded-lg p-1 opacity-70 transition-colors hover:opacity-100"
    title="ยกเลิก"
    type="button"
  >
    <X size={iconSize} />
  </button>
</div>
