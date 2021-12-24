import { check } from "./lib/action-map"
import { getAllModFiles, getRootsFromFilesProperty } from "./lib/build"
import { getPatchCategory, runMain } from "./lib/check"
import { getGlobal } from "./lib/general"
import { loadJson, validateIndex } from "./lib/json"
import { Mod } from "./types"
import path from "path"

const patchMap: Record<keyof Mod["files"], string|false> = {
  text: "languages/en",
  plugins: "js/plugins",
  assets: false,
  data: "data"
}

runMain(async (report: (error: Error) => void) => {
  const modPromise = loadJson<Mod>("mod.json")

  console.info("Preparing...")

  const [
    global,
    originalGameFiles,
    modObject,
    allModFiles
  ] = await Promise.all([
    getGlobal(),
    loadJson<string[]>("generated/www-index.json"),
    modPromise,
    modPromise.then(mod => getAllModFiles(mod.files))
  ])

  const actualAllModFiles = allModFiles.filter(filepath => !global.omitFiles.includes(filepath))

  const allAllowedFiles = [...originalGameFiles, ...global.extraFiles]

  console.info("Checking for unknown files...")

  actualAllModFiles.forEach(filepath => {
    if (filepath.endsWith("_index.yaml")) {
      return
    }

    const patchCategory = getPatchCategory(filepath, modObject.files)

    const patchDir = patchMap[patchCategory]

    const fileInfo = path.parse(filepath)

    const patchLocation = patchDir
      ? [patchDir, fileInfo.base].join("/")
      : filepath // "assets" / root / www

    const actualPatchLocation = fileInfo.ext === ".jsond" ? patchLocation.replace(".jsond", ".json") : patchLocation

    if (!allAllowedFiles.includes(actualPatchLocation)) {
      throw new Error(`Unknown or unallowed file: "${filepath}" (patched to "${patchLocation}")`)
    }
  })

  console.info("Checking files...")

  try {
    await Promise.all(actualAllModFiles.map(f => check(f, global)))
    validateIndex(global.indexStore, global.filesNeedIndex)
  } catch (error: any) {
    report(error)
  }
})
