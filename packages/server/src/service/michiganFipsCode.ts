import axios from 'axios'
import { cache } from './util'

interface Response {
  features?: {
    attributes?: {
      FIPSCODE?: string
    }
  }[]
}

const rawMichiganResponse = async (latLong: [number, number]): Promise<Response | null> => {
  const [lat, lng] = latLong
  const url = `https://services5.arcgis.com/AbZVanP1q8d5OLCX/arcgis/rest/services/vbm_michigan/FeatureServer/0/query?where=1%3D1&geometry=${lng}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=pjson`
  try {
    return (await axios(url)).data as Response
  } catch (error) {
    console.warn(`Unable to fetch Michigan ArcGIS service: ${JSON.stringify(error, null, 2)}`)
    return null
  }
}

export const toFipscode = async (response: Response): Promise<string | null> => {
  return (response?.features ?? [null])[0]?.attributes?.FIPSCODE ?? null
}

export const cacheMichiganResponse = cache(rawMichiganResponse, async([x, y]) => `${x}_${y}`)

export const michiganFipsCode = async (
  latLong: [number, number],
  {cacheQuery} = {cacheQuery: false},
): Promise<string | null> => {
  const call = cacheQuery ? cacheMichiganResponse : rawMichiganResponse
  const response = await call(latLong)
  if (!response) return null
  return toFipscode(response)
}
