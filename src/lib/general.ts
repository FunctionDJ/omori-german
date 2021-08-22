import { execFile as execFileCB } from "child_process"
import { config } from "dotenv"
import { promisify } from "util"
import fg from "fast-glob"
import Ajv from "ajv"
import { loadYamlToJson } from "./yaml"
import { loadJson } from "./json"
import { Config, Global } from "../../config/types"

export const execFile = promisify(execFileCB)

export const loadEnv = () => {
  config({ path: "config/.env" })
}

export const getAllModFiles = async (roots: string[]) => {
  const glob = `(${roots.join("|")})/**`
  return await fg(glob)
}

const getIndexValidator = async (ajv: Ajv, contributorsIndex: Record<string, string>) => {
  const indexSchemaJson = await loadJson("generated/index-schema.json")
  return ajv.compile(indexSchemaJson)
}

export const getGlobal = async (): Promise<Global> => {
  const rawConfig = await loadYamlToJson<Config>("config/config.yaml")

  const ajv = new Ajv()
  const indexValidator = await getIndexValidator(ajv, rawConfig.contributorsIndex)

  const contributors = Object.keys(rawConfig.contributorsIndex)

  return {
    ...rawConfig,
    validTags: [
      ...rawConfig.userTags,
      ...rawConfig.stateTags,
      ...rawConfig.additionalTags
    ],
    contributors,
    indexValidator,
    getAjvErrorText () {
      return ajv.errorsText(indexValidator.errors)
    },
    indexStore: {},
    filesNeedIndex: []
  }
}
