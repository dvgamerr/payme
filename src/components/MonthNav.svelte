<script>
  import { ChevronLeft, ChevronRight } from 'lucide-svelte'

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

  console.log({ year, month })

  // Determine current year/month from props or current date
  $: currentYear = year || new Date().getFullYear()
  $: currentMonth =
    (month
      ? MONTH_NAMES.findIndex((m) => m.toLowerCase() === month?.toLowerCase())
      : new Date().getMonth()) + 1

  function goPrev() {
    let prevYear = currentYear
    let prevMonth = currentMonth - 1

    if (prevMonth < 1) {
      prevMonth = 12
      prevYear--
    }

    const monthName = MONTH_NAMES[prevMonth - 1]
    const link = document.createElement('a')
    link.href = `/${prevYear}/${monthName}`
    link.dataset.astroTransition = 'backward'
    link.click()
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

    const link = document.createElement('a')
    link.href = `/${nextYear}/${MONTH_NAMES[nextMonth - 1]}`
    link.dataset.astroTransition = 'forward'
    link.click()

    // setTimeout(() => {
    //   if (isCurrent) history.replaceState(null, null, '/')
    // }, 2000)
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
      disabled={currentYear === new Date().getFullYear().toString() &&
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
