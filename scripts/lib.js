import yaml from "js-yaml"
import fs from "fs/promises"
import { config } from "dotenv"

export const getYmlFiles = () => fs.readdir("yml", "utf8")

export const loadEnv = () => {config()}

export const readYml = filename => (
  fs.readFile(`yml/${filename}`, "utf-8")
)

export const loadEnglishYmls = async () => {
  
}

export const hasCorrectExtension = filename => (
  filename.endsWith(".yml")
)

export const isKnownFilename = (filename, englishYmls) => (
  englishYmls.includes(filename)
)

export const writeJson = async (filename, json) => {
  const jsonString = JSON.stringify(json, null, 2)
  return fs.writeFile(`json/${filename}.json`, jsonString)
}

export const loadJson = async filename => {
  const content = await fs.readFile(`json/${filename}.json`, "utf-8")
  return JSON.parse(content)
}