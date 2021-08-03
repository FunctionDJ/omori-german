import { loadJson } from "./lib/json.js"
import { fillArchive, getNewModObject, getRootsFromFilesProperty } from "./lib/build.js"
import archiver from "archiver"
import { createWriteStream } from "fs"
import { verifyUp } from "./lib/general.js"
import { rm } from "fs/promises"

await verifyUp()

const newModObject = await getNewModObject(
  await loadJson("mod.json")
)

const roots = getRootsFromFilesProperty(newModObject.files)
const destination = `./${newModObject.id}.zip`

await rm(destination) // had issues with the zip not updating unless removed beforehand

const archive = archiver("zip", {
  zlib: { level: 9 }
})

const output = createWriteStream(destination)

output.on("close", () => {
  console.info(`ZIP created at ${destination}`)
})

archive.pipe(output)

const noCompression = process.argv.includes("--no-compression")

if (noCompression) {
  console.warn("--no-compression passed")
}

fillArchive(archive, newModObject, roots, noCompression)