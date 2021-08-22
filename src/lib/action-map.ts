import { Archiver } from "archiver"
import path from "path"
import { Global, Index } from "../../config/types"
import { ActionMapping } from "../types"
import { loadAndCompressPng } from "./img"
import { checkJs, loadAndMinifyJs } from "./js"
import { loadAndMinifyJson, loadJson } from "./json"
import { validateBrokenChars } from "./text"
import { loadAndMinifyYaml } from "./yaml"
import fs from "fs/promises"
import { load } from "js-yaml"
import { checkMetadata, getMetadata } from "./metadata"

const actionMap: Record<string, ActionMapping> = {
  ttf: {
    build: null,
    check: null
  },
  js: {
    build: loadAndMinifyJs,
    check: checkJs
  },
  yaml: {
    build: loadAndMinifyYaml,
    check: async (filepath, global) => {
      // we do most stuff in here because then we have the data on hand for indexStore
      // so no need to load twice, a bit ugly but yea

      const stringContent = await fs.readFile(filepath, "utf-8")
      validateBrokenChars(filepath, stringContent, global.bannedStringsInYaml)

      // will throw on invalid
      const json = load(stringContent, { filename: filepath })

      const { name, dir } = path.parse(filepath)

      if (name === "_index") {
        global.indexStore[dir] = json as Index
      } else {
        const metadata = getMetadata(stringContent, global)
        checkMetadata(metadata, global)
      }
    }
  },
  json: {
    build: loadAndMinifyJson,
    check: loadJson,
    needExternalIndex: true
  },
  jsond: {
    build: loadAndMinifyJson,
    check: loadJson,
    needExternalIndex: true
  },
  png: {
    build: loadAndCompressPng,
    check: null,
    needExternalIndex: true
  }
}

const getEntry = (filepath: string): ActionMapping => {
  const { ext } = path.parse(filepath)
  const key = ext.toLowerCase().slice(1)

  if (!(key in actionMap)) {
    throw new Error(`Unconfigured file type: ${filepath}`)
  }
  
  return actionMap[key]
}

const runAndAttachFilePathToError = async (fn: Function, filepath: string, ...args: any[]) => {
  try {
    return await fn(filepath, ...args)
  } catch (error) {
    console.error(`Error: ${error.message}\nFile: ${filepath}`)
    process.exit(1)
  }
}
export const buildAndAttach = async (archive: Archiver, filepath: string, global: Global) => {
  const entry = getEntry(filepath)

  if (!entry.build) {
    archive.file(filepath, { name: filepath })
    return
  }

  const data = await runAndAttachFilePathToError(entry.build, filepath)
  archive.append(data, { name: filepath })
}

export const check = (filepath: string, global: Global): Promise<any>|void => {
  const entry = getEntry(filepath)

  if (entry.needExternalIndex) {
    global.filesNeedIndex.push(filepath)
  }

  if (entry.check === null) {
    return
  }

  return runAndAttachFilePathToError(entry.check, filepath, global)
}
