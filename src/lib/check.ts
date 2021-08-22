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
