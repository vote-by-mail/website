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
  const url = `https://mapservices.legis.wisconsin.gov/arcgis/rest/services/Statewide/Municipal_Boundaries_July_2020/FeatureServer/0/query?where=1%3D1&outFields=*&geometry=${long}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json`
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
  const k = false
  const call = cacheQuery && k ? cacheWisconsinResponse : rawWisconsinResponse
  const response = await call(latLong)
  if (!response) return null
  return toFipscode(response)
}
