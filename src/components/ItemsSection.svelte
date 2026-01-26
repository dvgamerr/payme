<script>
  import { Plus, Trash2, Edit2 } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import Select from './ui/Select.svelte'
  import SaveButtons from './ui/SaveButtons.svelte'
  import DeleteButton from './ui/DeleteButton.svelte'

  export let monthId
  export let items = []
  export let categories = []
  export let isReadOnly = false
  export let onUpdate = () => {}

  let isAdding = false
  let editingId = null
  let description = ''
  let amount = ''
  let categoryId = ''
  let spentOn = new Date().toISOString().split('T')[0]

  let descriptionInput = null
  let amountInput = null

  $: currencySymbol = $settings.currencySymbol || '฿'
  $: categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }))

  async function handleAdd() {
    if (!description || !amount) return
    await api.items.create(monthId, {
      description,
      amount: parseFloat(amount),
      category_id: categoryId ? parseInt(categoryId) : null,
      spent_on: spentOn,
    })
    resetForm()
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!description || !amount) return
    await api.items.update(monthId, id, {
      description,
      amount: parseFloat(amount),
      category_id: categoryId ? parseInt(categoryId) : null,
      spent_on: spentOn,
    })
    resetForm()
    await onUpdate()
  }

  async function handleDelete(id) {
    await api.items.delete(monthId, id)
    await onUpdate()
  }

  function startEdit(item) {
    editingId = item.id
    description = item.description
    amount = item.amount.toString()
    categoryId = item.category_id ? item.category_id.toString() : ''
    spentOn = item.spent_on
  }

  function resetForm() {
    editingId = null
    description = ''
    amount = ''
    categoryId = ''
    spentOn = new Date().toISOString().split('T')[0]
    isAdding = false
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  function startAdd() {
    resetForm()
    isAdding = true
    if (categories.length > 0) {
      categoryId = categories[0].id.toString()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (editingId) {
        handleUpdate(editingId)
      } else if (isAdding) {
        handleAdd()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      resetForm()
    }
  }

  $: if (isAdding && descriptionInput) {
    descriptionInput.focus()
  }

  $: if (editingId && descriptionInput) {
    descriptionInput.focus()
  }
</script>

<Card className="col-span-full">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold tracking-wide uppercase">Transactions</h3>
    {#if !isReadOnly && !isAdding}
      <button
        on:click={startAdd}
        class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
        title="Add transaction"
      >
        <Plus size={16} />
      </button>
    {/if}
  </div>

  {#if isAdding && categories.length === 0}
    <div class="text-muted-foreground py-6 text-center text-sm">
      <p class="mb-1">No categories available.</p>
      <p class="text-xs">Please add categories in Settings first.</p>
      <button on:click={resetForm} class="text-foreground mt-3 text-xs hover:opacity-70">
        Close
      </button>
    </div>
  {/if}

  <table class="w-full text-sm">
    <thead>
      <tr class="border-border border-b">
        <th class="text-muted-foreground py-3 text-left text-xs font-medium">Date</th>
        <th class="text-muted-foreground py-3 text-left text-xs font-medium">Description</th>
        <th class="text-muted-foreground py-3 text-left text-xs font-medium">Category</th>
        <th class="text-muted-foreground py-3 text-right text-xs font-medium">Amount</th>
        {#if !isReadOnly}
          <th class="w-20"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#if isAdding && categories.length > 0}
        <tr class="hover:bg-accent/50 transition-colors">
          <td class="py-2">
            <Input
              type="date"
              bind:value={spentOn}
              className="text-xs"
              on:keydown={handleKeyDown}
            />
          </td>
          <td class="py-2">
            <Input
              placeholder="Description"
              bind:value={description}
              bind:this={descriptionInput}
              className="text-xs"
              on:keydown={handleKeyDown}
            />
          </td>
          <td class="py-2">
            <Select
              options={categoryOptions}
              bind:value={categoryId}
              className="text-xs"
              placeholder="Optional"
              on:keydown={handleKeyDown}
            />
          </td>
          <td class="py-2 text-right">
            <Input
              type="text"
              placeholder="Amount"
              bind:value={amount}
              bind:this={amountInput}
              formatAsNumber={true}
              className="text-xs text-right"
              on:keydown={handleKeyDown}
            />
          </td>
          <td class="py-2">
            <SaveButtons onSave={handleAdd} onCancel={resetForm} />
          </td>
        </tr>
      {/if}
      {#each items as item (item.id)}
        <tr class="border-border hover:bg-accent/50 border-b transition-colors last:border-0">
          {#if editingId === item.id}
            <td class="py-2">
              <Input
                type="date"
                bind:value={spentOn}
                className="text-xs"
                on:keydown={handleKeyDown}
              />
            </td>
            <td class="py-2">
              <Input
                placeholder="Description"
                bind:value={description}
                bind:this={descriptionInput}
                className="text-xs"
                on:keydown={handleKeyDown}
              />
            </td>
            <td class="py-2">
              <Select
                options={categoryOptions}
                bind:value={categoryId}
                className="text-xs"
                on:keydown={handleKeyDown}
              />
            </td>
            <td class="py-2 text-right">
              <Input
                type="text"
                placeholder="Amount"
                bind:value={amount}
                bind:this={amountInput}
                formatAsNumber={true}
                className="text-xs text-right"
                on:keydown={handleKeyDown}
              />
            </td>
            <td class="py-2">
              <SaveButtons onSave={() => handleUpdate(item.id)} onCancel={resetForm} />
            </td>
          {:else}
            <td class="text-muted-foreground py-3 text-sm">{formatDate(item.spent_on)}</td>
            <td class="text-foreground py-3 text-sm">{item.description}</td>
            <td class="py-3">
              {#if item.category_label}
                <span
                  class="bg-accent text-accent-foreground inline-block rounded-full px-2 py-0.5 text-xs"
                >
                  {item.category_label}
                </span>
              {:else}
                <span class="text-muted-foreground text-xs italic">No category</span>
              {/if}
            </td>
            <td class="text-foreground py-3 text-right text-sm font-medium">
              {formatCurrency(item.amount, currencySymbol)}
            </td>
            {#if !isReadOnly}
              <td class="py-2">
                <div class="flex justify-end gap-1">
                  <button
                    on:click={() => startEdit(item)}
                    class="hover:bg-sand-200 dark:hover:bg-charcoal-800 rounded p-1"
                    disabled={isAdding || editingId}
                  >
                    <Edit2 size={14} />
                  </button>
                  <DeleteButton onDelete={() => handleDelete(item.id)} />
                </div>
              </td>
            {/if}
          {/if}
        </tr>
      {/each}

      {#if items.length === 0 && !isAdding}
        <tr>
          <td colspan={isReadOnly ? 4 : 5} class="text-muted-foreground py-8 text-center text-sm">
            No spending items yet
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</Card>
