export const validateBrokenChars = (filename: string, content: string, bannedStringsInYaml: Record<string, string>) => {
  const lines = content.split("\n")

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    for (const [correct, broken] of Object.entries(bannedStringsInYaml)) {
      /** @type {number} */
      let lastIndex = null

      do {
        const position = lastIndex === null ? 0 : lastIndex + 1
        const searchIndex = line.indexOf(broken, position)

        if (searchIndex !== -1) {
          lastIndex = searchIndex
          const link = `yml\\${filename}:${lineIndex + 1}:${searchIndex + 1}`
          throw new Error(`${filename}: found ${broken} which should be ${correct}, link:\n  "${link}"`)
        } else {
          lastIndex = null
        }
      } while (lastIndex !== null)
    }
  }
}
