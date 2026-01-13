<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';

  let {
    ref = $bindable(null),
    class: className,
    placeholder,
    children,
    ...restProps
  }: SelectPrimitive.ValueProps = $props();
</script>

<SelectPrimitive.Value
  bind:ref
  class={className}
  {placeholder}
  {...restProps}
/>
