import { DashboardsServiceClient } from '@google-cloud/monitoring-dashboards'
import { processEnvOrThrow, implementedStates, getStateAbbr } from '../common'
import { AnalyticsStorage } from './storage'
import { FirestoreService } from '../service/firestore'

const fsService = new FirestoreService()
const projectId = processEnvOrThrow('GCLOUD_PROJECT')
const client = new DashboardsServiceClient()
const projectPath = client.projectPath(projectId)

// JSON models from this file are based on the documentation from:
// https://cloud.google.com/monitoring/dashboards/api-examples#dashboard_in_gridlayout
// https://cloud.google.com/monitoring/dashboards/api-dashboard
// and the Metric Explorer https://console.cloud.google.com/monitoring/metrics-explorer

const makeDataSet = (resourceUrl: string, label: string) => ({
  plotType: 'LINE',
  legendTemplate: label,
  minAlignmentPeriod: { seconds: 10800 },
  timeSeriesQuery: {
    unitOverride: null,
    timeSeriesFilter: {
      aggregation: {
        groupByFields: null,
        alignmentPeriod: { seconds: 10800 },
        crossSeriesReducer: 'REDUCE_NONE',
        perSeriesAligner: 'ALIGN_MAX',
      },
      secondaryAggregation: {
        groupByFields: null,
        alignmentPeriod: null,
        crossSeriesReducer: 'REDUCE_NONE',
        perSeriesAligner: 'ALIGN_MAX',
      },
      filter: `metric.type="custom.googleapis.com/${resourceUrl}"`
    }
  }
} as const)

const makeWidget = (
  widgetTitle: string,
  yAxisLabel: null | string,
  chartData: Array<{resourceUri: string, label: string} | null>,
) => ({
  title: widgetTitle,
  xyChart: {
    chartOptions: { mode: 'COLOR' },
    thresholds: null,
    timeshiftDuration: { seconds: 0 },
    xAxis: null,
    yAxis: { label: yAxisLabel, scale: 'LINEAR' },

    dataSets: chartData.map(
      d => d ? makeDataSet(d.resourceUri, d.label) : null
    // Removes null elements and type casting errors
    ).filter(e => !!e) as ReturnType<typeof makeDataSet>[],
  }
} as const)

/**
 * Etags are used to prevent concurrent updates to the same dashboard,
 * which is why we can't store them for reuse.
 *
 * https://cloud.google.com/sdk/gcloud/reference/beta/monitoring/dashboards/update
 */
type etag = string

const getETag = async (dashboardName: string | null | undefined): Promise<etag | null> => {
  if (!dashboardName) return null

  const resp = await client.getDashboard({
    name: dashboardName
  })

  return resp[0].etag ?? null
}

export const createOrUpdateAnalyticsDashboard = async () => {
  const storage = new AnalyticsStorage()
  await storage.initializeOrSync()

  const stateDailySignups = makeWidget(
    'Per state daily sign ups',
    'Daily Sign ups',
    implementedStates.map(state => {
      const stateAbbr = getStateAbbr(state)?.toLowerCase() as string
      return {resourceUri: `${stateAbbr}/daily_sign_ups`, label: `${state} daily sign ups`}
    }),
  )
  const stateTotalSignups = makeWidget(
    'Per state total sign ups',
    'Total Sign ups',
    implementedStates.map(state => {
      const stateAbbr = getStateAbbr(state)?.toLowerCase() as string
      return {resourceUri: `${stateAbbr}/total_sign_ups`, label: `${state} total sign ups`}
    }),
  )

  const oids = await fsService.getAllOids()
  const orgsDailySignups = makeWidget(
    'Per Org daily sign ups',
    'Daily Sign ups',
    oids.map(oid => {
      // Some orgs might exist in our system but have no sign ups, we only
      // track in the metrics those that have at least one registered sign up
      if (storage.data.org.values[oid]) {
        return {resourceUri:`org_${oid}/daily_sign_ups`, label: `${oid} daily sign ups`}
      }
      return null
    }),
  )
  const orgsTotalSignups = makeWidget(
    'Per Org total sign ups',
    'Total Sign ups',
    oids.map(oid => {
      // Some orgs might exist in our system but have no sign ups, we only
      // track in the metrics those that have at least one registered sign up
      if (storage.data.org.values[oid]) {
        return {resourceUri:`org_${oid}/total_sign_ups`, label: `${oid} total sign ups`}
      }
      return null
    }),
  )

  const dashboardData = {
    parent: projectPath,
    dashboard: {
      displayName: 'Sign ups',
      // Not really the name of the dashboard, but its path.
      name: storage.data.dashboardPath,
      etag: await getETag(storage.data.dashboardPath),
      gridLayout: {
        columns: 2,
        widgets: [
          makeWidget('Daily sign ups', 'Sign ups', [{label: 'Daily sign ups', resourceUri: 'daily_sign_ups'}]),
          makeWidget('Total sign ups', 'Sign ups', [{label: 'Total sign ups', resourceUri: 'total_sign_ups'}]),
          stateDailySignups,
          stateTotalSignups,
          orgsDailySignups,
          orgsTotalSignups,
        ]
      }
    },
  }

  const resp = storage.data.dashboardPath
    ? await client.updateDashboard(dashboardData)
    : await client.createDashboard(dashboardData)
  if (resp[0].name && resp[0].etag) {
    await storage.updateDashboard(resp[0].name)
  }
}

// Allows to manually run this script instead of executing it at the cronjobs
if (require.main === module) {
  createOrUpdateAnalyticsDashboard()
}
