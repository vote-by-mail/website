import React from 'react'
import { Select, Option } from 'muicss/react'

type Options = readonly string[]

interface Props<O extends Options> {
  children: (selected: O[number]) => React.ReactNode
  options: O
  defaultValue?: O[number]
  label?: React.ReactNode
  style?: React.CSSProperties
  /** Function that is called after changing values */
  onChange?: (value: O[number] | null) => void
}

export const TogglableDropdown = <O extends Options>({
  children,
  defaultValue,
  label,
  onChange,
  options,
  style,
}: Props<O>) => {
  const [ selected, setSelected ] = React.useState<O[number] | undefined>(defaultValue)

  return <div style={style}>
    <Select
      label={label}
      defaultValue={defaultValue as string | undefined}
      onChange={e => {
        // MuiCSS has a buggy support for <Select/> when using TypeScript,
        // to really access HTMLSelect and its value we need to do this hack
        const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
        setSelected(trueSelect.value as O[number])
        if (onChange) onChange(trueSelect.value as O[number])
      }}
    >{
      options.map(
        (value, key) => <Option value={value} label={value} key={key}/>
      )
    }</Select>
    {selected ? children(selected) : null}
  </div>
}
