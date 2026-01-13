<script>
  /**
   * Progress Bar Component
   * @prop {number} value - Current value
   * @prop {number} max - Maximum value
   * @prop {boolean} showOverage - Show overage text
   */
  export let value = 0;
  export let max = 100;
  export let showOverage = true;

  $: percentage = max > 0 ? (value / max) * 100 : 0;
  $: isOver = value > max;
  $: overage = value - max;

  function getColor() {
    if (percentage >= 100) return 'bg-terracotta-500';
    if (percentage >= 80) return 'bg-terracotta-400';
    if (percentage >= 50) return 'bg-sand-500';
    return 'bg-sage-500';
  }
</script>

<div class="space-y-1">
  <div class="bg-sand-200 dark:bg-charcoal-800 h-2 overflow-hidden">
    <div
      class="h-full transition-all duration-300 {getColor()}"
      style="width: {Math.min(percentage, 100)}%"
    ></div>
  </div>
  {#if isOver && showOverage}
    <div class="text-terracotta-600 dark:text-terracotta-400 text-xs">
      +${overage.toFixed(2)} over
    </div>
  {/if}
</div>
