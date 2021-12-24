export const patchCustomBattleActionText = () => {
  // translate "Custom Battle Action Text.js"::makeCustomActionText()
  // Window_BattleLog.prototype.makeCustomActionText = makeCustomActionText
  
  // translate "Custom Battle Action Text.js"::displayHpDamage()
  const oldBattleLogDisplayHpDamage = Window_BattleLog.prototype.displayHpDamage
  Window_BattleLog.prototype.displayHpDamage = function (target) {
    const result = target.result()
  
    if (
      result.isHit() &&
      result.hpDamage > 0 &&
      (result.elementStrong || result.elementWeak)
    ) {
      this.push("addText", `...Es war ein ${result.elementStrong ? "bewegender" : "dumpfer"} Angriff!`)
      this.push("waitForNewLine")
    }
  
    return oldBattleLogDisplayHpDamage.call(this, target)
  }
}