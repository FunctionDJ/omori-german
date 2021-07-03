import fs from "fs/promises"
import zip from "bestzip"

;(async () => {
  const mod = JSON.parse(await fs.readFile("./mod.json"))

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