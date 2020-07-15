from datetime import datetime, timedelta, timezone
import os
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud import monitoring_v3


def create_time_series(name, value):
  series = monitoring_v3.types.TimeSeries()
  series.metric.type = 'custom.googleapis.com/' + name
  series.resource.type = 'global'
  point = series.points.add()
  point.value.int64_value = value
  now = time.time()
  point.interval.end_time.seconds = int(now)
  return series


def main(data, context):
  # Get data from Firestore.
  if os.environ.get('REMOTE') is not None:
    cred = credentials.Certificate(os.environ['GOOGLE_APPLICATION_CREDENTIALS'])
    firebase_admin.initialize_app(cred)
  else:
    firebase_admin.initialize_app()
  db = firestore.client()
  state_info = db.collection(u'StateInfo')
  total_count = 0
  past_24_hours_count= 0
  for person in state_info.stream():
    total_count += 1
    if person.get('created') > (datetime.now(timezone.utc) - timedelta(days=1)):
      past_24_hours_count += 1

  # Write to monitoring.
  client = monitoring_v3.MetricServiceClient()
  project_name = client.project_path(os.environ['GCLOUD_PROJECT'])
  total_sign_ups_series = create_time_series('total_sign_ups', total_count)
  past_day_sign_ups_series = create_time_series('past_day_sign_ups', past_24_hours_count)
  client.create_time_series(project_name, [total_sign_ups_series, past_day_sign_ups_series])

  print(total_sign_ups_series)
  print(past_day_sign_ups_series)


if __name__ == '__main__':
  main(None, None)