import { execFile, getAllModFiles, getGlobal } from "./general"
import { buildAndAttach } from "./action-map"
import { Archiver } from "archiver"
import { Global } from "../../config/types"

/**
 * Gets roots like "img" from the mod.json "files" property,
 * so that when we alter mod.json "files" property, the build process doesn't need any changes
 */
export const getRootsFromFilesProperty = (filesProperty: Record<string, string[]>) => {
  const folderLists = Object.values(filesProperty)
  const roots = folderLists.flatMap(list => (
    list.map(e => e.split("/")[0]) // e.g. "img"
  ))

  return [...new Set(roots)] // unique
}

export const fillArchive = async (
  archive: Archiver,
  modObject: any,
  roots: string[],
  noCompression = false
) => {
  archive.append(JSON.stringify(modObject, null, 2), { name: "mod.json" })

  const includes = (await getAllModFiles(roots))
    .filter(e => !e.endsWith("_index.json"))

  const global = await getGlobal()

  for (const filepath of includes) {
    if (noCompression) {
      archive.file(filepath, { name: filepath })
      continue
    }

    await buildAndAttach(archive, filepath, global)
  }

  archive.finalize()
}

export const getNearestGitTag = async () => {
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

const getNumberFromTag = (tag: string) => {
  const result = tag.match(/^v?([\d.]+)$/)

  if (!result) {
    throw new Error(`Unable to match tag "${tag}"`)
  }

  if (!result[1]) {
    throw new Error(`Can't get number from tag: "${tag}"`)
  }

  return result[1]
}

export const getNewModObject = async (modObject: any, tag: string) => ({
  ...modObject,
  version: getNumberFromTag(tag)
})
