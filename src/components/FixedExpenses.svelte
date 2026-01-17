<script>
  import { Plus, Trash2, Pen, Check, X, Settings } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import numeral from 'numeral'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import Select from './ui/Select.svelte'
  import Button from './ui/Button.svelte'
  import Modal from './ui/Modal.svelte'

  export let expenses = []
  export let onUpdate = () => {}

  let isManaging = false
  let isAdding = false
  let editingId = null
  let label = ''
  let amount = ''
  let frequency = 'monthly'
  let currencySymbol = '฿'

  // Subscribe to settings for currency symbol
  $: currencySymbol = $settings.currencySymbol || '฿'

  // Reset form when modal closes
  $: if (!isManaging) {
    isAdding = false
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
  }

  function closeModal() {
    isManaging = false
  }

  // Calculate monthly equivalent for total
  $: total = expenses.reduce((sum, e) => {
    const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
    return sum + monthlyAmount
  }, 0)

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
  }

  function cancelEdit() {
    editingId = null
    label = ''
    amount = ''
    frequency = 'monthly'
    isAdding = false
  }

  function getDisplayAmount(expense) {
    if (expense.frequency === 'yearly') {
      return `${currencySymbol}${numeral(expense.amount).format('0,0')}/ปี (${currencySymbol}${numeral(expense.amount / 12).format('0,0')}/เดือน)`
    }
    return `${currencySymbol}${numeral(expense.amount).format('0,0')}/เดือน`
  }
</script>

<Card>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold">Fixed</h3>
    <button
      on:click={() => (isManaging = true)}
      class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
    >
      <Settings size={16} />
    </button>
  </div>

  <div class="space-y-0">
    {#each expenses as expense (expense.id)}
      <div class="border-border flex items-center justify-between border-b py-2.5 last:border-0">
        <span class="text-foreground text-sm">
          {expense.label}
        </span>
        <span class="text-muted-foreground text-sm">
          {getDisplayAmount(expense)}
        </span>
      </div>
    {/each}
    {#if expenses.length === 0}
      <div class="text-muted-foreground py-6 text-center text-sm">No fixed expenses</div>
    {/if}
  </div>

  {#if expenses.length > 0}
    <div class="border-border mt-4 flex justify-between border-t pt-3">
      <span class="text-foreground text-sm font-medium"> Total (Monthly) </span>
      <span class="text-foreground text-sm font-semibold">
        {currencySymbol}{numeral(total).format('0,0')}
      </span>
    </div>
  {/if}
</Card>

<Modal bind:isOpen={isManaging} onClose={closeModal} title="Manage Fixed Expenses">
  <div class="space-y-3">
    {#each expenses as expense (expense.id)}
      <div>
        {#if editingId === expense.id}
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <Input placeholder="Label" bind:value={label} />
            </div>
            <div class="w-32">
              <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
            </div>
            <div class="w-28">
              <Select
                bind:value={frequency}
                options={[
                  { value: 'monthly', label: 'รายเดือน' },
                  { value: 'yearly', label: 'รายปี' },
                ]}
              />
            </div>
            <button
              on:click={() => handleUpdate(expense.id)}
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
            class="border-sand-200 dark:border-charcoal-800 flex items-center justify-between border-b py-2"
          >
            <span class="text-sm">{expense.label}</span>
            <div class="flex items-center gap-2">
              <span class="text-sm">{getDisplayAmount(expense)}</span>
              <button on:click={() => startEdit(expense)} class="p-1 opacity-70 hover:opacity-100">
                <Pen size={14} />
              </button>
              <button
                on:click={() => handleDelete(expense.id)}
                class="text-destructive p-1 opacity-70 hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
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
        <div class="w-28">
          <Select
            bind:value={frequency}
            options={[
              { value: 'monthly', label: 'รายเดือน' },
              { value: 'yearly', label: 'รายปี' },
            ]}
          />
        </div>
        <Button size="sm" on:click={handleAdd}>
          <Check size={16} />
        </Button>
        <Button size="sm" variant="ghost" on:click={cancelEdit}>
          <X size={16} />
        </Button>
      </div>
    {:else}
      <Button
        variant="secondary"
        size="sm"
        on:click={() => (isAdding = true)}
        className="w-full mt-2"
      >
        <Plus size={16} class="mr-2" />
        Add Expense
      </Button>
    {/if}
  </div>
</Modal>
