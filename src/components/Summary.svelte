<script>
  import { TrendingDown, Wallet, CreditCard, PiggyBank } from 'lucide-svelte';
  import Card from './ui/Card.svelte';

  export let totalIncome = 0;
  export let totalFixed = 0;
  export let totalSpent = 0;
  export let remaining = 0;
  export let extraCard = null;

  $: isPositive = remaining >= 0;

  $: items = [
    {
      label: 'Income',
      value: totalIncome,
      icon: Wallet,
      color: 'text-sage-600 dark:text-sage-400',
    },
    {
      label: 'Fixed',
      value: totalFixed,
      icon: CreditCard,
      color: 'text-charcoal-600 dark:text-charcoal-400',
    },
  ];

  $: itemsAfter = [
    {
      label: 'Spent',
      value: totalSpent,
      icon: TrendingDown,
      color: 'text-terracotta-600 dark:text-terracotta-400',
    },
    {
      label: 'Remaining',
      value: remaining,
      icon: isPositive ? PiggyBank : TrendingDown,
      color: isPositive
        ? 'text-sage-600 dark:text-sage-400'
        : 'text-terracotta-600 dark:text-terracotta-400',
    },
  ];
</script>

<div class="grid grid-cols-2 gap-4 {extraCard ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}">
  {#each items as item}
    <Card>
      <div class="flex items-start justify-between">
        <div>
          <div class="text-charcoal-500 dark:text-charcoal-400 mb-1 text-xs">
            {item.label}
          </div>
          <div class="{item.color} text-xl font-semibold">
            ${Math.abs(item.value).toFixed(2)}
          </div>
        </div>
        <svelte:component this={item.icon} size={20} class={item.color} />
      </div>
    </Card>
  {/each}

  {#if extraCard}
    <slot name="extraCard" />
  {/if}

  {#each itemsAfter as item}
    <Card>
      <div class="flex items-start justify-between">
        <div>
          <div class="text-charcoal-500 dark:text-charcoal-400 mb-1 text-xs">
            {item.label}
          </div>
          <div class="{item.color} text-xl font-semibold">
            ${Math.abs(item.value).toFixed(2)}
            {#if item.label === 'Remaining' && item.value < 0}
              <span class="ml-1 text-xs">deficit</span>
            {/if}
          </div>
        </div>
        <svelte:component this={item.icon} size={20} class={item.color} />
      </div>
    </Card>
  {/each}
</div>
