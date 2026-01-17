<script>
  import { Plus } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import numeral from 'numeral'
  import Card from './ui/Card.svelte'
  import FixedExpenseForm from './FixedExpenseForm.svelte'

  export let expenses = []
  export let onUpdate = () => {}

  let isAdding = false
  let editingId = null
  let label = ''
  let amount = ''
  let frequency = 'monthly'
  let currencySymbol = '฿'

  // Subscribe to settings for currency symbol
  $: currencySymbol = $settings.currencySymbol || '฿'

  // Calculate total (always in monthly equivalent)
  $: total = expenses.reduce((sum, e) => {
    const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
    return sum + monthlyAmount
  }, 0)

  function getMonthlyAmount(expense) {
    return expense.frequency === 'yearly' ? expense.amount / 12 : expense.amount
  }

  async function handleAdd() {
    if (!label || !amount) return
    await api.fixedExpenses.create({
      label,
      amount: parseFloat(amount),
      frequency,
    })
    label = ''
    amount = ''
    frequency = 'monthly'
    isAdding = false
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!label || !amount) return
    await api.fixedExpenses.update(id, {
      label,
      amount: parseFloat(amount),
      frequency,
    })
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
    await onUpdate()
  }

  async function handleDelete(id) {
    await api.fixedExpenses.delete(id)
    await onUpdate()
  }

  function startEdit(expense) {
    isAdding = false
    editingId = expense.id
    label = expense.label
    amount = expense.amount.toString()
    frequency = expense.frequency || 'monthly'
  }

  function cancelEdit() {
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
    isAdding = false
  }

  function startAdd() {
    cancelEdit()
    isAdding = true
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
    {#each expenses as expense (expense.id)}
      <div class="flex items-center justify-between">
        {#if editingId === expense.id}
          <!-- Editing Mode -->
          <FixedExpenseForm
            mode="edit"
            bind:label
            bind:amount
            bind:frequency
            onSave={() => handleUpdate(expense.id)}
            onCancel={cancelEdit}
            onDelete={() => handleDelete(expense.id)}
          />
        {:else}
          <!-- View Mode -->
          <button
            on:click={() => startEdit(expense)}
            class="text-foreground hover:bg-muted -mx-3 flex flex-1 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors"
          >
            <span>{expense.label}</span>
            <span class="text-muted-foreground">
              {currencySymbol}{numeral(getMonthlyAmount(expense)).format('0,0.00')}
            </span>
          </button>
        {/if}
      </div>
    {/each}

    {#if isAdding}
      <!-- Add New Expense -->
      <FixedExpenseForm
        mode="add"
        bind:label
        bind:amount
        bind:frequency
        onSave={handleAdd}
        onCancel={cancelEdit}
      />
    {/if}

    {#if expenses.length === 0 && !isAdding}
      <div class="text-muted-foreground py-6 text-center text-sm">No fixed expenses</div>
    {/if}
  </div>

  {#if expenses.length > 0}
    <div class="border-border mt-4 flex justify-between border-t pt-3">
      <span class="text-muted-foreground text-xs tracking-wide uppercase"> Total </span>
      <span class="text-foreground text-sm font-semibold">
        {currencySymbol}{numeral(total).format('0,0.00')}
      </span>
    </div>
  {/if}
</Card>
