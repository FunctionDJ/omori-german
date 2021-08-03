import { execFile as execFileCB } from "child_process"
import { config } from "dotenv"
import { promisify } from "util"
import { minify } from "terser"
import fs from "fs/promises"

export const execFile = promisify(execFileCB)

export const loadEnv = () => {config()}

export const loadAndMinifyJs = async filepath => {
  const content = await fs.readFile(filepath, "utf-8")
  const result = await minify(content)
  return result.code
}

export const exists = async pathlike => {
  try {
    await fs.access(pathlike)
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
    return false
  }
  return true
}

const activeName = "mod.json"
const downName = "mod.down.json"

const down = async () => {
  const modJsonString = await fs.readFile("mod.json", "utf-8")
  const modJson = JSON.parse(modJsonString)
  
  const downModJson = {
    ...modJson,
    id: modJson.id + "-down",
    description: "Deactivated",
    files: {} // this is the important part
  }

  return Promise.all([
    fs.writeFile(downName, modJsonString),
    fs.writeFile(activeName, JSON.stringify(downModJson))
  ])
}

const up = async () => {
  await fs.rm(activeName)
  await fs.rename(downName, activeName)
}

const isDown = async () => exists(downName)

export const toggle = async () => {
  if (await isDown()) {
    await up()
    console.info("mod is now activated")
  } else {
    await down()
    console.warn("mod is now deactivated")
  }
}

export const verifyUp = async () => {
  if (await isDown()) {
    throw new Error("mod is down, can't do stuff. to toggle status, run 'npm run toggle'")
  }
}

export const rmSafe = async pathlike => {
  try {
    await fs.rm(pathlike)
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }
}