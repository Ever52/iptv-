import { hrtime } from "process"
import { ISource, TEPGSource } from "../types"
import { get_rollback_urls } from "../utils"


export const updateByRollback = async (
  sr: ISource,
  sr_filter: ISource["filter"],
  idx: number = 0
): Promise<[string, number] | undefined> => {
  const rollback_urls = get_rollback_urls()
  try {
    const now = hrtime.bigint()
    const res = await fetch(`${rollback_urls[idx]}/${sr.f_name}.m3u`)
    const status = res.status
    if (/^[2]/.test(status.toString())) {
      console.log(
        `Fetch m3u from ${sr.name} with ROLLBACK from ${rollback_urls[idx]
        } finished, cost ${(parseInt(hrtime.bigint().toString()) -
          parseInt(now.toString())) /
        10e6
        } ms`
      )
      const text = await res.text()
      return sr_filter(text as string, "rollback")
    }

    console.log(
      `Fetch m3u Rollback from ${rollback_urls[idx]} FAILED, try next...`
    )
    if (++idx < rollback_urls.length) {
      return updateByRollback(sr, sr_filter, idx)
    }

    console.log(`All failed, give up ${sr.name}!`)
    return undefined
  } catch (e) {
    console.log(
      `Fetch m3u Rollback from ${rollback_urls[idx]} FAILED, try next...`
    )
    if (++idx < rollback_urls.length) {
      return updateByRollback(sr, sr_filter, idx)
    }

    console.log(`All failed, give up ${sr.name}!`)
    return undefined
  }
}

export const updateEPGByRollback = async (
  sr: TEPGSource,
  idx: number = 0
): Promise<string | undefined> => {
  const rollback_urls = get_rollback_urls()
  try {
    const now = hrtime.bigint()
    const res = await fetch(`${rollback_urls[idx]}/${sr.f_name}.xml`)
    const status = res.status
    if (/^[2]/.test(status.toString())) {
      console.log(
        `Fetch EPG from ${sr.name} with ROLLBACK from ${rollback_urls[idx]
        } finished, cost ${(parseInt(hrtime.bigint().toString()) -
          parseInt(now.toString())) /
        10e6
        } ms`
      )
      return await res.text()
    }

    console.log(
      `Fetch EPG Rollback from ${rollback_urls[idx]} FAILED, try next...`
    )
    if (++idx < rollback_urls.length) {
      return updateEPGByRollback(sr, idx)
    }

    console.log(`All failed, give up ${sr.name}!`)
    return undefined
  } catch (e) {
    console.log(
      `Fetch EPG Rollback from ${rollback_urls[idx]} FAILED, try next...`
    )
    if (++idx < rollback_urls.length) {
      return updateEPGByRollback(sr, idx)
    }

    console.log(`All failed, give up ${sr.name}!`)
    return undefined
  }
}