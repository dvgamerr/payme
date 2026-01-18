<script>
  import { Plus, Trash2, Edit2, Check, X } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'

  export let monthId
  export let entries = []
  export let isReadOnly = false
  export let onUpdate = () => {}

  $: currencySymbol = $settings.currencySymbol || '฿'

  let isAdding = false
  let editingId = null
  let label = ''
  let amount = ''

  async function handleAdd() {
    if (!label || !amount || !monthId) {
      console.error('Missing required data:', { label, amount, monthId })
      return
    }
    await api.income.create(monthId, { label, amount: parseFloat(amount) })
    label = ''
    amount = ''
    isAdding = false
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!label || !amount || !monthId) {
      console.error('Missing required data:', { label, amount, monthId, id })
      return
    }
    await api.income.update(monthId, id, { label, amount: parseFloat(amount) })
    editingId = null
    label = ''
    amount = ''
    await onUpdate()
  }

  async function handleDelete(id) {
    if (!monthId) {
      console.error('Missing monthId:', monthId)
      return
    }
    await api.income.delete(monthId, id)
    await onUpdate()
  }

  function startEdit(entry) {
    editingId = entry.id
    label = entry.label
    amount = entry.amount.toString()
  }

  function cancelEdit() {
    editingId = null
    label = ''
    amount = ''
    isAdding = false
  }
</script>

<Card>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold">Income</h3>
    {#if !isReadOnly && !isAdding}
      <button
        on:click={() => (isAdding = true)}
        class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
      >
        <Plus size={16} />
      </button>
    {/if}
  </div>

  <div class="space-y-3">
    {#each entries as entry (entry.id)}
      <div>
        {#if editingId === entry.id}
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <Input placeholder="Label" bind:value={label} />
            </div>
            <div class="w-32">
              <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
            </div>
            <button
              on:click={() => handleUpdate(entry.id)}
              class="p-1.5 opacity-70 hover:opacity-100"
            >
              <Check size={16} />
            </button>
            <button on:click={cancelEdit} class="p-1.5 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        {:else}
          <div
            class="border-border group flex items-center justify-between border-b py-2.5 last:border-0"
          >
            <span class="text-foreground text-sm">
              {entry.label}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-foreground text-sm font-medium">
                {formatCurrency(entry.amount, currencySymbol)}
              </span>
              {#if !isReadOnly}
                <button
                  on:click={() => startEdit(entry)}
                  class="p-1 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  on:click={() => handleDelete(entry.id)}
                  class="text-destructive p-1 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}

    {#if isAdding}
      <div class="flex items-end gap-2 pt-2">
        <div class="flex-1">
          <Input placeholder="Label" bind:value={label} />
        </div>
        <div class="w-32">
          <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
        </div>
        <button on:click={handleAdd} class="p-1.5 opacity-70 hover:opacity-100">
          <Check size={16} />
        </button>
        <button on:click={cancelEdit} class="p-1.5 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    {/if}

    {#if entries.length === 0 && !isAdding}
      <div class="text-muted-foreground py-6 text-center text-sm">No income entries</div>
    {/if}
  </div>
</Card>
