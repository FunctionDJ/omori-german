// #### Translation: Partial

// #### Translated by: function

let old_omoFile_showPromptWindow = Scene_OmoriFile.prototype.showPromptWindow
Scene_OmoriFile.prototype.showPromptWindow = function(promptText) {
  let new_promptText = ""
  switch (promptText) {
    case "Overwrite this file?":
      new_promptText = "Diese Datei überschreiben?";
      break;
    case "Load this file?":
      new_promptText = "Diese Datei laden?";
      break;
    default:
      new_promptText = promptText;
  }
  old_omoFile_showPromptWindow.call(this, new_promptText)
}
/*
const p = new Proxy(target, {
  apply: function(target, thisArg, argumentsList) {
  }
});
*/
let old_omoFileInfo_createContents = Window_OmoriFileInformation.prototype.createContents;
Window_OmoriFileInformation.prototype.createContents = function() {
  old_omoFileInfo_createContents.call(this)
  this.contents.drawText = new Proxy(this.contents.drawText, {
    apply: function(target, thisArg, argumentsList) {
      let new_argsList = [...argumentsList]
      switch (argumentsList[0]) {
        case "TOTAL PLAYTIME:":
          new_argsList[0] = "GESAMTE SPIELZEIT:";
          break;
        case "LOCATION:":
          new_argsList[0] = "ORT:";
          break;
        default:
          let fIRE = /^FILE (\d+):$/;
          let fIndexMatch = fIRE.exec(argumentsList[0])
          if (fIndexMatch) {
            new_argsList[0] = `DATEI ${fIndexMatch[1]}:`
            new_argsList[1] = 25
          }
      }
      return target.call(thisArg, ...new_argsList);
    }
  });
}

let old_omoFC_addCommand = Window_OmoriFileCommand.prototype.addCommand;
Window_OmoriFileCommand.prototype.addCommand = function (name, symbol, enabled, ext) {
  let new_name = ""
  switch (name) {
    case "SAVE":
      new_name = "SPEICHERN";
      break;
    case "LOAD":
      new_name = "LADEN";
      break;
    default:
      new_name = name
  }
  old_omoFC_addCommand.call(this, new_name, symbol, enabled, ext)
};
let old_omoFP_addCommand = Window_OmoriFileCommand.prototype.addCommand;
Window_OmoriFilePrompt.prototype.addCommand = function(name, symbol, enabled, ext) {
  let new_name = ""
  switch (name) {
    case "YES":
      new_name = "JA";
      break;
    case "NO":
      new_name = "NEIN";
      break;
    default:
      new_name = name
  }
  old_omoFP_addCommand.call(this, new_name, symbol, enabled, ext)
};

// OMORI SAVE LOAD PLUS COMPAT

if (typeof Window_OmoriFileStats !== undefined) {
  let old_SLP_createContents = Window_OmoriFileStats.prototype.createContents;
  Window_OmoriFileStats.prototype.createContents = function() {
    old_SLP_createContents.call(this)
    this.contents.drawText = new Proxy(this.contents.drawText, {
      apply: function(target, thisArg, argumentsList) {
        let new_argsList = [...argumentsList]
        switch (argumentsList[0]) {
          case "PLAYTIME:":
            new_argsList[0] = "GESAMTE SPIELZEIT:";
            break;
          case "LOCATION:":
            new_argsList[0] = "ORT:";
            break;
          default:
            let fIRE = /^FILE (\d+):$/;
            let fIndexMatch = fIRE.exec(argumentsList[0])
            if (fIndexMatch) {
              new_argsList[0] = `DATEI ${fIndexMatch[1]}:`
              //new_argsList[1] = 25
            }
        }
        return target.call(thisArg, ...new_argsList);
      }
    });
  }
}
