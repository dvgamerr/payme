<script>
  import { ChevronLeft, ChevronRight, FileDown, Lock } from 'lucide-svelte';
  import Button from './ui/Button.svelte';

  export let months = [];
  export let selectedMonthId = null;
  export let onSelect = () => {};
  export let onClose = () => {};
  export let onDownloadPdf = () => {};

  const MONTH_NAMES = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  $: selectedMonth = months.find((m) => m.id === selectedMonthId);
  $: currentIndex = months.findIndex((m) => m.id === selectedMonthId);

  $: {
    const now = new Date();
    const isCurrentCalendarMonth =
      selectedMonth?.year === now.getFullYear() && selectedMonth?.month === now.getMonth() + 1;
    const isLastDay =
      now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    canClose = isCurrentCalendarMonth && isLastDay && !selectedMonth?.is_closed;
  }

  let canClose = false;

  function goPrev() {
    if (currentIndex < months.length - 1) {
      onSelect(months[currentIndex + 1].id);
    }
  }

  function goNext() {
    if (currentIndex > 0) {
      onSelect(months[currentIndex - 1].id);
    }
  }
</script>

{#if selectedMonth}
  <div class="mb-8 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        on:click={goPrev}
        disabled={currentIndex >= months.length - 1}
        class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-2 transition-colors disabled:opacity-30"
      >
        <ChevronLeft size={20} />
      </button>
      <div class="text-center">
        <div class="text-charcoal-900 dark:text-sand-50 text-2xl font-semibold">
          {MONTH_NAMES[selectedMonth.month - 1]}
          {selectedMonth.year}
        </div>
        <div
          class="text-charcoal-500 dark:text-charcoal-400 flex items-center justify-center gap-1 text-xs"
        >
          {#if selectedMonth.is_closed}
            <Lock size={12} />
            closed
          {:else}
            active
          {/if}
        </div>
      </div>
      <button
        on:click={goNext}
        disabled={currentIndex <= 0}
        class="hover:bg-sand-200 dark:hover:bg-charcoal-800 p-2 transition-colors disabled:opacity-30"
      >
        <ChevronRight size={20} />
      </button>
    </div>

    <div class="flex items-center gap-2">
      {#if selectedMonth.is_closed}
        <Button variant="ghost" size="sm" on:click={onDownloadPdf}>
          <FileDown size={16} class="mr-2" />
          PDF
        </Button>
      {/if}
      {#if canClose}
        <Button variant="primary" size="sm" on:click={onClose}>Close Month</Button>
      {/if}
    </div>
  </div>
{/if}
