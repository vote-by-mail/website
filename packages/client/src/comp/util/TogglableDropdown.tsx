import React from 'react'
import { Select, SelectOptions, SelectOptionType } from './Select'

interface Props<O extends SelectOptions> {
  children: (selected: SelectOptionType<O>) => React.ReactNode
  options: O
  /**
   * The default value of this TogglableDropdown, this prop is only useful
   * when not controlling the value of this component, since it will be ignored
   * if `props.value !== undefined`.
   *
   * This mimics the default behavior for React `<select/>` components.
   */
  defaultValue?: SelectOptionType<O>
  label?: React.ReactNode
  style?: React.CSSProperties
  /** Function that is called after changing values */
  onChange?: (value: SelectOptionType<O>) => void
  /** Turns this TogglableDropdown into a controlled input */
  value?: SelectOptionType<O>
}

export const TogglableDropdown = <O extends SelectOptions>(props: Props<O>) => {
  const { style, options, value, defaultValue, children, onChange } = props
  // We need a state to track the value of this component in order to update
  // its children.
  const [ selected, setSelected ] = React.useState<SelectOptionType<O>>(value ?? defaultValue ?? options[0])

  React.useEffect(() => {
    // Since we can't really make a directly controled MuiCSS form without
    // hacks using TypeScript, we must ensure that if selected updates
    // it matches the value of props.value
    if (value && value !== selected) { setSelected(value) }
  }, [value, selected, setSelected])

  return <div style={style}>
    <Select<typeof options>
      {...props}
      style={undefined}
      onChange={e => {
        setSelected(e)
        if (onChange) onChange(e)
      }}
    />
    {/* selected will always be the same value of `props.value` */}
    {children(selected)}
  </div>
}
