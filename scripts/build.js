import fs from "fs/promises"
import zip from "bestzip"

const modString = await fs.readFile("./mod.json")
const { id } = JSON.parse(modString)

await zip({
  source: [
    "mod.json",
    "www/"
  ],
  destination: `./${id}.zip`
})