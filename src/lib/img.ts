import sharp from "sharp"
import { BuildFunction } from "../types"
import fs from "fs/promises"

export const loadAndCompressPng: BuildFunction = async (filepath, global) => {
  const buffer = await fs.readFile(filepath)

  return sharp(buffer)
    .png({
      compressionLevel: 9,
      quality: 90,
      palette: true
    })
    .toBuffer()
}
