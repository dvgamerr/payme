<script>
  import { onMount } from 'svelte'
  import { api } from '../lib/api.js'
  import { settings } from '../stores/settings.js'
  import Layout from './Layout.svelte'
  import MonthNav from './MonthNav.svelte'
  import Summary from './Summary.svelte'
  import SavingsCard from './SavingsCard.svelte'
  import RetirementSavingsCard from './RetirementSavingsCard.svelte'
  import ProjectedSavingsCard from './ProjectedSavingsCard.svelte'
  import VarianceModal from './VarianceModal.svelte'
  import IncomeSection from './IncomeSection.svelte'
  import FixedExpenses from './FixedExpenses.svelte'
  import BudgetSection from './BudgetSection.svelte'
  import ItemsSection from './ItemsSection.svelte'
  import Stats from './Stats.svelte'

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

  let savings = 0
  let showVarianceModal = false
  let summary = null
  let months = []
  let categories = []
  let selectedMonthId = null
  let loading = true

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    try {
      loading = true

      // Load all months first
      const allMonths = await api.months.list()
      months = allMonths.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

      // Load categories
      categories = await api.categories.list()

      // Determine which month to load
      let targetMonth = null
      if (year && month) {
        // Find month by year and month name
        const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === month.toLowerCase())
        if (monthIndex !== -1) {
          targetMonth = months.find((m) => m.year === parseInt(year) && m.month === monthIndex + 1)
        }
      }

      if (!targetMonth) {
        // Load current month
        const currentSummary = await api.months.current()
        if (!currentSummary || !currentSummary.month || !currentSummary.month.id) {
          console.error('Failed to get current month:', currentSummary)
          return
        }
        summary = currentSummary
        selectedMonthId = currentSummary.month.id
      } else {
        // Load specified month
        selectedMonthId = targetMonth.id
        await loadMonthSummary(targetMonth.id)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      loading = false
    }
  }

  async function loadMonthSummary(monthId) {
    if (!monthId) {
      console.error('loadMonthSummary called with invalid monthId:', monthId)
      return
    }

    try {
      const month = await api.months.get(monthId)
      const incomeEntries = await api.income.list(monthId)
      const budgets = await api.budgets.list(monthId)
      const items = await api.items.list(monthId)
      const fixedExpenses = await api.fixedExpenses.list()

      const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
      const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
      const totalSpent = items.reduce((sum, i) => sum + i.amount, 0)
      const totalBudgeted = budgets.reduce((sum, b) => sum + b.allocated_amount, 0)
      const remaining = totalIncome - totalFixed - totalSpent

      summary = {
        month,
        income_entries: incomeEntries,
        budgets,
        items,
        fixed_expenses: fixedExpenses,
        total_income: totalIncome,
        total_fixed: totalFixed,
        total_spent: totalSpent,
        total_budgeted: totalBudgeted,
        remaining,
      }
    } catch (err) {
      console.error('Failed to load month summary:', err)
    }
  }

  async function selectMonth(id) {
    if (!id) {
      console.error('selectMonth called with invalid id:', id)
      return
    }

    const targetMonth = months.find((m) => m.id === id)
    if (!targetMonth) return

    // Check if it's current month
    const now = new Date()
    const isCurrentMonth =
      targetMonth.year === now.getFullYear() && targetMonth.month === now.getMonth() + 1

    if (isCurrentMonth) {
      // Navigate to root
      window.location.href = '/'
    } else {
      // Navigate to /year/month
      const monthName = MONTH_NAMES[targetMonth.month - 1]
      window.location.href = `/${targetMonth.year}/${monthName}`
    }
  }

  async function refresh() {
    if (!selectedMonthId) {
      console.warn('refresh() called before selectedMonthId is set, reloading all data')
      await loadData()
      return
    }
    try {
      await loadMonthSummary(selectedMonthId)
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  async function closeMonth() {
    if (!selectedMonthId) {
      alert('No month selected')
      return
    }
    try {
      await api.months.close(selectedMonthId)
      await loadData()
    } catch (err) {
      alert(err.message || 'Failed to close month')
    }
  }
</script>

{#if loading && !summary}
  <Layout>
    <div class="flex items-center justify-center py-20">
      <div class="border-charcoal-400 h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  </Layout>
{:else if !summary}
  <Layout>
    <div class="text-charcoal-500 py-20 text-center">Unable to load data</div>
  </Layout>
{:else}
  <Layout>
    <MonthNav {months} {selectedMonthId} onSelect={selectMonth} />

    <div class="space-y-6">
      <Summary
        totalIncome={summary.total_income}
        totalFixed={summary.total_fixed}
        totalSpent={summary.total_spent}
        remaining={summary.remaining}
      />

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <IncomeSection
          monthId={selectedMonthId}
          entries={summary.income_entries}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        />
        <FixedExpenses expenses={summary.fixed_expenses} onUpdate={refresh} />
        <BudgetSection
          monthId={selectedMonthId}
          budgets={summary.budgets}
          {categories}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        />
      </div>

      <ItemsSection
        monthId={selectedMonthId}
        items={summary.items}
        {categories}
        isReadOnly={summary.month.is_closed}
        onUpdate={refresh}
      />
    </div>

    <VarianceModal
      bind:isOpen={showVarianceModal}
      budgets={summary.budgets}
      totalIncome={summary.total_income}
      totalFixed={summary.total_fixed}
      totalBudgeted={summary.total_budgeted}
    />
  </Layout>
{/if}
