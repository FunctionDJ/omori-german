export const patchOmoriTitleScreen = () => {
  // translate title screen top right buttons
  Scene_OmoriTitleScreen.prototype.createTitleCommands = function () {
    const textList = ["NEUES SPIEL", "FORTFAHREN", "OPTIONEN"]
    const centerX = Math.floor((Graphics.width - (156 * textList.length)) / 1.8)

    this._titleCommands = textList.map((t, i) => {
      const win = new Window_OmoTitleScreenBox(t)
      win.x = centerX + (i * (130 + 39))
      win.y = Graphics.height

      if (i === this._commandIndex) {
        win.select(0)
      }

      this.addChild(win)
      return win
    })

    this._titleCommands[1].setText(textList[1], this._canContinue)
  }

  // adjust title screen top right button positions
  Scene_OmoriTitleScreen.prototype.createCommandHints = function () {
    this._commandHints = new Sprite(new Bitmap(Math.ceil(Graphics.boxWidth / 2.4), Math.ceil(Graphics.boxHeight / 8)))
    this.addChild(this._commandHints)
    this._commandHints.position.set(Graphics.boxWidth - this._commandHints.width, 0)
    this.refreshCommandHints()
  }
}