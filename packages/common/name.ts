export interface Name {
  first: string
  middle?: string
  last: string
  suffix?: string
}

export const stringifyName = (name: Name) => {
  const first = name.first
  const middle = name.middle ? ` ${name.middle}` : ''
  const last = ` ${name.last}`
  const suffix = name.suffix ? ` ${name.suffix}` : ''
  return `${first}${middle}${last}${suffix}`
}
