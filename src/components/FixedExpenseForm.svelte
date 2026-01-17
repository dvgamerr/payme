<script>
  import { Trash2 } from 'lucide-svelte'
  import Input from './ui/Input.svelte'
  import Toggle from './ui/Toggle.svelte'

  /**
   * Fixed Expense Form Component
   * @prop {string} mode - 'add' | 'edit'
   * @prop {string} label - Expense label
   * @prop {string} amount - Expense amount
   * @prop {string} frequency - 'monthly' | 'yearly'
   * @prop {Function} onSave - Callback when saving
   * @prop {Function} onCancel - Callback when canceling
   * @prop {Function} onDelete - Callback when deleting (edit mode only)
   */
  export let mode = 'add'
  export let label = ''
  export let amount = ''
  export let frequency = 'monthly'
  export let onSave = () => {}
  export let onCancel = () => {}
  export let onDelete = null

  let amountInput = null

  $: if (mode === 'edit' && amountInput) {
    amountInput.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSave()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  function handleBlur() {
    if (label || amount) {
      onSave()
    }
  }
</script>

<div class="flex flex-1 items-end gap-2">
  <div class="flex-1">
    <Input
      placeholder="Expense"
      bind:value={label}
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
    />
  </div>
  <div class="w-22">
    <Input
      type="text"
      placeholder="Amount"
      bind:value={amount}
      bind:this={amountInput}
      formatAsNumber={true}
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
    />
  </div>
  <div class="flex items-end">
    <Toggle
      bind:value={frequency}
      width="w-22"
      options={[
        { value: 'monthly', label: 'รายเดือน' },
        { value: 'yearly', label: 'รายปี' },
      ]}
    />
  </div>
  {#if mode === 'edit' && onDelete}
    <button
      on:click={onDelete}
      class="text-destructive cursor-pointer p-1.5 opacity-70 hover:opacity-100"
    >
      <Trash2 size={16} />
    </button>
  {/if}
</div>
