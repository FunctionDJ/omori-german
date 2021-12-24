import { Part } from "./types";

export const aubrey: Part = ({
  u, t, user, target,
  getEmotionText, getStateText
}) => ({
  "PEP TALK": `
    ${u} feuert ${t} an!
    ${getEmotionText(target)}
  `,
  "TEAM SPIRIT": `
    ${u} feuer ${t} an!
    ${getEmotionText(target)}
    ${getEmotionText(user)}
  `,
  "HEADBUTT": {
    text: `
      ${u} verpasst ${t}
      eine Kopfnuss!
    `,
    suffix: "dmg"
  },
  "HOMERUN": {
    text: `
      ${u} landet auf ${t}
      einen Volltreffer!
    `,
    suffix: "dmg"
  },
  "THROW": `${u} wirft ihre Waffe!`,
  "POWER HIT": {
    text: `
      ${u} schlägt ${t}!
      ${getStateText(target, "VERTEIDIGUNG", "down")}
    `,
    suffix: "dmg"
  },
  "LAST RESORT": {
    text: `
      ${u} greift ${t}
      mit letzter Kraft an!
    `,
    suffix: "dmg"
  },
  "COUNTER ATTACK": `${u} bereitet ihren Schläger vor!`,
  "COUNTER HEADBUTT": `${u} bereitet ihren Kopf vor!`,
  "COUNTER ANGRY": `${u} macht sich gefasst!`,
  "LOOK OMORI 1": {
    text: `
      OMORI hat ${u} nicht bemerkt, also
      greift ${u} erneut an!
    `,
    suffix: "dmg"
  },
  "LOOK OMORI 2": {
    text: `
      OMORI hat ${u} immer noch nicht
      bemerkt, also greift ${u}
      härter an!
    `,
    suffix: "dmg"
  },
  "LOOK OMORI 3": {
    text: `
      OMORI bemerkt ${u} endlich!
      ${u} schwingt aus Freude ihren Schläger!
    `,
    suffix: "dmg"
  },
  "LOOK KEL 1": `
    KEL stachelt AUBREY an!
    ${t} wird wütend!
  `,
  "LOOK KEL 2": (() => {
    const AUBREY = $gameActors.actor(2)
    const KEL = $gameActors.actor(3)

    let text = `
      KEL stachelt AUBREY an!
      KELs und AUBREYs ANGRIFF steigt!
    `

    if (AUBREY.isStateAffected(14) && KEL.isStateAffected(14)) {
      text += "KEL und AUBREY werden WÜTEND!"
    } else if (AUBREY.isStateAffected(14) && KEL.isStateAffected(15)) {
      text += "KEL wird EMPÖRT!!\r\n"
      text += "AUBREY wird WÜTEND!"
    } else if (AUBREY.isStateAffected(15) && KEL.isStateAffected(14)) {
      text += "KEL wird WÜTEND!\r\n"
      text += "AUBREY wird EMPÖRT!!"
    } else if (AUBREY.isStateAffected(15) && KEL.isStateAffected(15)) {
      text += "KEL und AUBREY werden EMPÖRT!!"
    } else {
      text += "KEL and AUBREY werden WÜTEND!"
    }

    return text
  })(),
  "LOOK HERO": `
    HERO sagt AUBREY, sie soll sich konzentrieren!
    /* 
    text = "HERO sagt AUBREY, sie soll sich konzentrieren!\r\n"
    text += getStateEffect(target) + "\r\n"
    text += u + "s VERTEIDIGUNG steigt!!"
     */
  `,
  "LOOK HERO 2": "",
  /**
   *       case "LOOK HERO 2": // LOOK AT HERO 2
        text = "HERO ermutigt AUBREY!\r\n"
        text += "AUBREYs VERTEIDIGUNG steigt!!\r\n"
        text += getStateEffect(target) + "\r\n"
        if ($gameTemp._statsState[0]) {
          const absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp)
          if (absHp > 0) { text += `AUBREY regeneriert ${absHp} HERZ!\r\n` }
        }
        if ($gameTemp._statsState[1]) {
          const absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp)
          if (absMp > 0) { text += `AUBREY regeneriert ${absMp} SAFT...` }
        }
        $gameTemp._statsState = undefined
        break
   */
  "TWIRL2": {
    text: `${u} greift ${t} an!`,
    suffix: "dmg"
  }
})