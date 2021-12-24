import { hasMod } from "../lib"
import { patchCommandHints, patchRenameFile } from "../supported-mods/saveloadplus"

export const patchSaveAndLoad = () => {
  Window_Command.prototype.addCommand = function (name, symbol, enabled = true, ext = null) {
    const newName = {
      SAVE: "SPEICHERN",
      LOAD: "LADEN",
      YES: "JA",
      NO: "NEIN",
  
      // Improved Save & Load mod
      MOVE: "VERSCHIEBEN",
      RENAME: "UMBENENNEN",
      DELETE: "LÖSCHEN"
    }[name] ?? name
  
    this._list.push({ name: newName, symbol, enabled, ext })
  }

  /**
   * @param {string} text
   */
   Window_OmoriFilePrompt.prototype.setPromptText = function (text) {
    const replacedText = text
      .replace("Overwrite this file?", "Diese Datei überschreiben?")
      .replace("Load this file?", "Diese Datei laden?")

      // modhistory mod
      .replace("There aren't any known mods on it!", "Enthält keine bekannten Mods!")
      .replace("You have different mods loaded since last time!", "Du hast andere Mods seit letztem Mal geladen!")

      // Improved Save & Load mod
      .replace("Can you type?", "Kannst du tippen?")
      .replace("Delete this file?", "Diese Datei löschen?")

    this._promptText = replacedText
    this.refresh()
  }

  const getTextArgument = text => {
    if (/FILE \d+:/.test(text)) {
      const fileId = text.match(/FILE (\d+):/)[1]
      return `DATEI ${fileId}:`
    }

    const map = {
      "LOCATION:": "ORT:",
      "TOTAL PLAYTIME:": "GESAMTE SPIELZEIT:",

      // Improved Save & Load Mod
      "PLAYTIME:": "SPIELZEIT",

      // OneLoader
      "MANAGE MODS": "MODS VERWALTEN",
      DECRYPT: "ENTSCHLÜSSELN",
      OPTIONS: "OPTIONEN",

      ENABLE: "AN",
      DISABLE: "AUS",

      "Decryption mode": "Entschlüssel-Modus",
      EVERYTHING: "ALLES",
      "BASE GAME": "BASIS SPIEL",
      "ONLY MODS": "NUR MODS",
      "What should be decrypted?": "Was soll entschlüsselt werden?",

      "Generate as RpgMaker project?": "Als RpgMaker Projekt genieren?",
      "Should changes needed to open in RpgMaker be made?": "Sollen für RpgMaker erforderliche Änderungen gemacht werden?",

      "Start decryption": "Entschlüsseln starten",
      "CLICK HERE TO START": "KLICKE HIER UM ZU STARTEN",
      "Confirm your settings before starting. It takes a while!": "Überprüfe deine Einstellungen vor dem Start. Es dauert eine Weile!",

      "General OneLoader options": "Allgemeine OneLoader Optionen",

      "Automatic updating": "Automatisches Updaten",
      "Should OneLoader automatically update?": "Soll sich OneLoader automatisch updaten?",
      ALLOW: "ERLAUBEN",
      DENY: "VERBIETEN",

      "Reset priorities": "Prioritäten zurücksetzen",
      "CLICK HERE TO RESET PRIORITIES": "KLICK HIER, UM PRIORITÄTEN ZURÜCKZUSETZEN",
      "Reset preferences for delta patching and asset priority": "Setze Präferenzen für Delta Patching und Asset Priorisierung zurück",

      "Restart Game": "Spiel neustarten",
      "CLICK HERE TO RESTART THE GAME": "KLICK HIER, UM DAS SPIEL NEU ZU STARTEN",
      "Restart the game (NOTE: May increase memory usage, old assets aren't cleared)": "Starte das Spiel neu (WICHTIG: Kann RAM-Verbrauch steigern, alte Assets werden nicht bereinigt)",

      "[DEBUG] Kill VFS": "[DEBUG] Kille VFS",
      "CLICK HERE TO KILL VFS": "KLICKE HIER, UM VFS ZU KILLEN",
      "DO NOT DO THIS UNLESS ASKED TO BY ONELOADER DEVELOPERS!": "TU DAS NICHT, AUßER DU WIRST VON ONELOADER DEVS DARUM GEBETEN!"
    }

    return map[text] ?? text
  }

  const { drawText } = Bitmap.prototype
  Bitmap.prototype.drawText = function (text, ...rest) {
    drawText.bind(this)(getTextArgument(text), ...rest)
  }

  if (hasMod("saveloadplus")) {
    patchCommandHints()
    patchRenameFile()

    // squish to fit save menu text
    Window_OmoriFileCommand.prototype.drawItem = function (index) {
      const rect = this.itemRectForText(index)
      const align = this.itemTextAlign()
      this.resetTextColor()
      this.changePaintOpacity(this.isCommandEnabled(index))
      this.drawText(this.commandName(index), rect.x, rect.y, 75, align)
    }
  } else {
    // squish to fit save menu text
    Window_OmoriFileCommand.prototype.drawItem = function (index) {
      const rect = this.itemRectForText(index)
      const align = this.itemTextAlign()
      this.resetTextColor()
      this.changePaintOpacity(this.isCommandEnabled(index))
      this.drawText(this.commandName(index), rect.x, rect.y, 60, align)
    }
  }
}
