import fs from 'fs'
import { safeReadFile } from '../service/util'

const path = `${__dirname}/storage.json`
const options = { encoding: 'utf-8' } as const

// Used to save the .json file
interface RawStorage {
  lastQueryTime: number
  totalSignups: number
  yesterdayDate: number
  yesterdaySignups: number
}

// Used to speed up coding, since timestamps are already converted to Dates
interface Storage {
  lastQueryTime: Date
  totalSignups: number
  yesterdayDate: Date
  yesterdaySignups: number
}

class AnalyticsStorage {
  private storage: RawStorage = {
    lastQueryTime: 0,
    totalSignups: 0,
    yesterdayDate: 0,
    yesterdaySignups: 0,
  }

  constructor() { this.init() }

  private createDefaultFile = () => {
    this.storage = {
      lastQueryTime: 0, yesterdayDate: 0, yesterdaySignups: 0, totalSignups: 0,
    }
    // We don't use this.update here since that function is going to
    // update lastQueryTime/yesterdayDate
    return fs.promises.writeFile(
      path, JSON.stringify(this.storage), options,
    )
  }

  private init = async () => {
    if (fs.existsSync(path)) {
      try {
        await this.refresh()
      } catch(e) {
        console.error(e)
      }
    } else {
      await this.createDefaultFile()
    }
  }


  /**
   * If the stored yesterday date is different than the current one, yesterdaySignups
   * is automatically zeroed to avoid wrong values when updating the daily
   * signup metric
   */
  data = async (): Promise<Storage> => {
    await this.refresh()
    const yesterdayDate = new Date(this.storage.yesterdayDate)
    const yesterdaySignups = yesterdayDate.valueOf() === this.yesterdayZeroed.valueOf()
      ? this.storage.yesterdaySignups
      : 0
    return {
      yesterdayDate, yesterdaySignups,
      lastQueryTime: new Date(this.storage.lastQueryTime),
      totalSignups: this.storage.totalSignups,
    }
  }

  /**
   * Returns yesterday's date with zeroed hours/minutes/seconds/millis
   */
  get yesterdayZeroed() {
    const now = new Date()

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      // Node will go back to the latest day of the previous month without
      // issues when date == 0
      now.getDate() - 1,
    )
  }

  /** Updates the saved and in-memory storage */
  update = async (totalSignups: number, yesterdaySignups: number, lastQueryTime: Date) => {
    this.storage = {
      yesterdaySignups, totalSignups,
      lastQueryTime: lastQueryTime.valueOf(),
      yesterdayDate: this.yesterdayZeroed.valueOf(),
    }
    return fs.promises.writeFile(
      path, JSON.stringify(this.storage), options,
    )
  }

  /** Updates the in-memory storage with the values written on disk */
  private refresh = async () => {
    const buf = await safeReadFile(path)
    this.storage = JSON.parse(buf.toString(options.encoding))
  }
}

export const storage = new AnalyticsStorage()
