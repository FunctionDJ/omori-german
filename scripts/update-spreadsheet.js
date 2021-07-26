import { GoogleSpreadsheet } from "google-spreadsheet"
import fs from "fs/promises"
import { getCredits } from "./lib/get-credits.js"
import axios from "axios"
import { loadEnv } from "./lib"

loadEnv()

const credsString = await fs.readFile("./spreadsheet-credentials.json", "utf-8")
const creds = JSON.parse(credsString)

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID)
doc.useServiceAccountAuth(creds)
await doc.loadInfo()

const sheet = doc.sheetsByIndex[0]

const credits = await getCredits()

axios.post(
  `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SPREADSHEET_ID}`,
  {
    requests: [
      
    ]
  }
)


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