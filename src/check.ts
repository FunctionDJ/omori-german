import { check } from "./lib/action-map"
import { getRootsFromFilesProperty } from "./lib/build"
import { runMain } from "./lib/check"
import { getAllModFiles, getGlobal } from "./lib/general"
import { loadJson, validateIndex } from "./lib/json"

runMain(async (report: (error: Error) => void) => {
  const { files } = await loadJson("mod.json")
  const roots = getRootsFromFilesProperty(files)

  const allModFiles = await getAllModFiles(roots)
  const global = await getGlobal()

  try {
    await Promise.all(allModFiles.map(f => check(f, global)))
    validateIndex(global.indexStore, global.filesNeedIndex)
  } catch (error) {
    report(error)
  }
})
