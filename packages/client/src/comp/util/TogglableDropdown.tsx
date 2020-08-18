import React from 'react'
import { Select, Option } from 'muicss/react'
import { useControlRef } from './ControlRef'

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
  const [ selected, setSelected ] = React.useState<string | null>(defaultValue ?? null)
  const selectRef = useControlRef<Select>()

  return <div style={style}>
    <Select
      label={label}
      defaultValue={defaultValue}
      ref={selectRef}
      onChange={() => {
        setSelected(selectRef.value())
        if (onChange) onChange(selected)
      }}
    >{
      options.map(
        (value, key) => <Option value={value} label={value} key={key}/>
      )
    }</Select>
    {selected ? children(selected) : null}
  </div>
}
