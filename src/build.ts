import archiver from "archiver"
import { program } from "commander"
import { fillArchive, getNearestGitTag, getNewModObject, getRootsFromFilesProperty } from "./lib/build"
import { createWriteStream } from "fs"
import { verifyUp } from "./lib/maintenance"
import { resolve } from "path"
import { makeDirIfNotExist, rmSafe } from "./lib/filesytem"
import { loadJson } from "./lib/json"

(async () => {
  await verifyUp()
  
  program
    .argument("[output-dir]", "Output directory", "build")
    .option(
      "-g, --git-tag <tag>",
      "Overwrite Git tag to be used (e.g. GitHub Actions). Will try to run Git CLI otherwise."
    )
    .option(
      "-n, --no-compression",
      "Don't compress files with individual compression methods before zipping (fast but bigger)."
    )
    .parse()
  
  const options = program.opts()
  const [destDir] = program.processedArgs
  
  const tag = options.gitTag ?? await getNearestGitTag()
  
  const modObject = await loadJson("mod.json")
  
  const newModObject = await getNewModObject(modObject, tag)
  
  // create dir
  
  const destination = resolve(destDir, `${newModObject.id}-${tag}.zip`)
  
  await makeDirIfNotExist(destDir)
  
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
  
  fillArchive(archive, newModObject, noCompression)
})()
