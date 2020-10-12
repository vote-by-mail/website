import { getFipsCode } from './fipsCode'

const main = async() => {
  // 2605-2719 Crest Line Dr, Madison, WI 53704
  // Dane County
  console.log('Fetching code for Wisconsin')
  console.log(`Expecting code to be 13251`)
  const wiCode = await getFipsCode([43.133995, -89.312254], 'Wisconsin', { cacheQuery: true })
  console.log(`Got code: ${wiCode}`)

  // 6399-6201 Miller Rd, Dearborn, MI 48126
  // Wayne County
  console.log('Fetching code for Michigan')
  console.log(`Expecting code to be 21000`)
  const miCode = await getFipsCode([42.336491, -83.166684], 'Michigan', { cacheQuery: true })
  console.log(`Got code: ${miCode}`)
}

main()
