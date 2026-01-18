<script>
  import { ChevronLeft, ChevronRight, FileDown, Lock } from 'lucide-svelte'
  import Button from './ui/Button.svelte'

  export let year = undefined
  export let month = undefined

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
  ]

  // Determine current year/month from props or current date
  $: currentYear = year || new Date().getFullYear()
  $: currentMonthIndex = month
    ? MONTH_NAMES.findIndex((m) => m.toLowerCase() === month.toLowerCase())
    : new Date().getMonth()
  $: currentMonth = currentMonthIndex + 1

  function goPrev() {
    let prevYear = currentYear
    let prevMonth = currentMonth - 1

    if (prevMonth < 1) {
      prevMonth = 12
      prevYear--
    }

    const monthName = MONTH_NAMES[prevMonth - 1]
    window.location.href = `/${prevYear}/${monthName}`
  }

  function goNext() {
    let nextYear = currentYear
    let nextMonth = currentMonth + 1

    if (nextMonth > 12) {
      nextMonth = 1
      nextYear++
    }

    // Check if it's current month
    const now = new Date()
    const isCurrent = nextYear === now.getFullYear() && nextMonth === now.getMonth() + 1

    if (isCurrent) {
      window.location.href = '/'
    } else {
      const monthName = MONTH_NAMES[nextMonth - 1]
      window.location.href = `/${nextYear}/${monthName}`
    }
  }
</script>

<div class="mb-6 flex items-center justify-between">
  <div class="flex items-center gap-2">
    <button
      on:click={goPrev}
      class="hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-default disabled:opacity-20"
    >
      <ChevronLeft size={18} />
    </button>
    <div class="text-lg font-medium">
      {MONTH_NAMES[currentMonth - 1]}
      {currentYear}
    </div>
    <button
      on:click={goNext}
      disabled={currentYear === new Date().getFullYear() &&
        currentMonth === new Date().getMonth() + 1}
      class="hover:bg-accent flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:cursor-default disabled:opacity-20"
    >
      <ChevronRight size={18} />
    </button>
  </div>

  <div class="text-muted-foreground flex items-center gap-2 text-sm">
    Savings goal
    <span class="text-accent-gold font-medium">฿10,000</span>
  </div>
</div>
