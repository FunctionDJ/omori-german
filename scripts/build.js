import { promises as fs } from "fs"
import zip from "bestzip"

;(async () => {
  const mod = await fs.readFile("./mod.json").then(JSON.parse)

  const includes = Object.values(mod.files).flat()

  console.log("Zipping...")

  await zip({
    source: [
      "mod.json",
      ...includes
    ],
    destination: "./omori_de.zip"
  })

  console.info("Wrote to omori_de.zip")
})()