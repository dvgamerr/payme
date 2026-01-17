<script>
  import Card from './ui/Card.svelte';

  export let totalIncome = 0;
  export let totalFixed = 0;
  export let totalSpent = 0;
  export let remaining = 0;

  $: items = [
    {
      label: 'INCOME',
      value: totalIncome,
    },
    {
      label: 'FIXED',
      value: totalFixed,
    },
    {
      label: 'SPENT',
      value: totalSpent,
    },
    {
      label: 'REMAINING',
      value: remaining,
    },
  ];
</script>

<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
  {#each items as item}
    <Card>
      <div class="space-y-2">
        <div class="text-muted-foreground text-xs uppercase">
          {item.label}
        </div>
        <div
          class="text-foreground text-2xl font-semibold {item.label === 'REMAINING' &&
          item.value < 0
            ? 'text-destructive'
            : ''}"
        >
          ฿{Math.abs(item.value).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      </div>
    </Card>
  {/each}
</div>
