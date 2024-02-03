import { converter, handle_m3u, replace_github_raw_proxy_url, collectM3uSource } from "../utils"
import type { TSources, ISource } from "../types"

export const yang_m3u_filter: ISource["filter"] = (
    raw,
    caller,
    collectFn
): [string, number] => {
    const rawArray = handle_m3u(replace_github_raw_proxy_url(raw))

    if (caller === "normal" && collectFn) {
        for (let i = 1; i < rawArray.length; i += 2) {
            collectM3uSource(rawArray[i], rawArray[i + 1], collectFn)
        }
    }

    return [converter(rawArray.join("\n")), (rawArray.length - 1) / 2]
}

export const yang_m3u_sources: TSources = [
    {
        name: "YanG-1989 Gather",
        f_name: "y_g",
        url: "https://raw.githubusercontent.com/YanG-1989/m3u/main/Gather.m3u",
        filter: yang_m3u_filter,
    },
    {
        name: "YanG_1989 Adult",
        f_name: "y_a",
        url: "https://fastly.jsdelivr.net/gh/YanG-1989/m3u@main/Adult.m3u",
        filter: yang_m3u_filter,
    },
]
