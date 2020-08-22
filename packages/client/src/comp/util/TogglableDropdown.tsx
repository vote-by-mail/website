import React from 'react'
import { Select as RawSelect, Option } from 'muicss/react'
import styled from 'styled-components'

type Options = readonly string[]
type OptionType<O extends Options> = O[number]

interface Props<O extends Options> {
  children: (selected: OptionType<O>) => React.ReactNode
  options: O
  /**
   * The default value of this TogglableDropdown, this prop is only useful
   * when not controlling the value of this component, since it will be ignored
   * if `props.value !== undefined`.
   *
   * This mimics the default behavior for React `<select/>` components.
   */
  defaultValue?: OptionType<O>
  label?: React.ReactNode
  style?: React.CSSProperties
  /** Function that is called after changing values */
  onChange?: (value: OptionType<O>) => void
  /** Turns this TogglableDropdown into a controlled input */
  value?: OptionType<O>
}

// Small hack to allow us to pass this prop to Select, unfortunately we
// cannot do the same for onChange
const Select = styled(RawSelect)<{ value?: string }>``

export const TogglableDropdown = <O extends Options>({
  children,
  defaultValue,
  label,
  onChange,
  options,
  style,
  value,
}: Props<O>) => {
  const [ selected, setSelected ] = React.useState<OptionType<O>>(defaultValue ?? options[0])

  React.useEffect(() => {
    // Since we can't really make a directly controled MuiCSS form without
    // hacks using TypeScript, we must ensure that if selected updates
    // it matches the value of props.value
    if (value && value !== selected) { setSelected(value) }
  }, [value, selected, setSelected])

  return <div style={style}>
    <Select
      label={label}
      // Ignores defaultValue if prop.value is present.
      defaultValue={!value ? defaultValue : undefined}
      value={value}
      onChange={e => {
        // MuiCSS has a buggy support for <Select/> when using TypeScript,
        // to really access HTMLSelect and its value we need to do this hack
        const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
        const newValue = trueSelect.value as OptionType<O>
        // even when this is a controlled form we must keep track of the
        // unexported selected to lock the value of MuiCSS Select.firstChild
        // (the true <select/>)
        setSelected(newValue)
        if (onChange) {
          onChange(newValue)
        }
      }}
    >{
      options.map(
        (option, key) => <Option value={option} label={option} key={key}/>
      )
    }</Select>
    {(value ?? selected) ? children(value ?? selected) : null}
  </div>
}
