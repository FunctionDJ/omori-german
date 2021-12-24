import { patchCustomBattleActionText } from "./vanilla-patches/Custom Battle Action Text"
import { patchGTPOmoriFixes } from "./vanilla-patches/GTP_OmoriFixes"
import { patchMainMenuSceneOptions } from "./vanilla-patches/Omori Main menu - Scene Options"
import { patchSaveAndLoad } from "./vanilla-patches/Omori Save & Load"
import { patchOmoriTitleScreen } from "./vanilla-patches/Omori Title Screen"

export const common = () => {
  patchGTPOmoriFixes()
  patchCustomBattleActionText()
  patchOmoriTitleScreen()
  patchSaveAndLoad()
  patchMainMenuSceneOptions()
}
