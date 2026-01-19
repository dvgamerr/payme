<script>
  import { Plus, Trash2, Edit2, Check, X } from 'lucide-svelte'
  import Modal from './ui/Modal.svelte'
  import Button from './ui/Button.svelte'
  import Input from './ui/Input.svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import { formatCurrency } from '../lib/format-utils.js'

  export let open = false
  export let categories = []
  export let onUpdate = () => {}

  $: currencySymbol = $settings.currencySymbol || '฿'

  let isAdding = false
  let editingId = null
  let label = ''
  let defaultAmount = ''

  $: isOpen = open

  const handleAdd = async () => {
    if (!label || !defaultAmount) return
    try {
      await api.categories.create({
        label,
        default_amount: parseFloat(defaultAmount),
      })
      resetForm()
      await onUpdate()
    } catch (err) {
      console.error('Failed to add category:', err)
    }
  }

  const handleUpdate = async (id) => {
    if (!label || !defaultAmount) return
    try {
      await api.categories.update(id, {
        label,
        default_amount: parseFloat(defaultAmount),
      })
      resetForm()
      await onUpdate()
    } catch (err) {
      console.error('Failed to update category:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Existing transactions will keep their labels.')) return
    try {
      await api.categories.delete(id)
      await onUpdate()
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  const startEdit = (category) => {
    editingId = category.id
    label = category.label
    defaultAmount = category.default_amount?.toString() || '0'
  }

  const resetForm = () => {
    editingId = null
    label = ''
    defaultAmount = ''
    isAdding = false
  }

  const handleClose = () => {
    resetForm()
    open = false
  }
</script>

<Modal {isOpen} onClose={handleClose}>
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-foreground text-lg font-semibold">Manage Categories</h2>
    {#if !isAdding}
      <button
        on:click={() => (isAdding = true)}
        class="hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      >
        <Plus size={18} />
      </button>
    {/if}
  </div>

  {#if isAdding}
    <div class="border-border mb-4 border-b pb-4">
      <div class="grid grid-cols-2 gap-3">
        <Input placeholder="Category name" bind:value={label} />
        <Input
          type="text"
          placeholder="Default amount"
          bind:value={defaultAmount}
          formatAsNumber={true}
        />
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

  <div class="max-h-96 overflow-y-auto">
    {#if categories.length === 0}
      <div class="text-muted-foreground py-8 text-center text-sm">No categories yet</div>
    {:else}
      <div class="space-y-2">
        {#each categories as category (category.id)}
          {#if editingId === category.id}
            <div class="border-border rounded-lg border p-3">
              <div class="grid grid-cols-2 gap-3">
                <Input placeholder="Category name" bind:value={label} className="text-sm" />
                <Input
                  type="text"
                  placeholder="Default amount"
                  bind:value={defaultAmount}
                  formatAsNumber={true}
                  className="text-sm"
                />
              </div>
              <div class="mt-3 flex gap-2">
                <button
                  on:click={() => handleUpdate(category.id)}
                  class="text-sage-600 hover:bg-sage-100 dark:hover:bg-charcoal-800 rounded p-1"
                >
                  <Check size={16} />
                </button>
                <button
                  on:click={resetForm}
                  class="text-charcoal-500 hover:bg-sand-200 dark:hover:bg-charcoal-800 rounded p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          {:else}
            <div
              class="bg-accent/30 hover:bg-accent flex items-center justify-between rounded-lg p-3 transition-colors"
            >
              <div class="flex-1">
                <div class="text-foreground text-sm font-medium">{category.label}</div>
                <div class="text-muted-foreground text-xs">
                  Default: {formatCurrency(category.default_amount || 0, currencySymbol)}
                </div>
              </div>
              <div class="flex gap-1">
                <button
                  on:click={() => startEdit(category)}
                  class="hover:bg-sand-200 dark:hover:bg-charcoal-800 rounded p-2"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  on:click={() => handleDelete(category.id)}
                  class="text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-charcoal-800 rounded p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <div class="border-border mt-4 border-t pt-4">
    <Button variant="ghost" on:click={handleClose} className="w-full">Close</Button>
  </div>
</Modal>
