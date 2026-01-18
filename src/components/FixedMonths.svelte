<script>
  import { Plus, GripVertical, Pencil, Trash2, X, Check } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'
  import { dndzone } from 'svelte-dnd-action'
  import { flip } from 'svelte/animate'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import Button from './ui/Button.svelte'

  export let monthId
  export let fixedExpenses = []
  export let totalFixed = 0
  export let onUpdate = () => {}

  let isAdding = false
  let editingId = null
  let name = ''
  let amount = ''

  const flipDurationMs = 0

  $: currencySymbol = $settings.currencySymbol || '฿'
  $: items = fixedExpenses.map((exp) => ({ id: exp.id, data: exp }))

  async function handleAdd() {
    if (!name || !amount) return
    await api.fixedMonths.create(monthId, {
      name,
      amount: parseFloat(amount),
    })
    name = ''
    amount = ''
    isAdding = false
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!name || !amount) return
    await api.fixedMonths.update(monthId, id, {
      name,
      amount: parseFloat(amount),
    })
    editingId = null
    name = ''
    amount = ''
    onUpdate()
  }

  async function handleDelete(id) {
    if (confirm('Delete this fixed expense?')) {
      await api.fixedMonths.delete(monthId, id)
      onUpdate()
    }
  }

  function startEdit(expense) {
    isAdding = false
    editingId = expense.id
    name = expense.name
    amount = expense.amount.toString()
  }

  function cancelEdit() {
    editingId = null
    name = ''
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
      await api.fixedMonths.reorder(monthId, newOrder)
    } catch (error) {
      console.error('Failed to reorder fixed months:', error)
      onUpdate()
    }
  }
</script>

<Card>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold tracking-wide uppercase">Fixed</h3>
    <button
      on:click={startAdd}
      class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
    >
      <Plus size={16} />
    </button>
  </div>

  <div class="min-h-[200px] space-y-0">
    <div
      use:dndzone={{
        items,
        flipDurationMs,
        type: 'fixedMonths',
        dragDisabled: editingId !== null || isAdding,
        dropTargetStyle: {},
      }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}
    >
      {#each items as item (item.id)}
        {@const expense = item.data}
        <div
          animate:flip={{ duration: flipDurationMs }}
          class="flex items-center justify-between outline-none focus:outline-none"
        >
          {#if editingId === expense.id}
            <div class="-mx-3 flex w-full items-center gap-2 rounded-[0.5em] px-3 py-2">
              <Input
                type="text"
                bind:value={name}
                placeholder="Name"
                class="flex-1 text-sm"
                on:keydown={(e) => e.key === 'Enter' && handleUpdate(expense.id)}
              />
              <Input
                type="number"
                bind:value={amount}
                placeholder="Amount"
                class="w-24 text-sm"
                on:keydown={(e) => e.key === 'Enter' && handleUpdate(expense.id)}
              />
              <div class="flex gap-1">
                <button
                  on:click={() => handleUpdate(expense.id)}
                  class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  title="Save"
                >
                  <Check size={16} class="text-green-600" />
                </button>
                <button
                  on:click={() => handleDelete(expense.id)}
                  class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} class="text-red-600" />
                </button>
                <button
                  on:click={cancelEdit}
                  class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          {:else}
            <button
              on:click={() => startEdit(expense)}
              class="text-foreground hover:bg-muted -mx-3 flex flex-1 items-center justify-between rounded-[0.5em] px-3 py-2 text-left text-sm transition-colors"
            >
              {#if !editingId && !isAdding}
                <div
                  class="text-muted-foreground mr-1 -ml-1 cursor-grab opacity-40 active:cursor-grabbing"
                >
                  <GripVertical size={16} />
                </div>
              {/if}
              <span class="flex-1">{expense.name}</span>
              <span class="text-muted-foreground">
                {formatCurrency(expense.amount, currencySymbol)}
              </span>
            </button>
          {/if}
        </div>
      {/each}
    </div>

    {#if isAdding}
      <div class="-mx-3 flex w-full items-center gap-2 rounded-[0.5em] px-3 py-2">
        <Input
          type="text"
          bind:value={name}
          placeholder="Name"
          class="flex-1 text-sm"
          on:keydown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Input
          type="number"
          bind:value={amount}
          placeholder="Amount"
          class="w-24 text-sm"
          on:keydown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <div class="flex gap-1">
          <button
            on:click={handleAdd}
            class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            title="Save"
          >
            <Check size={16} class="text-green-600" />
          </button>
          <button
            on:click={cancelEdit}
            class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    {/if}

    {#if fixedExpenses.length === 0 && !isAdding}
      <div class="text-muted-foreground py-6 text-center text-sm">No fixed expenses</div>
    {/if}
  </div>

  {#if fixedExpenses.length > 0}
    <div class="border-border mt-4 flex justify-between border-t pt-3">
      <span class="text-muted-foreground text-xs tracking-wide uppercase"> Total </span>
      <span class="text-foreground text-sm font-semibold">
        {formatCurrency(totalFixed, currencySymbol)}
      </span>
    </div>
  {/if}
</Card>
