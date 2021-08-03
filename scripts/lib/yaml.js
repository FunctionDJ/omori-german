import { load, dump } from "js-yaml"
import fs from "fs/promises"
import path from "path"

const brokenUTF8chars = {
  "ä": "Ã¤",
  "ö": "Ã¶",
  "ü": "Ã¼",
  "Ä": "Ã",
  "Ö": "Ã",
  "Ü": "Ã",
  "ß": "Ã"
}

export const readYml = filename => (
  fs.readFile(`yml/${filename}`, "utf-8")
)

export const loadAndMinifyYaml = async filepath => {
  const yamlString = await fs.readFile(filepath, "utf-8")
  const filename = path.parse(filepath).base

  const object = load(yamlString, { filename })

  const result = dump(object, {
    condenseFlow: true,
    indent: 0,
    lineWidth: 1000,
    noCompatMode: true,
    noArrayIndent: true,
    flowLevel: 0
  })

  if (!result.trim()) {
    console.log(filepath, "is it, chief")
    process.exit()
  }

  return result
}

export const getYmlFiles = () => fs.readdir("yml")

export const validateYml = (content, filename, report) => {
  try {
    load(content, { filename })
  } catch (error) {
    report(error.message)
  }
}

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
          const link = `yml\\${filename}:${lineIndex + 1}:${searchIndex + 1}`
          report(`${filename}: found ${broken} which should be ${correct}, link:\n  "${link}"`)
        } else {
          lastIndex = null
        }
      } while (lastIndex !== null)
    }
  }
}