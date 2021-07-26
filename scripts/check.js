import {
  getYmlFiles, loadJson, readYml, runMain, validateBrokenChars, validateKnown, validateYml
} from "./lib.js"
import path from "path"

runMain(async report => {
  const ymlFiles = await getYmlFiles()
  const wwwIndex = await loadJson("www-index")

  for (const filename of ymlFiles) {
    const filepath = `languages/en/${filename}`
  
    validateKnown(filename, filepath, wwwIndex, report)
  
    const content = await readYml(filename)

    validateYml(content, filename, report)
  
    const absoluteFilePath = path.resolve(`www/languages/en/${filename}`)

    validateBrokenChars(filename, content, report, absoluteFilePath)
  }
})