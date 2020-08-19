import React from 'react'
import { Select, Option } from 'muicss/react'

interface Props {
  children: (selected: string) => React.ReactNode
  options: string[]
  defaultValue?: string
  label?: React.ReactNode
  style?: React.CSSProperties
  /** Function that is called after changing values */
  onChange?: (value: string | null) => void
}

export const TogglableDropdown: React.FC<Props> = ({
  children,
  defaultValue,
  label,
  onChange,
  options,
  style,
}) => {
  const [ selected, setSelected ] = React.useState<string | undefined>(defaultValue)

  return <div style={style}>
    <Select
      label={label}
      defaultValue={defaultValue}
      onChange={e => {
        // MuiCSS has a buggy support for <Select/> when using TypeScript,
        // to really access HTMLSelect and its value we need to do this hack
        const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
        setSelected(trueSelect.value)
        if (onChange) onChange(trueSelect.value)
      }}
    >{
      options.map(
        (value, key) => <Option value={value} label={value} key={key}/>
      )
    }</Select>
    {selected ? children(selected) : null}
  </div>
}
