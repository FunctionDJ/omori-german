import { loadJson } from "./lib/json.js"
import { fillArchive, getNewModObject, getRootsFromFilesProperty } from "./lib/build.js"
import archiver from "archiver"
import { createWriteStream } from "fs"
import { rmSafe, verifyUp } from "./lib/general.js"
import { program } from "commander/esm.mjs"

await verifyUp()

program
  .option(
    "-g, --git-tag <tag>",
    "overwrite git tag to be used (e.g. github actions). will try to run git cli otherwise."
  )
  .option(
    "-n, --no-compression",
    "dont compress files with individual compression methods before zipping (fast but bigger)"
  )
  .parse()

const options = program.opts()
const overwriteTag = options.gitTag ?? null

const newModObject = await getNewModObject(
  await loadJson("mod.json"),
  overwriteTag
)

const roots = getRootsFromFilesProperty(newModObject.files)
const destination = `./${newModObject.id}.zip`

await rmSafe(destination) // had issues with the zip not updating unless removed beforehand

const archive = archiver("zip", {
  zlib: { level: 9 }
})

const output = createWriteStream(destination)

output.on("close", () => {
  console.info(`ZIP created at ${destination}`)
})

archive.pipe(output)

const noCompression = !options.compression

if (noCompression) {
  console.warn("--no-compression passed")
}

fillArchive(archive, newModObject, roots, noCompression)