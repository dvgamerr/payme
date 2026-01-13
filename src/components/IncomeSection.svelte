<script>
  import { Plus, Trash2, Edit2, Check, X } from 'lucide-svelte';
  import { api } from '../lib/api.js';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';

  export let monthId;
  export let entries = [];
  export let isReadOnly = false;
  export let onUpdate = () => {};

  let isAdding = false;
  let editingId = null;
  let label = '';
  let amount = '';

  async function handleAdd() {
    if (!label || !amount) return;
    await api.income.create(monthId, { label, amount: parseFloat(amount) });
    label = '';
    amount = '';
    isAdding = false;
    await onUpdate();
  }

  async function handleUpdate(id) {
    if (!label || !amount) return;
    await api.income.update(monthId, id, { label, amount: parseFloat(amount) });
    editingId = null;
    label = '';
    amount = '';
    await onUpdate();
  }

  async function handleDelete(id) {
    await api.income.delete(monthId, id);
    await onUpdate();
  }

  function startEdit(entry) {
    editingId = entry.id;
    label = entry.label;
    amount = entry.amount.toString();
  }

  function cancelEdit() {
    editingId = null;
    label = '';
    amount = '';
    isAdding = false;
  }
</script>

<Card>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-charcoal-700 dark:text-sand-200 text-sm font-semibold">Income</h3>
    {#if !isReadOnly && !isAdding}
      <button
        on:click={() => (isAdding = true)}
        class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1 transition-colors"
      >
        <Plus size={16} />
      </button>
    {/if}
  </div>

  <div class="space-y-3">
    {#each entries as entry (entry.id)}
      <div>
        {#if editingId === entry.id}
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <Input placeholder="Label" bind:value={label} />
            </div>
            <div class="w-24">
              <Input type="number" placeholder="Amount" bind:value={amount} />
            </div>
            <button
              on:click={() => handleUpdate(entry.id)}
              class="text-sage-600 hover:bg-sage-100 dark:hover:bg-charcoal-800 p-2"
            >
              <Check size={16} />
            </button>
            <button
              on:click={cancelEdit}
              class="text-charcoal-500 hover:bg-sand-200 dark:hover:bg-charcoal-800 p-2"
            >
              <X size={16} />
            </button>
          </div>
        {:else}
          <div
            class="border-sand-200 dark:border-charcoal-800 group flex items-center justify-between border-b py-2"
          >
            <span class="text-charcoal-700 dark:text-sand-300 text-sm">
              {entry.label}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-sage-600 dark:text-sage-400 text-sm font-medium">
                ${entry.amount.toFixed(2)}
              </span>
              {#if !isReadOnly}
                <button
                  on:click={() => startEdit(entry)}
                  class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1 opacity-0 transition-all group-hover:opacity-100"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  on:click={() => handleDelete(entry.id)}
                  class="text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-charcoal-800 p-1 opacity-0 transition-all group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              {/if}
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
        <div class="w-24">
          <Input type="number" placeholder="Amount" bind:value={amount} />
        </div>
        <button
          on:click={handleAdd}
          class="text-sage-600 hover:bg-sage-100 dark:hover:bg-charcoal-800 p-2"
        >
          <Check size={16} />
        </button>
        <button
          on:click={cancelEdit}
          class="text-charcoal-500 hover:bg-sand-200 dark:hover:bg-charcoal-800 p-2"
        >
          <X size={16} />
        </button>
      </div>
    {/if}

    {#if entries.length === 0 && !isAdding}
      <div class="text-charcoal-400 dark:text-charcoal-600 py-4 text-center text-sm">
        No income entries
      </div>
    {/if}
  </div>
</Card>
