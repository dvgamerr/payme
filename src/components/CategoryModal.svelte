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

  const onClose = () => {
    resetForm()
    open = false
  }
</script>

<Modal {isOpen} {onClose} title="Manage Categories">
  <div class="mb-4 flex items-center justify-between">
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
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Input placeholder="Category name" bind:value={label} />
        </div>
        <div class="flex items-center gap-2">
          <div class="text-muted-foreground text-sm select-none">{currencySymbol}</div>
          <div class="w-32">
            <Input
              type="text"
              placeholder="Default amount"
              bind:value={defaultAmount}
              formatAsNumber={true}
            />
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button
            on:click={handleAdd}
            class="text-success cursor-pointer p-1.5 opacity-70 hover:opacity-100"
            title="Add"
          >
            <Check size={16} />
          </button>
          <button
            on:click={resetForm}
            class="text-muted-foreground cursor-pointer p-1.5 opacity-70 hover:opacity-100"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
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
            <div class="flex items-center gap-2 py-2">
              <div class="flex-1">
                <Input placeholder="Category name" bind:value={label} className="text-sm" />
              </div>
              <div class="flex items-center gap-2">
                <div class="text-muted-foreground text-sm select-none">{currencySymbol}</div>
                <div class="w-32">
                  <Input
                    type="text"
                    placeholder="Default amount"
                    bind:value={defaultAmount}
                    formatAsNumber={true}
                    className="text-sm"
                  />
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  on:click={() => handleUpdate(category.id)}
                  class="text-success cursor-pointer p-1.5 opacity-70 hover:opacity-100"
                >
                  <Check size={14} />
                </button>
                <button
                  on:click={resetForm}
                  class="text-muted-foreground cursor-pointer p-1.5 opacity-70 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          {:else}
            <div
              class="border-border flex items-center justify-between border-b py-3 transition-colors last:border-0"
            >
              <div class="text-foreground flex-1 text-sm font-medium">{category.label}</div>
              <div class="text-muted-foreground mr-4 text-sm">
                {formatCurrency(category.default_amount || 0, currencySymbol)}
              </div>
              <div class="flex gap-1">
                <button
                  on:click={() => startEdit(category)}
                  class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  on:click={() => handleDelete(category.id)}
                  class="text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-charcoal-800 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</Modal>
