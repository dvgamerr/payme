<script>
  import { onMount } from 'svelte';
  import { api } from '../lib/api.js';
  import Layout from './Layout.svelte';
  import MonthNav from './MonthNav.svelte';
  import Summary from './Summary.svelte';
  import SavingsCard from './SavingsCard.svelte';
  import RetirementSavingsCard from './RetirementSavingsCard.svelte';
  import ProjectedSavingsCard from './ProjectedSavingsCard.svelte';
  import VarianceModal from './VarianceModal.svelte';
  import IncomeSection from './IncomeSection.svelte';
  import FixedExpenses from './FixedExpenses.svelte';
  import BudgetSection from './BudgetSection.svelte';
  import ItemsSection from './ItemsSection.svelte';
  import Stats from './Stats.svelte';

  let savings = 0;
  let showVarianceModal = false;
  let summary = null;
  let months = [];
  let categories = [];
  let selectedMonthId = null;
  let loading = true;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;

      // Get current month summary (already includes all data)
      const currentSummary = await api.months.current();

      if (!currentSummary || !currentSummary.month || !currentSummary.month.id) {
        console.error('Failed to get current month:', currentSummary);
        return;
      }

      // Set the summary directly from API response
      summary = currentSummary;
      selectedMonthId = currentSummary.month.id;

      // Load all months
      const allMonths = await api.months.list();
      months = allMonths.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      // Load categories
      categories = await api.categories.list();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      loading = false;
    }
  }

  async function loadMonthSummary(monthId) {
    if (!monthId) {
      console.error('loadMonthSummary called with invalid monthId:', monthId);
      return;
    }

    try {
      const month = await api.months.get(monthId);
      const incomeEntries = await api.income.list(monthId);
      const budgets = await api.budgets.list(monthId);
      const items = await api.items.list(monthId);
      const fixedExpenses = await api.fixedExpenses.list();

      const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
      const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSpent = items.reduce((sum, i) => sum + i.amount, 0);
      const totalBudgeted = budgets.reduce((sum, b) => sum + b.allocated_amount, 0);
      const remaining = totalIncome - totalFixed - totalSpent;

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
      };
    } catch (err) {
      console.error('Failed to load month summary:', err);
    }
  }

  async function selectMonth(id) {
    if (!id) {
      console.error('selectMonth called with invalid id:', id);
      return;
    }
    selectedMonthId = id;
    loading = true;
    try {
      await loadMonthSummary(id);
    } finally {
      loading = false;
    }
  }

  async function refresh() {
    if (!selectedMonthId) {
      console.warn('refresh() called before selectedMonthId is set, reloading all data');
      await loadData();
      return;
    }
    loading = true;
    try {
      await loadMonthSummary(selectedMonthId);
    } finally {
      loading = false;
    }
  }

  async function closeMonth() {
    if (!selectedMonthId) {
      alert('No month selected');
      return;
    }
    try {
      await api.months.close(selectedMonthId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to close month');
    }
  }

  async function downloadPdf() {
    // TODO: Implement PDF generation
    alert('PDF generation will be implemented');
  }

  function handleSavingsChange(value) {
    savings = value;
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
    <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <MonthNav
          {months}
          {selectedMonthId}
          onSelect={selectMonth}
          onClose={closeMonth}
          onDownloadPdf={downloadPdf}
        />
        <div class="w-36">
          <SavingsCard onSavingsChange={handleSavingsChange} />
        </div>
        <div class="w-36">
          <ProjectedSavingsCard
            {savings}
            remaining={summary.remaining}
            onAnalyzeClick={() => (showVarianceModal = true)}
          />
        </div>
      </div>
      <Stats />
    </div>

    <div class="space-y-6">
      <Summary
        totalIncome={summary.total_income}
        totalFixed={summary.total_fixed}
        totalSpent={summary.total_spent}
        remaining={summary.remaining}
      >
        <svelte:fragment slot="extraCard">
          <RetirementSavingsCard />
        </svelte:fragment>
      </Summary>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <IncomeSection
          monthId={summary.month.id}
          entries={summary.income_entries}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        />
        <FixedExpenses expenses={summary.fixed_expenses} onUpdate={refresh} />
        <BudgetSection
          monthId={summary.month.id}
          budgets={summary.budgets}
          {categories}
          isReadOnly={summary.month.is_closed}
          onUpdate={refresh}
        />
      </div>

      <ItemsSection
        monthId={summary.month.id}
        items={summary.items}
        {categories}
        isReadOnly={summary.month.is_closed}
        onUpdate={refresh}
      />
    </div>

    <footer class="text-charcoal-400 dark:text-charcoal-600 mt-12 py-4 text-center text-xs">
      {new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </footer>

    <VarianceModal
      isOpen={showVarianceModal}
      onClose={() => (showVarianceModal = false)}
      budgets={summary.budgets}
      totalIncome={summary.total_income}
      totalFixed={summary.total_fixed}
      totalBudgeted={summary.total_budgeted}
    />
  </Layout>
{/if}
