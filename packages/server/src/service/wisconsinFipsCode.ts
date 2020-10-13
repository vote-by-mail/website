import axios from 'axios'
import { cache } from './util'

interface Response {
  features?: {
    attributes?: {
      DOA?: string
    }
  }[]
}

const rawWisconsinResponse = async (latLong: [number, number]): Promise<Response | null> => {
  const [lat, long] = latLong
  const url = `https://services5.arcgis.com/AbZVanP1q8d5OLCX/ArcGIS/rest/services/wisconsin/FeatureServer/0/query?where=&objectIds=&time=&geometry=${long}%2C${lat}4&geometryType=esriGeometryPoint&inSR=4236&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=DOA&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`
  try {
    return (await axios(url)).data as Response
  } catch (error) {
    console.warn(`Unable to fetch Wisconsin ArcGIS service: ${JSON.stringify(error, null, 2)}`)
    return null
  }
}

export const toFipscode = async (response: Response): Promise<string | null> => {
  return (response?.features ?? [null])[0]?.attributes?.DOA ?? null
}

export const cacheWisconsinResponse = cache(rawWisconsinResponse, async(latLong) => `WI DOA ${latLong[0]} ${latLong[1]}`)

export const wisconsinFipsCode = async (
  latLong: [number, number],
  {cacheQuery} = {cacheQuery: false},
): Promise<string | null> => {
  const call = cacheQuery ? cacheWisconsinResponse : rawWisconsinResponse
  const response = await call(latLong)
  if (!response) return null
  return toFipscode(response)
}
