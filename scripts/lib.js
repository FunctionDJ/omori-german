import fs from "fs/promises"
import { config } from "dotenv"
import { load } from "js-yaml"

export const runMain = async main => {
  let hasErrors = false

  await main(error => {
    console.error(error)
    hasErrors = true
  })

  if (hasErrors) {
    process.exit(1)
  }
}

export const loadId = async () => {
  const modString = await fs.readFile("mod.json", "utf-8")
  return JSON.parse(modString).id
}

export const getYmlFiles = () => fs.readdir("www/languages/en")

export const loadEnv = () => {config()}

export const readYml = filename => (
  fs.readFile(`www/languages/en/${filename}`, "utf-8")
)

export const validateBrokenChars = (filename, content, report, absoluteFilePath) => {
  const lines = content.split("\n")

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    for (const [correct, broken] of Object.entries(brokenUTF8chars)) {
      let lastIndex = null
  
      do {
        const position = lastIndex === null ? 0 : lastIndex + 1
        const searchIndex = line.indexOf(broken, position)
        
        if (searchIndex !== -1) {
          lastIndex = searchIndex
          const link = `www\\languages\\en\\${filename}:${lineIndex + 1}:${searchIndex + 1}`
          report(`${filename}: found ${broken} which should be ${correct}, link:\n  "${link}"`)
        } else {
          lastIndex = null
        }
      } while (lastIndex !== null)
    }
  }
}

export const validateKnown = (filename, filepath, wwwIndex, report) => {
  if (!wwwIndex.includes(filepath)) {
    report(`${filename} is unknown or misspelled (not found in www-index.json)`)
  }
}

export const validateYml = (content, filename, report) => {
  try {
    load(content, { filename })
  } catch (error) {
    report(error.message)
  }
}

export const brokenUTF8chars = {
  "ä": "Ã¤",
  "ö": "Ã¶",
  "ü": "Ã¼",
  "Ä": "Ã",
  "Ö": "Ã",
  "Ü": "Ã",
  "ß": "Ã"
}

export const isKnownFilename = (filename, englishYmls) => (
  englishYmls.includes(filename)
)

export const writeJson = async (name, json) => {
  const jsonString = JSON.stringify(json, null, 2)
  return fs.writeFile(`json/${name}.json`, jsonString)
}

export const loadJson = async name => {
  const content = await fs.readFile(`json/${name}.json`, "utf-8")
  return JSON.parse(content)
}