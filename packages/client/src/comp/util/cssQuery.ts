const media = '@media screen and'

const minWidth = (px: number) => `(min-width: ${px}px)`
const maxWidth = (px: number) => `(max-width: ${px}px)`

const minHeight = (px: number) => `(min-height: ${px}px)`
const maxHeight = (px: number) => `(max-height: ${px}px)`

const portrait = '(orientation: portrait)'
const landscape = '(orientation: landscape)'

/**
 * Group of queries that aims to speed up styling, as well as to help
 * avoiding conflicts when styling different parts of the app.
 */
export const cssQuery = {
  get landscape() { return `${media} ${landscape}` },
  get portrait() { return `${media} ${portrait}` },

  /**
   * Devices up to 500px tall and on landscape, useful for targetting
   * mobile landscape phones
   */
  get short() { return `${media} ${maxHeight(500)} and ${landscape}` },
  /**
   * Devices at least 800px tall.
   */
  get tall() { return `${media} ${minHeight(800)}` },

  /** Devices narrower than 767px */
  get small() { return `${media} ${maxWidth(767)}` },

  /** Devices at least 768px wide */
  get medium() { return `${media} ${minWidth(768)}` },
  /** Devices from 768px up to 991px */
  get onlyMedium() { return `${media} ${minWidth(768)} and ${maxWidth(991)}` },

  /** Devices at least 992px wide */
  get large() { return `${media} ${minWidth(992)}` },
  /** Devices from 992px to 1199px */
  get onlyLarge() { return `${media} ${minWidth(992)} and ${maxWidth(1199)}` },
  /** Devices at least 1200px wide */
  get xlarge() { return `${media} ${minWidth(1200)}` },
}
