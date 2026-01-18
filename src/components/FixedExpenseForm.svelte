<script>
  import { Trash2, Check, X, GripVertical } from 'lucide-svelte'
  import { settings } from '../stores/settings'
  import Input from './ui/Input.svelte'
  import Toggle from './ui/Toggle.svelte'
  import Select from './ui/Select.svelte'

  export let mode = 'add'
  export let label = ''
  export let amount = ''
  export let frequency = 'monthly'
  export let currency = 'THB'
  export let onSave = () => {}
  export let onCancel = () => {}
  export let onDelete = null
  export let dragHandleProps = null

  let labelInput = null
  let amountInput = null

  const allCurrencies = [
    { value: 'USD', label: 'USD' },
    // { value: 'EUR', label: 'EUR' },
    // { value: 'GBP', label: 'GBP' },
    // { value: 'JPY', label: 'JPY' },
    // { value: 'CNY', label: 'CNY' },
    // { value: 'KRW', label: 'KRW' },
    // { value: 'INR', label: 'INR' },
    // { value: 'CAD', label: 'CAD' },
    // { value: 'AUD', label: 'AUD' },
    // { value: 'CHF', label: 'CHF' },
    // { value: 'HKD', label: 'HKD' },
    // { value: 'SGD', label: 'SGD' },
    // { value: 'SEK', label: 'SEK' },
    // { value: 'NOK', label: 'NOK' },
    // { value: 'DKK', label: 'DKK' },
    // { value: 'NZD', label: 'NZD' },
    // { value: 'MXN', label: 'MXN' },
    // { value: 'BRL', label: 'BRL' },
    // { value: 'ZAR', label: 'ZAR' },
    // { value: 'RUB', label: 'RUB' },
    // { value: 'TRY', label: 'TRY' },
    // { value: 'PLN', label: 'PLN' },
    { value: 'THB', label: 'THB' },
    // { value: 'IDR', label: 'IDR' },
    // { value: 'MYR', label: 'MYR' },
    // { value: 'PHP', label: 'PHP' },
    // { value: 'VND', label: 'VND' },
    // { value: 'TWD', label: 'TWD' },
    // { value: 'AED', label: 'AED' },
    // { value: 'SAR', label: 'SAR' },
    // { value: 'ILS', label: 'ILS' },
    // { value: 'CZK', label: 'CZK' },
    // { value: 'HUF', label: 'HUF' },
    // { value: 'RON', label: 'RON' },
    // { value: 'BGN', label: 'BGN' },
    // { value: 'HRK', label: 'HRK' },
    // { value: 'CLP', label: 'CLP' },
    // { value: 'COP', label: 'COP' },
    // { value: 'ARS', label: 'ARS' },
    // { value: 'PEN', label: 'PEN' },
    // { value: 'EGP', label: 'EGP' },
    // { value: 'NGN', label: 'NGN' },
    // { value: 'KES', label: 'KES' },
    // { value: 'PKR', label: 'PKR' },
    // { value: 'BDT', label: 'BDT' },
    // { value: 'UAH', label: 'UAH' },
    // { value: 'MAD', label: 'MAD' },
    // { value: 'LKR', label: 'LKR' },
  ]

  $: currencyOptions = (() => {
    const baseCurrency = $settings.baseCurrency || 'THB'
    const baseOption = allCurrencies.find((c) => c.value === baseCurrency)
    const others = allCurrencies.filter((c) => c.value !== baseCurrency)
    return baseOption ? [baseOption, ...others] : allCurrencies
  })()

  $: if (mode === 'edit' && amountInput) {
    amountInput.focus()
  }

  $: if (mode === 'add' && labelInput) {
    labelInput.focus()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSave()
    }
  }
</script>

<div class="flex flex-1 items-end gap-2">
  {#if mode === 'edit' && dragHandleProps}
    <button
      {...dragHandleProps}
      class="text-muted-foreground cursor-grab opacity-50 hover:opacity-100 active:cursor-grabbing"
    >
      <GripVertical size={20} />
    </button>
  {/if}
  <div class="flex-1">
    <Input
      placeholder="Expense"
      bind:value={label}
      bind:this={labelInput}
      on:keydown={handleKeyDown}
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
    />
  </div>
  <div class="w-16">
    <Select bind:value={currency} options={currencyOptions} />
  </div>
  <div class="flex items-end">
    <span
      class="placeholder:text-muted-foreground mx-1 bg-transparent py-2 text-left text-sm capitalize transition-colors focus:outline-none"
      >/</span
    >
    <Toggle
      bind:value={frequency}
      width="w-17"
      options={[
        { value: 'monthly', label: 'monthly' },
        { value: 'yearly', label: 'yearly' },
      ]}
    />
  </div>
  <div class="flex items-center gap-1">
    <button
      on:click={onSave}
      class="text-success cursor-pointer p-1.5 opacity-70 hover:opacity-100"
      title="บันทึก"
    >
      <Check size={16} />
    </button>
    <button
      on:click={onCancel}
      class="text-muted-foreground cursor-pointer p-1.5 opacity-70 hover:opacity-100"
      title="ยกเลิก"
    >
      <X size={16} />
    </button>
    <!-- {#if mode === 'edit' && onDelete}
      <button
        on:click={onDelete}
        class="text-destructive cursor-pointer p-1.5 opacity-70 hover:opacity-100"
        title="ลบ"
      >
        <Trash2 size={16} />
      </button>
    {/if} -->
  </div>
</div>
