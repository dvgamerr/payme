<script>
  import { Plus, Trash2, Edit2, Check, X, Settings } from 'lucide-svelte';
  import { api } from '../lib/api.js';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';
  import Button from './ui/Button.svelte';
  import Modal from './ui/Modal.svelte';

  export let expenses = [];
  export let onUpdate = () => {};

  let isManaging = false;
  let isAdding = false;
  let editingId = null;
  let label = '';
  let amount = '';

  // Reset form when modal closes
  $: if (!isManaging) {
    isAdding = false;
    editingId = null;
    label = '';
    amount = '';
  }

  function closeModal() {
    isManaging = false;
  }

  $: total = expenses.reduce((sum, e) => sum + e.amount, 0);

  async function handleAdd() {
    if (!label || !amount) return;
    await api.fixedExpenses.create({ label, amount: parseFloat(amount) });
    label = '';
    amount = '';
    isAdding = false;
    await onUpdate();
  }

  async function handleUpdate(id) {
    if (!label || !amount) return;
    await api.fixedExpenses.update(id, { label, amount: parseFloat(amount) });
    editingId = null;
    label = '';
    amount = '';
    await onUpdate();
  }

  async function handleDelete(id) {
    await api.fixedExpenses.delete(id);
    await onUpdate();
  }

  function startEdit(expense) {
    editingId = expense.id;
    label = expense.label;
    amount = expense.amount.toString();
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
    <h3 class="text-charcoal-700 dark:text-sand-200 text-sm font-semibold">Fixed Expenses</h3>
    <button
      on:click={() => (isManaging = true)}
      class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1 transition-colors"
    >
      <Settings size={16} />
    </button>
  </div>

  <div class="space-y-2">
    {#each expenses as expense (expense.id)}
      <div
        class="border-sand-200 dark:border-charcoal-800 flex items-center justify-between border-b py-2"
      >
        <span class="text-charcoal-700 dark:text-sand-300 text-sm">
          {expense.label}
        </span>
        <span class="text-charcoal-600 dark:text-charcoal-400 text-sm">
          ${expense.amount.toFixed(2)}
        </span>
      </div>
    {/each}
    {#if expenses.length === 0}
      <div class="text-charcoal-400 dark:text-charcoal-600 py-4 text-center text-sm">
        No fixed expenses
      </div>
    {/if}
  </div>

  {#if expenses.length > 0}
    <div class="border-sand-300 dark:border-charcoal-700 mt-4 flex justify-between border-t pt-3">
      <span class="text-charcoal-600 dark:text-sand-300 text-sm font-medium"> Total </span>
      <span class="text-charcoal-800 dark:text-sand-100 text-sm font-semibold">
        ${total.toFixed(2)}
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
            <div class="w-24">
              <Input type="number" placeholder="Amount" bind:value={amount} />
            </div>
            <button
              on:click={() => handleUpdate(expense.id)}
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
            class="border-sand-200 dark:border-charcoal-800 flex items-center justify-between border-b py-2"
          >
            <span class="text-sm">{expense.label}</span>
            <div class="flex items-center gap-2">
              <span class="text-sm">${expense.amount.toFixed(2)}</span>
              <button
                on:click={() => startEdit(expense)}
                class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1"
              >
                <Edit2 size={14} />
              </button>
              <button
                on:click={() => handleDelete(expense.id)}
                class="text-terracotta-500 hover:bg-terracotta-100 dark:hover:bg-charcoal-800 p-1"
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
        <div class="w-24">
          <Input type="number" placeholder="Amount" bind:value={amount} />
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
