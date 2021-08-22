/**
 * using the functions in this file, you can disable the mod without opening OMORI.
 * this is useful when trying out the built ZIP file, or when debugging.
 * the disabling is achieved not by modifying OneLoader config (since that would also disable loading the ZIP)
 * and instead the down() function makes a backup of mod.json and configures it to not load anything.
 */

import { exists } from "./filesytem"
import fs from "fs/promises"

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
