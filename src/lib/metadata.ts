import { Config, Global } from "../../config/types"

export const getMetadata = (stringContent: string, global: Global, prefix = "") => {
  return stringContent
    .split("\n")
    .filter(l => l.startsWith(`${prefix}####`))
    .map(l => l.trim())
    .reduce((prev, l) => {
      const result = /#### (.*): (.*)$/.exec(l)

      if (result === null) {
        throw new Error(`this line doesn't match:\n${JSON.stringify(l)}`)
      }

      let [, type, value] = result

      if (!global.validTags.includes(type)) {
        throw new Error(`Unknown tag "${type}"`)
      }

      if (global.userTags.includes(type)) {
        // @ts-ignore
        value = value.split(",").map(u => u.trim())
      }

      return {
        ...prev,
        [type]: value
      }
    }, {})
}

export const checkMetadata = (metadata: any, global: Global) => {
  global.requiredTags.forEach(tag => {
    if (!metadata[tag]) {
      throw new Error(`Required tag "${tag}" missing`)
    }
  })

  global.userTags.forEach(tag => {
    if (!metadata[tag]) {
      return
    }

    metadata[tag].forEach((user: string) => {
      if (!global.contributors.includes(user)) {
        throw new Error(`Unknown contributor: "${user}"`)
      }
    })
  })

  global.stateTags.forEach(tag => {
    if (!metadata[tag]) {
      return
    }

    if (!global.tagValues.includes(metadata[tag])) {
      throw new Error(`Unknown tag value: ${metadata[tag]}`)
    }
  })
}
