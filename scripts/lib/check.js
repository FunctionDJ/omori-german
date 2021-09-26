export const runMain = async main => {
  let hasErrors = false

  await main(error => {
    console.error(error)
    hasErrors = true
  })

  if (hasErrors) {
    process.exit(1)
  }
}

export const validateKnown = (filename, filepath, allowedFiles, report) => {
  if (!allowedFiles.includes(filepath)) {
    report(`${filename} is unknown or misspelled (not found in www-index.json)`)
  }
}

export const isKnownFilename = (filename, englishYmls) => (
  englishYmls.includes(filename)
)