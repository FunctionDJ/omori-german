import fs from "fs/promises"
import path from "path"
import yaml from "js-yaml"

const filenames = await fs.readdir("yml", "utf8")
const faulty = []

for (const filename of filenames) {
  const content = await fs.readFile(path.resolve("yml", filename), "utf8")

  try {
    yaml.load(content)
  } catch {
    faulty.push(filename)
    console.log(filename + " is invalid yml")
  }

}

if (faulty.length) {
  await fs.writeFile("./faulty.txt", faulty.join("\n"))
  console.log("written invalid files to ./faulty.txt")
} else {
  console.log("all files are valid json :)")
}