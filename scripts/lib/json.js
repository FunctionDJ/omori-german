import path from "path"
import fs from "fs/promises"

const makeDirIfNotExist = async dir => {
  try {
    await fs.access(dir)
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dir)
    } else {
      throw error
    }
  }
}

export const loadAndMinifyJson = async filepath => {
  const object = await loadJson(filepath)
  return JSON.stringify(object)
}

export const writeJsonSafe = async (filepath, object) => {
  const { dir } = path.parse(filepath)
  await makeDirIfNotExist(dir)
  return writeJson(filepath, object)
}

export const writeJson = async (filepath, object) => {
  const content = JSON.stringify(object, null, 2)
  return fs.writeFile(filepath, content)
}

export const loadJson = async filepath => {
  const content = await fs.readFile(filepath, "utf-8")
  return JSON.parse(content)
}