import { Mod } from "../types"

export const runMain = async (main: Function) => {
  let hasErrors = false

  await main((error: Error) => {
    console.error(error)
    hasErrors = true
  })

  if (hasErrors) {
    process.exit(1)
  }
}

export const validateKnown = (filename: string, filepath: string, allowedFiles: string[], report: (error: Error|string) => void) => {
  if (!allowedFiles.includes(filepath)) {
    report(`${filename} is unknown or misspelled (not found in www-index.json)`)
  }
}

export const isKnownFilename = (filename: string, englishYmls: string[]) => (
  englishYmls.includes(filename)
)

export const getPatchCategory = (
  filepath: string,
  filesProperty: Mod["files"]
): keyof Mod["files"] => {
  const categories = Object.keys(filesProperty) as unknown as (keyof Mod["files"])[] // why, TypeScript, why

  const foundCategory = categories.find(category => {
    const dirs = filesProperty[category]!
    return dirs.some(dir => filepath.startsWith(dir))
  })

  if (!foundCategory) {
    throw new Error(`No patch category found for "${filepath}" in "./mod.json". Maybe you forgot to add it's directory to the list?`)
  }

  return foundCategory
}