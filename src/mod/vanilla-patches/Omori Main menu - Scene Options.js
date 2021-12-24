export const patchMainMenuSceneOptions = () => {
  Window_OmoMenuOptionsCategory.prototype.makeCommandList = function() {
    this.addCommand('ALLGEMEIN', 'ok');
    this.addCommand('AUDIO', 'ok');
    // this.addCommand('GAMEPLAY', 'ok');
    this.addCommand('STEUERUNG', 'ok');
    this.addCommand('SYSTEM', 'ok');
  };
  
  Window_OmoMenuOptionsExitPromptWindow.prototype.windowWidth    = function() { 
    return 300;
  };
  
  Window_OmoMenuOptionsExitPromptWindow.prototype.itemRect = function(index) {
    var rect = Window_Command.prototype.itemRect.call(this, index);
  //  rect.x += 10;
    rect.x += 35;
    rect.y += this.lineHeight() - 5;
    return rect;
};
}