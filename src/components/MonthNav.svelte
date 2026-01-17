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
  <div class="mb-6 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <button
        on:click={goPrev}
        disabled={currentIndex >= months.length - 1}
        class="hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>
      <div class="text-lg font-medium">
        {MONTH_NAMES[selectedMonth.month - 1]}
        {selectedMonth.year}
      </div>
      <button
        on:click={goNext}
        disabled={currentIndex <= 0}
        class="hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>

    <div class="text-muted-foreground flex items-center gap-2 text-sm">
      Savings goal
      <span class="text-accent-gold font-medium">฿10,000</span>
    </div>
  </div>
{/if}
