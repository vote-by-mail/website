import { cacheWisconsinResponse, toFipscode } from './wisconsinFipsCode'

const main = async() => {
  // 2605-2719 Crest Line Dr, Madison, WI 53704
  // Dane County
  const response = await cacheWisconsinResponse([43.133995, -89.312254])

  if (!response) return
  console.log(response)
  console.log(`Expecting code to be 13251`)
  const fipscode = await toFipscode(response)
  if (!fipscode) return
  console.log(`Got code: ${fipscode}`)
}

main()
