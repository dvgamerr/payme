<script>
  import numeral from 'numeral'

  /**
   * Input Component
   * @prop {string} label - Optional label text
   * @prop {string} type - Input HTML type
   * @prop {string|number} value - Input value
   * @prop {string} placeholder - Placeholder text
   * @prop {boolean} formatAsNumber - Enable number formatting (0,000)
   */
  export let label = ''
  export let type = 'text'
  export let value = ''
  export let placeholder = ''
  export let formatAsNumber = false
  export let textAlign = 'left'

  let inputId = `input-${Math.random().toString(36).substr(2, 9)}`
  let displayValue = ''
  let inputElement = null

  // Export focus method
  export function focus() {
    inputElement?.focus()
  }

  /**
   * Format input value as number while typing
   * @param {string} value - Raw input value
   * @returns {string} Formatted value for display
   */
  function formatInputNumber(value) {
    if (!value) return ''

    // Check if negative
    const isNegative = String(value).trim().startsWith('-')

    // Remove all non-digit and non-decimal characters (but keep minus)
    let cleaned = String(value).replace(/[^\d.-]/g, '')

    // Remove extra minus signs (keep only the first one)
    if (isNegative) {
      cleaned = '-' + cleaned.replace(/-/g, '')
    } else {
      cleaned = cleaned.replace(/-/g, '')
    }

    // Handle multiple decimal points
    const parts = cleaned.replace('-', '').split('.')
    if (parts.length > 2) {
      cleaned = (isNegative ? '-' : '') + parts[0] + '.' + parts.slice(1).join('')
    }

    // Split into integer and decimal parts
    const withoutMinus = cleaned.replace('-', '')
    const [integerPart, decimalPart] = withoutMinus.split('.')

    // Format integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // Combine back with minus sign if needed
    const formatted =
      decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger

    return isNegative ? `-${formatted}` : formatted
  }

  /**
   * Parse formatted number string to float
   * @param {string} value - Formatted string
   * @returns {number} Parsed number
   */
  function parseNumber(value) {
    if (typeof value === 'number') return value
    if (!value) return 0

    const parsed = numeral(value).value()
    return parsed ?? 0
  }
  $: {
    if (formatAsNumber && type === 'text') {
      displayValue = value ? formatInputNumber(String(value)) : ''
    } else {
      displayValue = value
    }
  }

  function handleInput(event) {
    if (formatAsNumber && type === 'text') {
      const input = event.target
      const cursorPosition = input.selectionStart
      const oldLength = input.value.length

      // Format the value
      const formatted = formatInputNumber(input.value)
      displayValue = formatted

      // Calculate cursor position adjustment
      const newLength = formatted.length
      const lengthDiff = newLength - oldLength

      // Update cursor position after DOM update
      setTimeout(() => {
        const newCursorPosition = Math.max(0, cursorPosition + lengthDiff)
        input.setSelectionRange(newCursorPosition, newCursorPosition)
      }, 0)

      // Update actual value (parsed number)
      value = parseNumber(formatted)
    } else {
      value = event.target.value
      displayValue = value
    }
  }

  function handleBlur(event) {
    if (formatAsNumber && type === 'text') {
      // Ensure proper formatting on blur
      displayValue = value ? formatInputNumber(String(value)) : ''
    }
  }
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={inputId} class="text-foreground text-sm font-medium">
      {label}
    </label>
  {/if}
  <input
    bind:this={inputElement}
    id={inputId}
    {type}
    {placeholder}
    value={displayValue}
    on:input={handleInput}
    on:change
    on:blur={handleBlur}
    on:focus
    on:keydown
    class="border-border placeholder:text-muted-foreground focus:border-foreground w-full border-b bg-transparent px-0 py-2 text-sm transition-colors focus:outline-none"
    style="text-align: {textAlign}"
    {...$$restProps}
  />
</div>
