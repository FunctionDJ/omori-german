import { load, dump } from "js-yaml"
import fs from "fs/promises"
import path from "path"

export const loadYamlToJson = async <T>(filepath: string): Promise<T> => {
  const content = await fs.readFile(filepath, "utf-8")
  return load(content, { filename: filepath }) as T
}

export const loadAndMinifyYaml = async (filepath: string) => {
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
