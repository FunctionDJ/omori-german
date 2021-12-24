import fs from "fs/promises"
import { checkMetadata, getMetadata } from "./metadata"
import { validateBrokenChars } from "./text"
import { parse } from "acorn"
import { minify } from "terser"
import { Global } from "../../config/types"
import { BuildFunction } from "../types"

export const checkJs = async (filepath: string, global: Global) => {
  const stringContent = await fs.readFile(filepath, "utf-8")

  parse(stringContent, {
    ecmaVersion: 2018,
    sourceType: "script"
  })

  validateBrokenChars(filepath, stringContent, global.bannedStringsInYaml)

  if (global.noMetadataCheckFiles.includes(filepath)) {
    return
  }

  const metadata = getMetadata(stringContent, global, "// ")

  checkMetadata(metadata, global)
}

export const loadAndMinifyJs: BuildFunction = async (filepath) => {
  const content = await fs.readFile(filepath, "utf-8")
  const result = await minify(content)

  if (!result.code) {
    throw new Error(`Empty JS minify output for "${filepath}"`)
  }

  return result.code
}
