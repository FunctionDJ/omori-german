import { GoogleSpreadsheet } from "google-spreadsheet"
// import { getCredits } from "../lib/get-credits"
import { loadEnv } from "../lib/general.js"

(async () => {
  loadEnv()
  
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID)
  
  doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!
  })
  
  await doc.loadInfo()
})()

// const sheet = doc.sheetsByIndex[0]

// const credits = await getCredits()

// await sheet.clear()

// await sheet.setHeaderRow(["Dateiname", "Übersetzungs-Status", "Editing-Status", "Übersetzer/in", "Editor/in"])

// await sheet.addRows(
//   credits.map(c => ({
//     "Dateiname": c.Filename,
//     "Übersetzungs-Status": c.Translation ?? "",
//     "Editing-Status": c.Editing ?? "",
//     "Übersetzer/in": c["Translated by"]?.join(", ") ?? "",
//     "Editor/in": [
//       ...(c["Corrections by"] ?? []),
//       ...(c["Checked by"] ?? []),
//     ].join(", ")
//   }))
// )
