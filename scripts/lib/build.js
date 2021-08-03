import { execFile, loadAndMinifyJs } from "./general.js"
import fg from "fast-glob"
import path from "path"
import { loadAndMinifyYaml } from "./yaml.js"
import { loadAndCompressPng } from "./img.js"
import { loadAndMinifyJson } from "./json.js"

/**
 * Gets roots like "img" from the mod.json "files" property,
 * so that when we alter mod.json "files" property, the build process doesn't need any changes
 */
export const getRootsFromFilesProperty = filesProperty => {
  const folderLists = Object.values(filesProperty)
  const roots = folderLists.flatMap(list => (
    list.map(e => e.split("/")[0]) // e.g. "img"
  ))

  return [...new Set(roots)] // unique
}

/**
 * @param {import("archiver").Archiver} archive
 * @param {any} modObject
 * @param {string[]} roots
 * @param {boolean} noCompression
 */
export const fillArchive = async (archive, modObject, roots, noCompression) => {
  archive.append(JSON.stringify(modObject, null, 2), { name: "mod.json" })

  const glob = `(${roots.join("|")})/**`

  const entries = await fg(glob)
  const includes = entries
    .filter(e => !e.endsWith("_index.json"))

  for (const filepath of includes) {
    const { ext } = path.parse(filepath)

    if (noCompression) {
      archive.file(filepath, { name: filepath })
      continue
    }

    const append = async data => {
      archive.append(data, { name: filepath })
    }

    switch (ext.toLowerCase()) {
      case ".js": {
        append(await loadAndMinifyJs(filepath))
        break
      }
      case ".yml": {
        append(await loadAndMinifyYaml(filepath))
        break
      }
      case ".json": {
        append(await loadAndMinifyJson(filepath))
        break
      }
      case ".jsond": {
        append(await loadAndMinifyJson(filepath))
        break
      }
      case ".png": {
        append(await loadAndCompressPng(filepath))
        break
      }
      default: {
        console.log(`${filepath} is being added without any processing`)
        archive.file(filepath, { name: filepath })
      }
    }
  }

  archive.finalize()
}

const getNearestGitTag = async () => {
  const { stdout, stderr } = await execFile("git", [
    "describe",
    "--tags",
    "--abbrev=0"
  ], { encoding: "utf-8" })

  if (stderr.trim()) {
    throw new Error(stderr.trim())
  }

  return stdout.trim()
}

const getNumberFromTag = tag => {
  const result = tag.match(/^v([\d\.]+)$/)
  
  if (!result[1]) {
    throw new Error(`Can't get number from tag: "${tag}"`)
  }

  return result[1]
}

export const getNewModObject = async modObject => ({
  ...modObject,
  version: getNumberFromTag(await getNearestGitTag())
})