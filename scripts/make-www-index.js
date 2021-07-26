import fg from "fast-glob"
import path from "path"
import { loadEnv, writeJson } from "./lib.js"

loadEnv()

const decryptDir = path.resolve(
  process.env.WWW_DECRYPT_DIR
)

const entries = await fg("**", {
  cwd: decryptDir
})

await writeJson("www-index", entries)