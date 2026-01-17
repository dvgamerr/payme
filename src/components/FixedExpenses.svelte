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
  let currency = 'THB'
  let currencySymbol = '฿'

  // Subscribe to settings for currency symbol
  $: currencySymbol = $settings.currencySymbol || '฿'
  $: baseCurrency = $settings.baseCurrency || 'THB'

  // Calculate total (always in monthly equivalent and base currency)
  $: total = expenses.reduce((sum, e) => {
    const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
    const exchangeRate = e.exchange_rate || 1
    return sum + monthlyAmount * exchangeRate
  }, 0)

  function getMonthlyAmount(expense) {
    const monthlyAmount = expense.frequency === 'yearly' ? expense.amount / 12 : expense.amount
    const exchangeRate = expense.exchange_rate || 1
    return monthlyAmount * exchangeRate
  }

  async function fetchExchangeRate(fromCurrency) {
    if (fromCurrency === baseCurrency) {
      return 1
    }
    try {
      const response = await fetch(`/api/exchange-rates?from=${fromCurrency}&to=${baseCurrency}`)
      if (!response.ok) throw new Error('Failed to fetch exchange rate')
      const data = await response.json()
      return data.rate
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      return 1
    }
  }

  async function handleAdd() {
    if (!label || !amount) return
    const exchangeRate = await fetchExchangeRate(currency)
    await api.fixedExpenses.create({
      label,
      amount: parseFloat(amount),
      frequency,
      currency,
      exchange_rate: exchangeRate,
    })
    label = ''
    amount = ''
    frequency = 'monthly'
    currency = 'THB'
    isAdding = false
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!label || !amount) return
    const exchangeRate = await fetchExchangeRate(currency)
    await api.fixedExpenses.update(id, {
      label,
      amount: parseFloat(amount),
      frequency,
      currency,
      exchange_rate: exchangeRate,
    })
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
    currency = 'THB'
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
    currency = expense.currency || 'THB'
  }

  function cancelEdit() {
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
    currency = 'THB'
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
            bind:currency
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
            <span>
              {expense.label}
              {#if expense.currency && expense.currency !== baseCurrency}
                <span class="text-muted-foreground ml-2 text-xs">({expense.currency})</span>
              {/if}
            </span>
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
        bind:currency
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
