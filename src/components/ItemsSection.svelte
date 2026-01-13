<script>
  import { Plus, Trash2, Edit2, Check, X } from 'lucide-svelte';
  import { api } from '../lib/api.js';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';
  import Select from './ui/Select.svelte';
  import Button from './ui/Button.svelte';

  export let monthId;
  export let items = [];
  export let categories = [];
  export let isReadOnly = false;
  export let onUpdate = () => {};

  let isAdding = false;
  let editingId = null;
  let description = '';
  let amount = '';
  let categoryId = '';
  let spentOn = new Date().toISOString().split('T')[0];

  $: categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }));

  async function handleAdd() {
    if (!description || !amount || !categoryId) return;
    await api.items.create(monthId, {
      description,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      spent_on: spentOn,
    });
    resetForm();
    await onUpdate();
  }

  async function handleUpdate(id) {
    if (!description || !amount || !categoryId) return;
    await api.items.update(monthId, id, {
      description,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      spent_on: spentOn,
    });
    resetForm();
    await onUpdate();
  }

  async function handleDelete(id) {
    await api.items.delete(monthId, id);
    await onUpdate();
  }

  function startEdit(item) {
    editingId = item.id;
    description = item.description;
    amount = item.amount.toString();
    categoryId = item.category_id.toString();
    spentOn = item.spent_on;
  }

  function resetForm() {
    editingId = null;
    description = '';
    amount = '';
    categoryId = '';
    spentOn = new Date().toISOString().split('T')[0];
    isAdding = false;
  }
</script>

<Card className="col-span-full">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-charcoal-700 dark:text-sand-200 text-sm font-semibold">Spending Items</h3>
    {#if !isReadOnly && !isAdding}
      <button
        on:click={() => {
          isAdding = true;
          if (categories.length > 0) {
            categoryId = categories[0].id.toString();
          }
        }}
        class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-1 transition-colors"
      >
        <Plus size={16} />
      </button>
    {/if}
  </div>

  {#if isAdding && categories.length === 0}
    <div class="bg-sand-100 dark:bg-charcoal-800 mb-4 p-4 text-center">
      <p class="text-charcoal-600 dark:text-charcoal-300 mb-1 text-sm">No budget categories yet.</p>
      <p class="text-charcoal-400 dark:text-charcoal-500 text-xs">
        Add some in the Budget section first.
      </p>
      <button
        on:click={resetForm}
        class="text-charcoal-500 hover:text-charcoal-700 dark:hover:text-charcoal-300 mt-3 text-xs"
      >
        Close
      </button>
    </div>
  {/if}

  {#if isAdding && categories.length > 0}
    <div class="bg-sand-100 dark:bg-charcoal-800 mb-4 p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input placeholder="Description" bind:value={description} />
        <Input type="number" placeholder="Amount" bind:value={amount} />
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
        <tr class="border-sand-300 dark:border-charcoal-700 border-b">
          <th class="text-charcoal-600 dark:text-sand-400 py-2 text-left font-medium"> Date </th>
          <th class="text-charcoal-600 dark:text-sand-400 py-2 text-left font-medium">
            Description
          </th>
          <th class="text-charcoal-600 dark:text-sand-400 py-2 text-left font-medium">
            Category
          </th>
          <th class="text-charcoal-600 dark:text-sand-400 py-2 text-right font-medium"> Amount </th>
          {#if !isReadOnly}
            <th class="w-20"></th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each items as item (item.id)}
          <tr
            class="border-sand-200 dark:border-charcoal-800 hover:bg-sand-100 dark:hover:bg-charcoal-900/50 border-b"
          >
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
                  type="number"
                  placeholder="Amount"
                  bind:value={amount}
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
              <td class="text-charcoal-600 dark:text-charcoal-400 py-2">
                {new Date(item.spent_on).toLocaleDateString()}
              </td>
              <td class="text-charcoal-700 dark:text-sand-300 py-2">
                {item.description}
              </td>
              <td class="text-charcoal-600 dark:text-charcoal-400 py-2">
                {item.category_label}
              </td>
              <td class="text-charcoal-800 dark:text-sand-200 py-2 text-right">
                ${item.amount.toFixed(2)}
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
