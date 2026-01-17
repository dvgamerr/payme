<script>
  import { Plus, Check, X, Trash2 } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import numeral from 'numeral'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import Toggle from './ui/Toggle.svelte'

  export let expenses = []
  export let onUpdate = () => {}

  let isAdding = false
  let editingId = null
  let label = ''
  let amount = ''
  let frequency = 'monthly'
  let currencySymbol = '฿'
  let amountInput = null

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
    editingId = expense.id
    label = expense.label
    amount = expense.amount.toString()
    frequency = expense.frequency || 'monthly'
    setTimeout(() => amountInput?.focus(), 0)
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
          <div class="flex flex-1 items-end gap-2">
            <div class="flex-1">
              <Input placeholder="Expense" bind:value={label} />
            </div>
            <div class="w-22">
              <Input
                type="text"
                placeholder="Amount"
                bind:value={amount}
                bind:this={amountInput}
                formatAsNumber={true}
              />
            </div>
            <div class="flex items-end">
              <Toggle
                bind:value={frequency}
                options={[
                  { value: 'monthly', label: 'รายเดือน' },
                  { value: 'yearly', label: 'รายปี' },
                ]}
              />
            </div>
            <div class="gap-0">
              <button
                on:click={() => handleUpdate(expense.id)}
                class="cursor-pointer py-1.5 opacity-70 hover:opacity-100"
              >
                <Check size={16} />
              </button>
              <button
                on:click={cancelEdit}
                class="cursor-pointer py-1.5 opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
            <button
              on:click={() => handleDelete(expense.id)}
              class="text-destructive p-1.5 opacity-70 hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
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
      <div class="flex items-end gap-2 pt-2">
        <div class="flex-1">
          <Input placeholder="Expense" bind:value={label} />
        </div>
        <div class="w-22">
          <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
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
        <div class="gap-0">
          <button on:click={handleAdd} class="cursor-pointer py-1.5 opacity-70 hover:opacity-100">
            <Check size={16} />
          </button>
          <button on:click={cancelEdit} class="cursor-pointer py-1.5 opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      </div>
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
