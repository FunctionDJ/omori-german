import { execFile as execFileCB } from "child_process"
import { config } from "dotenv"
import { promisify } from "util"
import Ajv from "ajv"
import { loadYamlToJson } from "./yaml"
import { loadJson } from "./json"
import { Config, Global } from "../../config/types"

export const execFile = promisify(execFileCB)

export const loadEnv = () => {
  config({ path: "config/.env" })
}

const getIndexValidator = async (ajv: Ajv) => {
  const indexSchemaJson = await loadJson("generated/index-schema.json")
  return ajv.compile(indexSchemaJson as any)
}

export const getGlobal = async (): Promise<Global> => {
  const rawConfig = await loadYamlToJson<Config>("config/config.yaml")

  const ajv = new Ajv()
  const indexValidator = await getIndexValidator(ajv)

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
