<script>
  /**
   * Button Component
   * @prop {string} variant - Button style variant
   * @prop {string} size - Button size
   * @prop {string} type - Button HTML type
   * @prop {boolean} disabled - Disabled state
   */
  export let variant = 'primary';
  export let size = 'md';
  export let type = 'button';
  export let disabled = false;

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-sage-600 text-sand-50 hover:bg-sage-700 active:bg-sage-800 dark:bg-sage-500 dark:hover:bg-sage-600',
    secondary:
      'bg-sand-200 text-charcoal-800 hover:bg-sand-300 dark:bg-charcoal-800 dark:text-sand-200 dark:hover:bg-charcoal-700',
    danger: 'bg-terracotta-600 text-sand-50 hover:bg-terracotta-700 active:bg-terracotta-800',
    ghost:
      'bg-transparent hover:bg-sand-200 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-sand-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
</script>

<button
  {type}
  {disabled}
  class="{baseStyles} {variants[variant]} {sizes[size]}"
  on:click
  {...$$restProps}
>
  <slot />
</button>
