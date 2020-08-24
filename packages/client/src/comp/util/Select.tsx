import React from 'react'
import styled from 'styled-components'
import { Select as RawSelect, SelectProps, Option } from 'muicss/react'

export type SelectOptions = readonly string[]
export type SelectOptionType<O extends SelectOptions> = O[number]

interface GenericProps<O extends SelectOptions> extends Omit<SelectProps, 'onChange'> {
  /** Overwrites the value of defaultValue when present. */
  value?: SelectOptionType<O>
  /** Is only used when value is undefined */
  defaultValue?: SelectOptionType<O>
  options: O
  onChange?: (v: SelectOptionType<O>) => void
  /**
   * Defines how each option is labelled, use this function if you don't
   * want options to have the same label as their value
   */
  optionsLabeler?: (option: SelectOptionType<O>) => string
}

const SelectWithValue = styled(RawSelect)<{ value?: string }>``

/**
 * A MuiCSS component that can be controlled without issues when using
 * TypeScript.
 */
export const Select = <O extends SelectOptions>(props: GenericProps<O>) => {
  const { value, defaultValue, onChange, options, optionsLabeler } = props
  const [ selected, setSelected ] = React.useState<SelectOptionType<O> | undefined>(
    value ?? defaultValue ?? options[0]
  )

  React.useEffect(() => {
    // Since we can't really make a directly controled MuiCSS form without
    // hacks using TypeScript, we must ensure that if selected updates
    // it matches the value of props.value
    if (value && value !== selected) { setSelected(value) }
  }, [value, selected, setSelected])

  return <SelectWithValue
    {...props}
    defaultValue={!value ? defaultValue : undefined}
    onChange={e => {
      // MuiCSS has a buggy support for <Select/> when using TypeScript,
      // to really access HTMLSelect and its value we need to do this hack
      const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
      const newValue = trueSelect.value as string
      // even when this is a uncontrolled form we must keep track of the
      // selected element to lock the value of MuiCSS Select.firstChild
      // (the true <select/>)
      setSelected(newValue)
      if (onChange) {
        onChange(newValue)
      }
    }}
  >
    {props.options.map(
      (option, key) => <Option
        value={option}
        label={optionsLabeler ? optionsLabeler(option) : option}
        key={key}
      />
    )}
  </SelectWithValue>
}
