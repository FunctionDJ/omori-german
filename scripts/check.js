import path from "path"
import { runMain, validateKnown } from "./lib/check.js"
import { loadJson } from "./lib/json.js"
import { getYmlFiles, readYml, validateBrokenChars, validateYml } from "./lib/yaml.js"

runMain(async report => {
  const ymlFiles = await getYmlFiles()
  const wwwIndex = await loadJson("json/www-index.json")
  const { externalMods } = await loadJson("json/www-extra.json")

  const externalModsFiles = Object.values(externalMods).flat()

  const allowedFiles = [
    ...wwwIndex,
    ...externalModsFiles
  ]

  for (const filename of ymlFiles) {
    const filepath = `languages/en/${filename}`
  
    validateKnown(filename, filepath, allowedFiles, report)
  
    const content = await readYml(filename)

    validateYml(content, filename, report)
  
    const absoluteFilePath = path.resolve(`www/languages/en/${filename}`)

    validateBrokenChars(filename, content, report, absoluteFilePath)
  }
})