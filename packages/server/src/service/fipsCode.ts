import axios from 'axios'
import { cache } from './util'

interface WisconsinArcGISResponse {
  /** Not really from ArcGIS, we'll set this value manually to help refactoring */
  state: 'Wisconsin'
  features?: {
    attributes?: {
      DOA?: string
    }
  }[]
}

interface MichiganArcGISResponse {
  /** Not really from ArcGIS, we'll set this value manually to help refactoring */
  state: 'Michigan'
  features?: {
    attributes?: {
      FIPSCODE?: string
    }
  }[]
}

type ArcGISResponse =
  | WisconsinArcGISResponse
  | MichiganArcGISResponse

type LatLong = [number, number]

type DirectSearchState = 'Michigan' | 'Wisconsin'

const queryURL = ([lat, long]: LatLong, state: DirectSearchState) => {
  switch (state) {
    case 'Michigan': return `https://services5.arcgis.com/AbZVanP1q8d5OLCX/arcgis/rest/services/vbm_michigan/FeatureServer/0/query?where=1%3D1&geometry=${long}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=pjson`

    case 'Wisconsin': return `https://services5.arcgis.com/AbZVanP1q8d5OLCX/ArcGIS/rest/services/wisconsin/FeatureServer/0/query?where=&objectIds=&time=&geometry=${long}%2C${lat}4&geometryType=esriGeometryPoint&inSR=4236&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=DOA&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`
  }
}

const queryArcGIS = async (
  latLong: LatLong,
  state: DirectSearchState,
): Promise<ArcGISResponse | null> => {
  const url = queryURL(latLong, state)
  try {
    const { data } = await axios(url)
    data.state = state
    return data
  } catch (error) {
    console.warn(`Unable to fetch ${state} ArcGIS service: ${JSON.stringify(error, null, 2)}`)
    return null
  }
}

export const cacheArcGISResponse = cache(queryArcGIS, async (latLong, state) => `${state} FIPS ${latLong[0]} ${latLong[1]}`)

export const toFipsCode = (response: ArcGISResponse) => {
  if (response.features?.length === 0) {
    throw new Error('ArcGIS Response should have at least one item')
  }

  switch (response.state) {
    case 'Michigan': return (response?.features ?? [null])[0]?.attributes?.FIPSCODE ?? null
    case 'Wisconsin': return (response?.features ?? [null])[0]?.attributes?.DOA ?? null
  }
}

export const getFipsCode = async (
  latLong: LatLong,
  state: DirectSearchState,
  {cacheQuery} = {cacheQuery: false},
): Promise<string | null> => {
  const call = cacheQuery ? cacheArcGISResponse : queryArcGIS
  const response = await call(latLong, state)
  if (!response) return null
  return toFipsCode(response)
}
