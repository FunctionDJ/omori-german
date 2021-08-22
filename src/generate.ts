// This script generates all "generated-" files

import path from "path"
import fg from "fast-glob"
import { loadJson, writeJson, writeJsonSafe } from "./lib/json"
import { loadYamlToJson } from "./lib/yaml"
import { getGlobal, loadEnv } from "./lib/general"
import { Config } from "../config/types"

loadEnv()

const generateIndexSchema = async (contributorIds: string[]) => {
  const schema = await loadJson("config/index-schema-template.json")
  schema.$defs.contributors.items.enum = contributorIds
  writeJson("generated/index-schema.json", schema, true)
}

const generateSnippets = async (
  tagValues: string[],
  contributorsIds: string[]
) => {
  writeJson(".vscode/snippets.code-snippets", {
    Metadata: {
      scope: "yaml",
      prefix: "tr",
      body: [
        `#### Translation: $\{1|${tagValues.join(",")}|\}`,
        `#### Translated by: $\{2|${contributorsIds.join(",")}|\}`
      ]
    }
  })
}

/**
 * //TODO
 */
const generateWwwIndex = async () => {
  if (!process.env.WWW_DECRYPT_DIR) {
    throw new Error("can't generate www-index, no path specified in .env")
  }

  const decryptDir = path.resolve(
    process.env.WWW_DECRYPT_DIR
  )

  const entries = await fg("**", {
    cwd: decryptDir
  })

  writeJson("config/generated-www-index.json", entries)
}

generateWwwIndex()

;(async () => {
  const { contributorsIndex } = await loadYamlToJson<Config>("config/config.yaml")
  const contributorIds = Object.keys(contributorsIndex)
  
  generateIndexSchema(contributorIds)

  const { tagValues } = await getGlobal()
  generateSnippets(tagValues, contributorIds)
})()
