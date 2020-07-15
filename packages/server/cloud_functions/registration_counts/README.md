Follow: https://firebase.google.com/docs/firestore/solutions/schedule-export#gcp-console and tweak for running this Cloud Function on a schedule (make runtime Python but leave source code empty). Name function monitorSignUps.

Run 'make deploy'.

Create Stackdriver Dashboards pointing to the custom metric type referenced in code.