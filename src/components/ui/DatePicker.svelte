<script>
  import { DateInput } from 'date-picker-svelte'

  export let value = ''
  export let className = ''

  let date = null
  let isUpdating = false

  // แปลง string (yyyy-mm-dd) เป็น Date object
  $: if (value && typeof value === 'string' && !isUpdating) {
    const parts = value.split('-')
    if (parts.length === 3) {
      isUpdating = true
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      isUpdating = false
    }
  }

  // แปลง Date object กลับเป็น string (yyyy-mm-dd)
  const handleDateChange = (newDate) => {
    if (newDate instanceof Date && !isNaN(newDate) && !isUpdating) {
      const year = newDate.getFullYear()
      const month = String(newDate.getMonth() + 1).padStart(2, '0')
      const day = String(newDate.getDate()).padStart(2, '0')
      value = `${year}-${month}-${day}`
    }
  }

  $: handleDateChange(date)
</script>

<div class="date-picker-wrapper {className}">
  <DateInput bind:value={date} format="dd-MM-yyyy" {...$$restProps} />
</div>

<style>
  .date-picker-wrapper {
    --date-picker-background: var(--popover);
    --date-picker-foreground: var(--popover-foreground);
    --date-picker-highlight-border: transparent;
    --date-picker-highlight-shadow: transparent;
    --date-picker-selected-color: var(--primary-foreground);
    --date-picker-selected-background: var(--primary);
  }

  .date-picker-wrapper :global(.date-time-field) {
    width: 100%;
  }

  .date-picker-wrapper :global(.date-time-field input) {
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0px;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition-property: border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    outline: none;
    color: var(--foreground);
  }

  .date-picker-wrapper :global(.date-time-field input::placeholder) {
    color: var(--muted-foreground);
  }

  .date-picker-wrapper :global(.date-time-field input:focus) {
    border-color: var(--foreground);
    outline: none;
  }

  .date-picker-wrapper :global(.date-time-field input:hover) {
    border-color: none;
  }

  /* ซ่อน calendar icon */
  .date-picker-wrapper :global(.date-time-field .picker-indicator) {
    display: none;
  }

  /* Calendar popup */
  .date-picker-wrapper :global(.calendar) {
    box-shadow: var(--shadow-md);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }
</style>
