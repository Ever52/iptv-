import fs from "fs";
import path from "path";
import { hrtime } from "process"
import type { TEPGSource, ISource } from "../types";
import { with_github_raw_url_proxy, m3u2txt } from "../utils"


export const getContent = async (src: ISource | TEPGSource) => {
  const now = hrtime.bigint()
  const url = /^https:\/\/raw.githubusercontent.com\//.test(src.url)
    ? with_github_raw_url_proxy(src.url)
    : src.url

  const res = await fetch(url)
  return [res.status, await res.text(), now]
}

export const writeM3u = (name: string, streams: string) => {
  if (!fs.existsSync(path.join(path.resolve(), "streams"))) {
    fs.mkdirSync(path.join(path.resolve(), "streams"));
  }

  fs.writeFileSync(path.join(path.resolve(), "streams", `${name}.m3u`), streams);
};
export const writeM3uToTxt = (name: string, f_name: string, m3u: string) => {
  const m3uArray = m3u.split("\n")
  let txt = m3u2txt(m3uArray)

  if (!fs.existsSync(path.join(path.resolve(), "streams", "txt"))) {
    fs.mkdirSync(path.join(path.resolve(), "streams", "txt"))
  }

  fs.writeFileSync(
    path.join(path.resolve(), "streams", "txt", `${f_name}.txt`),
    txt
  )
}

export const writeSources = (
  name: string,
  f_name: string,
  sources: Map<string, string[]>
) => {
  let srcs = {}
  for (const [k, v] of sources) {
    srcs[k] = v
  }

  if (!fs.existsSync(path.resolve("streams", "sources"))) {
    fs.mkdirSync(path.resolve("streams", "sources"))
  }

  fs.writeFileSync(
    path.resolve("streams", "sources", `${f_name}.json`),
    JSON.stringify({
      name,
      sources: srcs,
    })
  )
}

export const mergeSources = () => {
  const sources_p = path.resolve("streams", "sources")

  const files = fs.readdirSync(sources_p)

  const res = {
    name: "Sources",
    sources: {},
  }

  files.forEach((f) => {
    const so = JSON.parse(
      fs.readFileSync(path.join(sources_p, f), "utf-8")
    ).sources

    Object.keys(so).forEach((k) => {
      if (!res.sources[k]) {
        res.sources[k] = so[k]
      } else {
        res.sources[k] = [...new Set([...res.sources[k], ...so[k]])]
      }
    })
  })

  fs.writeFileSync(path.join(sources_p, "sources.json"), JSON.stringify(res))
}


export const writeEpgXML = (f_name: string, xml: string) => {
  if (!fs.existsSync(path.join(path.resolve(), "streams", "epg"))) {
    fs.mkdirSync(path.join(path.resolve(), "streams", "epg"))
  }

  fs.writeFileSync(path.resolve("streams", "epg", `${f_name}.xml`), xml)
}


export const mergeTxts = () => {
  const txts_p = path.resolve("streams", "txt")

  const files = fs.readdirSync(txts_p)

  const txts = files
    .map((d) => fs.readFileSync(path.join(txts_p, d).toString()))
    .join("\n")

  fs.writeFileSync(path.join(txts_p, "merged.txt"), txts)
}

const cleanDir = (p: string) => {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach((file) => {
      const isDir = fs.statSync(path.join(p, file)).isDirectory();
      if (isDir) {
        cleanDir(path.join(p, file));
      } else {
        fs.unlinkSync(path.join(p, file));
      }
    });
  }
};

export const cleanFiles = () => cleanDir(path.join(path.resolve(), "streams"));
