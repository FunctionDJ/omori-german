import path from "path"
import fs from "fs/promises"
import { makeDirIfNotExist } from "./filesytem"
import { Global } from "../../config/types"

export const loadAndMinifyJson = async (filepath: string) => {
  const object = await loadJson(filepath)
  return JSON.stringify(object)
}

export const writeJsonSafe = async (filepath: string, object: any, pretty?: boolean) => {
  const { dir } = path.parse(filepath)
  await makeDirIfNotExist(dir)
  return writeJson(filepath, object, pretty)
}

export const writeJson = async (filepath: string, object: any, pretty = true) => {
  const content = JSON.stringify(object, null, pretty ? 2 : 0)
  return fs.writeFile(filepath, content)
}

export const loadJson = async (filepath: string) => {
  const content = await fs.readFile(filepath, "utf-8")
  return JSON.parse(content)
}

export const checkJson = async (filepath: string, global: Global) => {
  const data = await loadJson(filepath)

  if (filepath.endsWith("_index.json")) {
    const valid = global.indexValidator(data)
    global.indexStore[filepath] = data

    if (!valid) {
      throw new Error(global.getAjvErrorText())
    }
  } else {
    global.filesNeedIndex.push(filepath)
  }
}

export const validateIndex = (indexStore: Record<string, any>, filesNeedIndex: string[]) => {
  filesNeedIndex.forEach(filepath => {
    const { dir, base } = path.parse(filepath)
    const indexPath = `${dir.replace(/\\/g, "/")}`
    const index = indexStore[indexPath]

    if (!index) {
      throw new Error(`Missing _index.yaml at "${dir}"`)
    }

    if (!index[base]) {
      throw new Error(`File "${filepath}" missing in "${indexPath}"`)
    } else {
      delete index[base]
    }
  })

  // indexes should be empty now unless there are entries of non-existant files
  Object.values(indexStore).forEach(index => {
    const keys = Object.keys(index)

    if (keys.length > 0) {
      const files = keys.map(k => `"${k}"`).join(", ")
      throw new Error(`Non-existant file(s) in _index.yaml: ${files}`)
    }
  })
}
