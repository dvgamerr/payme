<script>
  import { Plus, GripVertical } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'
  import { dndzone } from 'svelte-dnd-action'
  import { flip } from 'svelte/animate'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import SaveButtons from './ui/SaveButtons.svelte'
  import DeleteButton from './ui/DeleteButton.svelte'

  export let monthId
  export let entries = []
  export let totalIncome = 0
  export let isReadOnly = false
  export let onUpdate = () => {}

  const flipDurationMs = 0

  $: currencySymbol = $settings.currencySymbol || '฿'
  $: items = entries.map((entry) => ({ id: entry.id, data: entry }))

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
    isAdding = false
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

  function startAdd() {
    cancelEdit()
    isAdding = true
  }

  function handleDndConsider(e) {
    items = e.detail.items
  }

  async function handleDndFinalize(e) {
    items = e.detail.items
    const newOrder = items.map((item) => item.data.id)
    try {
      await api.income.reorder(monthId, newOrder)
    } catch (error) {
      console.error('Failed to reorder income:', error)
      await onUpdate()
    }
  }
</script>

<Card>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold tracking-wide uppercase">Income</h3>
    {#if !isReadOnly}
      <button
        on:click={startAdd}
        class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
      >
        <Plus size={16} />
      </button>
    {/if}
  </div>

  <div class="min-h-50 space-y-0">
    <div
      use:dndzone={{
        items,
        flipDurationMs,
        type: 'incomeEntries',
        dragDisabled: editingId !== null || isAdding || isReadOnly,
        dropTargetStyle: {},
      }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}
    >
      {#each items as item (item.id)}
        {@const entry = item.data}
        <div
          animate:flip={{ duration: flipDurationMs }}
          class="group flex items-center justify-between outline-none focus:outline-none"
        >
          {#if editingId === entry.id}
            <div class="flex flex-1 items-end gap-2 pl-4">
              <div class="flex-1">
                <Input placeholder="Label" bind:value={label} />
              </div>
              <div class="w-36">
                <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
              </div>
              <SaveButtons onSave={() => handleUpdate(entry.id)} onCancel={cancelEdit} />
            </div>
          {:else}
            <button
              on:click={() => startEdit(entry)}
              class="text-foreground hover:bg-muted flex flex-1 items-center justify-between rounded-[0.5em] py-2 text-left text-sm
              {editingId || isAdding ? 'pr-3 pl-4' : 'px-3'}"
              disabled={isReadOnly}
            >
              {#if !editingId && !isAdding && !isReadOnly}
                <div
                  class="text-muted-foreground mr-1 -ml-1 cursor-grab opacity-40 active:cursor-grabbing"
                >
                  <GripVertical size={16} />
                </div>
              {/if}
              <span class="flex-1">
                {entry.label}
              </span>
              <span class="text-muted-foreground">
                {formatCurrency(entry.amount, currencySymbol)}
              </span>
            </button>
            {#if !isReadOnly}
              <DeleteButton onDelete={() => handleDelete(entry.id)} />
            {/if}
          {/if}
        </div>
      {/each}
    </div>

    {#if isAdding}
      <div class="flex items-end gap-2 pl-4">
        <div class="flex-1">
          <Input placeholder="Label" bind:value={label} />
        </div>
        <div class="w-36">
          <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
        </div>
        <SaveButtons onSave={handleAdd} onCancel={cancelEdit} />
      </div>
    {/if}

    {#if entries.length === 0 && !isAdding}
      <div class="text-muted-foreground py-6 text-center text-sm">No income entries</div>
    {/if}
  </div>

  {#if entries.length > 0}
    <div class="border-border mt-4 flex justify-between border-t pt-3">
      <span class="text-muted-foreground text-xs tracking-wide uppercase"> Total </span>
      <span class="text-foreground text-sm font-semibold">
        {formatCurrency(totalIncome, currencySymbol)}
      </span>
    </div>
  {/if}
</Card>
