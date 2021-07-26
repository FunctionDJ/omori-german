import {
  getYmlFiles, hasCorrectExtension, readYml
} from "./lib.js"

import yaml from "js-yaml"

const ymlFiles = await getYmlFiles()

let hasErrors = false

const report = error => {
  console.error(error)
  hasErrors = true
}

for (const filename of ymlFiles) {
  if (!hasCorrectExtension(filename)) {
    report(`${filename} has wrong extension`)
  }

  const content = await readYml(filename)

  try {
    yaml.load(content, { filename })
  } catch (error) {
    report(error.message)
  }
}

if (hasErrors) {
  process.exit(1)
}