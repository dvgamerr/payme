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
  import FixedMonths from './FixedMonths.svelte'
  // import BudgetSection from './BudgetSection.svelte'
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
  let categories = []
  let selectedMonthId = null
  let loading = true
  let isCurrentMonth = false

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    try {
      loading = true

      // Load categories
      categories = await api.categories.list()

      // Determine which month to load
      if (year && month) {
        // Get or create month by (year, month)
        const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase() === month.toLowerCase())

        if (monthIndex !== -1) {
          const result = await api.months.create(parseInt(year), monthIndex + 1)
          console.log(JSON.stringify({ result }))
          if (result && result.month) {
            selectedMonthId = result.month.id
            const now = new Date()
            isCurrentMonth =
              result.month.year === now.getFullYear() && result.month.month === now.getMonth() + 1
            await loadMonthSummary(result.month.id)
          } else {
            // Invalid response, use current month
            await loadCurrentMonth()
          }
        } else {
          // Invalid month name, use current month
          await loadCurrentMonth()
        }
      } else {
        // No year/month specified, use current month
        await loadCurrentMonth()
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      loading = false
    }
  }

  async function loadCurrentMonth() {
    const month = await api.months.current()
    if (!month || !month.id) {
      console.error('Failed to get current month:', month)
      return
    }
    isCurrentMonth = true
    await loadMonthSummary(month.id)
  }

  async function loadMonthSummary(monthId) {
    if (!monthId) {
      console.error('loadMonthSummary called with invalid monthId:', monthId)
      return
    }

    try {
      const month = await api.months.get(monthId)
      const items = await api.items.list(monthId)

      // ใช้ fixed_expenses สำหรับ current month, fixed_months สำหรับเดือนย้อนหลัง
      let fixedExpenses
      let totalFixed
      if (isCurrentMonth) {
        fixedExpenses = await api.fixedExpenses.list()
        totalFixed = fixedExpenses.reduce((sum, e) => {
          const monthlyAmount = e.frequency === 'yearly' ? e.amount / 12 : e.amount
          const exchangeRate = e.exchange_rate || 1
          return sum + monthlyAmount * exchangeRate
        }, 0)
      } else {
        fixedExpenses = await api.fixedMonths.list(monthId)
        totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
      }

      const totalSpent = items.reduce((sum, i) => sum + i.amount, 0)

      summary = {
        ...month,
        items,
        fixed_expenses: fixedExpenses,
        total_fixed: totalFixed,
        total_spent: totalSpent,
      }
    } catch (err) {
      console.error('Failed to load month summary:', err)
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
    <MonthNav {year} {month} />

    <div class="space-y-6">
      <Summary
        totalIncome={summary.total_income}
        totalFixed={summary.total_fixed}
        totalSpent={summary.total_spent}
        remaining={summary.remaining}
      />

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IncomeSection
          monthId={selectedMonthId}
          entries={summary.income_entries}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        />
        {#if isCurrentMonth}
          <FixedExpenses
            expenses={summary.fixed_expenses}
            totalFixed={summary.total_fixed}
            onUpdate={refresh}
          />
        {:else}
          <FixedMonths
            monthId={selectedMonthId}
            fixedExpenses={summary.fixed_expenses}
            totalFixed={summary.total_fixed}
            onUpdate={refresh}
          />
        {/if}
        <!-- <BudgetSection
          monthId={selectedMonthId}
          budgets={summary.budgets}
          {categories}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        /> -->
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
      totalBudgeted={0}
    />
  </Layout>
{/if}
