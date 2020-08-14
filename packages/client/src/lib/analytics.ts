import ReactPixel from 'react-facebook-pixel'
import ReactGA from 'react-ga'
import { Analytics, processEnvOrThrow } from '../common'

const fbOptions = {
  autoConfig: true, 	// set pixel's autoConfig
  debug: false, 		  // enable logs
}

export const initializeAnalytics = ({ facebookId, googleId }: Analytics) => {
  facebookId = processEnvOrThrow('REACT_APP_FACEBOOK_PIXEL')
  ReactPixel.init(facebookId, undefined, fbOptions)
  ReactPixel.pageView()

  const gaClientTracker: ReactGA.Tracker[] = googleId ? [{
    trackingId: googleId,
    gaOptions: { name: 'ClientTracker' }
  }] : []
  const gaTrackers: ReactGA.Tracker[] = [
    {
      trackingId: processEnvOrThrow('REACT_APP_GOOGLE_UA'),
      gaOptions: { name: 'VBMTracker' }
    },
    ...gaClientTracker,
  ]
  ReactGA.initialize(gaTrackers)

  ReactGA.pageview(window.location.hash, ['ClientTracker', 'VBMTracker'])
}

/* run this after history push to have up to date url */
export const pageView = () => {
  ReactPixel.pageView()
  ReactGA.pageview(window.location.hash, ['ClientTracker', 'VBMTracker'])
}