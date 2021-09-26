import fs from "fs/promises"
import path from "path"

export const getCredits = async () => {
  const filenames = await fs.readdir("yml", "utf8")
  
  const files = []
  
  const userTags = ["Translated by", "Read by", "Checked by", "Corrections by"]
  const validTags = [...userTags, "Translation", "Editing", "Comment"]
  
  for (const filename of filenames) {
    const content = await fs.readFile(path.resolve("yml", filename), "utf8")
  
    const metadata = content
      .split("\n")
      .filter(l => l.startsWith("###"))
      .map(l => l.trim())
      .map(l => {
        const result = /^### (.*): (.*)$/.exec(l)
        
        if (result === null) {
          throw new Error(`this line doesn't match:\n${JSON.stringify(l)}\nfile: ${filename}`)
        }
  
        let [, type, value] = result
        
        if (!validTags.includes(type)) {
          throw new Error(`unknown type ${type} in ${filename}`)
        }
  
        if (userTags.includes(type)) {
          value = value.split(",").map(u => u.trim())
        }
  
        return { type, value }
      })
      .reduce((prev, { type, value }) => ({
        ...prev,
        [type]: value
      }), {})
  
    files.push({ Filename: filename, ...metadata })
  }

  return files
}