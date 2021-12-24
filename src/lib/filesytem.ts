import fs from "fs/promises"

export const exists = async (pathlike: string) => {
  try {
    await fs.access(pathlike)
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error
    }
    return false
  }
  return true
}

export const makeDirIfNotExist = async (dir: string) => {
  try {
    await fs.access(dir)
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dir)
    } else {
      throw error
    }
  }
}

export const rmSafe = async (pathlike: string) => {
  try {
    await fs.rm(pathlike)
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }
}
