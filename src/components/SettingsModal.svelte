<script>
  import { onMount } from 'svelte'
  import Modal from './ui/Modal.svelte'
  import { settings } from '../stores/settings.js'

  export let isOpen = false
  export let onClose = () => {}

  const currencies = [
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'KRW', symbol: '₩', name: 'Korean Won' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  ]

  let selectedCurrency = 'THB'

  onMount(() => {
    const unsubscribe = settings.subscribe((state) => {
      if (state.loaded) {
        selectedCurrency = state.baseCurrency
      }
    })

    return unsubscribe
  })

  const selectCurrency = async (currency) => {
    selectedCurrency = currency.code
    await settings.save({
      baseCurrency: currency.code,
      currencySymbol: currency.symbol,
    })
  }
</script>

<Modal {isOpen} {onClose} title="Settings">
  <div class="flex flex-col gap-6">
    <p class="text-muted-foreground -mt-2 text-[0.9375rem]">
      Customize your finance dashboard preferences.
    </p>

    <div class="flex flex-col gap-4">
      <h3 class="m-0 text-[0.9375rem] font-semibold">Currency</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each currencies as currency}
          <button
            class="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors {selectedCurrency ===
            currency.code
              ? 'border-[#d4a574] bg-gradient-to-br from-[#d4a574]/10 to-[#d4a574]/5'
              : 'border-border hover:border-muted-foreground hover:bg-secondary/50'}"
            on:click={() => selectCurrency(currency)}
          >
            <span
              class="bg-muted flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-medium"
            >
              {currency.symbol}
            </span>
            <div class="flex flex-col">
              <span class="text-sm font-medium">{currency.code}</span>
              <span class="text-muted-foreground text-xs">{currency.name}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</Modal>
