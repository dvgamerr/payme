<script>
  import { Trash2, Slash } from 'lucide-svelte'
  import Input from './ui/Input.svelte'
  import Toggle from './ui/Toggle.svelte'
  import Select from './ui/Select.svelte'

  /**
   * Fixed Expense Form Component
   * @prop {string} mode - 'add' | 'edit'
   * @prop {string} label - Expense label
   * @prop {string} amount - Expense amount
   * @prop {string} frequency - 'monthly' | 'yearly'
   * @prop {string} currency - Currency code
   * @prop {Function} onSave - Callback when saving
   * @prop {Function} onCancel - Callback when canceling
   * @prop {Function} onDelete - Callback when deleting (edit mode only)
   */
  export let mode = 'add'
  export let label = ''
  export let amount = ''
  export let frequency = 'monthly'
  export let currency = 'THB'
  export let onSave = () => {}
  export let onCancel = () => {}
  export let onDelete = null

  let amountInput = null

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'JPY', label: 'JPY' },
    { value: 'CNY', label: 'CNY' },
    { value: 'KRW', label: 'KRW' },
    { value: 'INR', label: 'INR' },
    { value: 'CAD', label: 'CAD' },
    { value: 'AUD', label: 'AUD' },
    { value: 'CHF', label: 'CHF' },
    { value: 'HKD', label: 'HKD' },
    { value: 'SGD', label: 'SGD' },
    { value: 'SEK', label: 'SEK' },
    { value: 'NOK', label: 'NOK' },
    { value: 'DKK', label: 'DKK' },
    { value: 'NZD', label: 'NZD' },
    { value: 'MXN', label: 'MXN' },
    { value: 'BRL', label: 'BRL' },
    { value: 'ZAR', label: 'ZAR' },
    { value: 'RUB', label: 'RUB' },
    { value: 'TRY', label: 'TRY' },
    { value: 'PLN', label: 'PLN' },
    { value: 'THB', label: 'THB' },
    { value: 'IDR', label: 'IDR' },
    { value: 'MYR', label: 'MYR' },
    { value: 'PHP', label: 'PHP' },
    { value: 'VND', label: 'VND' },
    { value: 'TWD', label: 'TWD' },
    { value: 'AED', label: 'AED' },
    { value: 'SAR', label: 'SAR' },
    { value: 'ILS', label: 'ILS' },
    { value: 'CZK', label: 'CZK' },
    { value: 'HUF', label: 'HUF' },
    { value: 'RON', label: 'RON' },
    { value: 'BGN', label: 'BGN' },
    { value: 'HRK', label: 'HRK' },
    { value: 'CLP', label: 'CLP' },
    { value: 'COP', label: 'COP' },
    { value: 'ARS', label: 'ARS' },
    { value: 'PEN', label: 'PEN' },
    { value: 'EGP', label: 'EGP' },
    { value: 'NGN', label: 'NGN' },
    { value: 'KES', label: 'KES' },
    { value: 'PKR', label: 'PKR' },
    { value: 'BDT', label: 'BDT' },
    { value: 'UAH', label: 'UAH' },
    { value: 'MAD', label: 'MAD' },
    { value: 'LKR', label: 'LKR' },
  ]

  $: if (mode === 'edit' && amountInput) {
    amountInput.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSave()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  function handleBlur() {
    if (label || amount) {
      onSave()
    }
  }
</script>

<div class="flex flex-1 items-end gap-2">
  <div class="flex-1">
    <Input
      placeholder="Expense"
      bind:value={label}
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
    />
  </div>
  <div class="w-17">
    <Input
      type="text"
      placeholder="Amount"
      bind:value={amount}
      bind:this={amountInput}
      formatAsNumber={true}
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
    />
  </div>
  <div class="w-20">
    <Select bind:value={currency} options={currencyOptions} />
  </div>
  <div class="flex items-end">
    /
    <Toggle
      bind:value={frequency}
      width="w-17"
      options={[
        { value: 'monthly', label: 'ต่อเดือน' },
        { value: 'yearly', label: 'ต่อปี' },
      ]}
    />
  </div>
  {#if mode === 'edit' && onDelete}
    <button
      on:click={onDelete}
      class="text-destructive cursor-pointer p-1.5 opacity-70 hover:opacity-100"
    >
      <Trash2 size={16} />
    </button>
  {/if}
</div>
