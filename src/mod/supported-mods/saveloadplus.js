export const patchCommandHints = () => {
  Scene_OmoriFile.prototype.createCommandHints = function() {
  
    this._commandHints = new Sprite(new Bitmap(Math.ceil(Graphics.boxWidth / 2), 60));
    this.addChild(this._commandHints);
    this._commandHints.position.set(16,Graphics.boxHeight-this._commandHints.height-4);
  
  
    this._commandHints.bitmap.clear();
    let iconSize = 31;
    let paddingY = 4;
    this._commandHints.bitmap.drawText("HALTE", 0, paddingY, this._commandHints.bitmap.width, 16, "left");
    this._commandHints.bitmap.drawInputIcon("shift", 67, paddingY);
    this._commandHints.bitmap.drawText("UM", iconSize + 73, paddingY, this._commandHints.bitmap.width, 16, "left");
    this._commandHints.bitmap.drawText("MENÜ ZU SKALIEREN", 0, paddingY+25, this._commandHints.bitmap.width, 16, "left");
  }
}

export const patchRenameFile = () => {
  Scene_OmoriFile.prototype.renameFile = function() {
    this._promptWindow.deactivate();
    this._promptWindow.close();
    // Get File Window
    var fileWindow = this._fileWindows[this._saveIndex];
    var id = this._saveIndex + 1;
    var valid = DataManager.isThisGameFile(id);
    var info = DataManager.loadGlobalInfo();
    if(info[id].saveName === null){
      info[id].saveName = prompt("Wie möchtest du diese Datei nennen?", "");
    }else{
      info[id].saveName = prompt("Wie möchtest du diese Datei nennen?", info[id].saveName);
    }
    AudioManager.playStaticSe({"name":"GEN_shine","pan":0,"pitch":100,"volume":90});
    DataManager.saveGlobalInfo(info);
    fileWindow.refresh(valid, info[id], id);
    this._statWindow.updateStats(valid, info[id], id);
    // Set Can select Flag to false
    this._canSelect = true;
  };
}