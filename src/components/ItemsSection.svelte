<script>
  import { Plus, Trash2, Edit2, Check, X, Settings } from 'lucide-svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'
  import Card from './ui/Card.svelte'
  import Input from './ui/Input.svelte'
  import Select from './ui/Select.svelte'
  import Button from './ui/Button.svelte'
  import CategoryModal from './CategoryModal.svelte'

  export let monthId
  export let items = []
  export let categories = []
  export let isReadOnly = false
  export let onUpdate = () => {}

  let showCategoryModal = false

  let isAdding = false
  let editingId = null
  let description = ''
  let amount = ''
  let categoryId = ''
  let spentOn = new Date().toISOString().split('T')[0]

  $: currencySymbol = $settings.currencySymbol || '฿'
  $: categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }))

  async function handleAdd() {
    if (!description || !amount || !categoryId) return
    await api.items.create(monthId, {
      description,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      spent_on: spentOn,
    })
    resetForm()
    await onUpdate()
  }

  async function handleUpdate(id) {
    if (!description || !amount || !categoryId) return
    await api.items.update(monthId, id, {
      description,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
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
    categoryId = item.category_id.toString()
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
</script>

<Card className="col-span-full">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-foreground text-sm font-semibold">Transactions</h3>
    {#if !isReadOnly && !isAdding}
      <div class="flex gap-1">
        <button
          on:click={() => (showCategoryModal = true)}
          class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          title="Manage categories"
        >
          <Settings size={16} />
        </button>
        <button
          on:click={() => {
            isAdding = true
            if (categories.length > 0) {
              categoryId = categories[0].id.toString()
            }
          }}
          class="hover:bg-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          title="Add transaction"
        >
          <Plus size={16} />
        </button>
      </div>
    {/if}
  </div>

  {#if isAdding && categories.length === 0}
    <div class="border-border mb-4 border-t pt-4 text-center">
      <p class="text-muted-foreground mb-1 text-sm">No budget categories yet.</p>
      <p class="text-muted-foreground text-xs">Add some in the Budget section first.</p>
      <button on:click={resetForm} class="text-foreground mt-3 text-xs hover:opacity-70">
        Close
      </button>
    </div>
  {/if}

  {#if isAdding && categories.length > 0}
    <div class="border-border mb-4 border-t pt-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input placeholder="Description" bind:value={description} />
        <Input type="text" placeholder="Amount" bind:value={amount} formatAsNumber={true} />
        <Select options={categoryOptions} bind:value={categoryId} />
        <Input type="date" bind:value={spentOn} />
      </div>
      <div class="mt-3 flex gap-2">
        <Button size="sm" on:click={handleAdd}>
          <Check size={16} class="mr-1" />
          Add
        </Button>
        <Button size="sm" variant="ghost" on:click={resetForm}>
          <X size={16} class="mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  {/if}

  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-border border-b">
          <th class="text-muted-foreground py-3 text-left text-xs font-medium">Date</th>
          <th class="text-muted-foreground py-3 text-left text-xs font-medium"> Description </th>
          <th class="text-muted-foreground py-3 text-left text-xs font-medium">Category</th>
          <th class="text-muted-foreground py-3 text-right text-xs font-medium">Amount</th>
          {#if !isReadOnly}
            <th class="w-20"></th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each items as item (item.id)}
          <tr class="border-border hover:bg-accent/50 border-b transition-colors last:border-0">
            {#if editingId === item.id}
              <td class="py-2">
                <Input type="date" bind:value={spentOn} className="text-xs" />
              </td>
              <td class="py-2">
                <Input placeholder="Description" bind:value={description} className="text-xs" />
              </td>
              <td class="py-2">
                <Select options={categoryOptions} bind:value={categoryId} className="text-xs" />
              </td>
              <td class="py-2 text-right">
                <Input
                  type="text"
                  placeholder="Amount"
                  bind:value={amount}
                  formatAsNumber={true}
                  className="text-xs text-right"
                />
              </td>
              <td class="py-2">
                <div class="flex justify-end gap-1">
                  <button
                    on:click={() => handleUpdate(item.id)}
                    class="text-sage-600 hover:bg-sage-100 dark:hover:bg-charcoal-800 p-1"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    on:click={resetForm}
                    class="text-charcoal-500 hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </td>
            {:else}
              <td class="text-muted-foreground py-3 text-sm">
                {new Date(item.spent_on).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td class="text-foreground py-3 text-sm">
                {item.description}
              </td>
              <td class="py-3">
                <span
                  class="bg-accent text-accent-foreground inline-block rounded-full px-2 py-0.5 text-xs"
                >
                  {item.category_label}
                </span>
              </td>
              <td class="text-foreground py-3 text-right text-sm font-medium">
                {formatCurrency(item.amount, currencySymbol)}
              </td>
              {#if !isReadOnly}
                <td class="py-2">
                  <div class="flex justify-end gap-1">
                    <button
                      on:click={() => startEdit(item)}
                      class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      on:click={() => handleDelete(item.id)}
                      class="text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-charcoal-800 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              {/if}
            {/if}
          </tr>
        {/each}
        {#if items.length === 0}
          <tr>
            <td
              colspan={isReadOnly ? 4 : 5}
              class="text-charcoal-400 dark:text-charcoal-600 py-8 text-center text-sm"
            >
              No spending items yet
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</Card>

<CategoryModal bind:open={showCategoryModal} {categories} {onUpdate} />
