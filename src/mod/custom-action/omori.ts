import { Part } from "./types";

export const omori: Part = ({ u, t, target, hpDamageText getEffectText, autoBr, ifEmotion }) => ({
  "SAD POEM": `
    ${u} liest ein trauriges Gedicht vor.
    ${getEffectText(target)}
  `,
  "STAB": [`${u} sticht ${t}`, "dmg"],
  "TRICK": [`
    ${u} trickst ${t} aus.
    ${ifEmotion(target, "happy").then("INITIATIVE", "down")}
  `, "dmg"],
  "SHUN": [`
    ${u} verscheucht ${t}.
    ${ifEmotion(target, "sad").then("VERTEIDIGUNG", "down")}
  `, "dmg"],
  "MOCK": [`${u} verspottet ${t}.`, "dmg"],
  "HACKAWAY": `${u} schwingt sein Messer wild herum!`,
  "PICK POCKET": `
    ${u} versucht, ein Item zu stehlen!
    von ${t}
  `,
  "BREAD SLICE": [`${u} schlitzt ${t}!`, "dmg"],
  "HIDE": `${u} verschwindet in den Hintergrund... `,
  "QUICK ATTACK": [`${u} stürzt sich auf ${t}!`, "dmg"],
  "EXPLOIT HAPPY": [`
    ${u} nutzt ${t}s
    Freude aus!
  `, "dmg"],
  "EXPLOIT SAD": [`
    ${u} nutzt ${t}s
    Trauer aus!
  `, "dmg"],
  "EXPLOIT ANGRY": [`
    ${u} nutzt ${t}s
    Wut aus!
  `, "dmg"],
  "EXPLOIT EMOTION": [autoBr(`
    ${u} nutzt ${t}s EMOTIONEN aus!
  `), "dmg"],
  "FINAL STRIKE": `${u} entfacht seinen ultimativen Angriff!`,
  "TRUTH": `
    ${u} flüstert
    ${t} etwas zu.
    ${hpDamageText}
    ${getEffectText(target)}
  `,
  "ATTACK AGAIN": [`${u} greift erneut an!`, "dmg"],
  "TRIP": [`
  ${u} bringt ${t} zum Stolpern!
  ${getTargetStateText("INITIATIVE", false)}
`, "dmg"],
  "TRIP 2": [`
    ${u} bringt ${t} zum Stolpern!
    ${getTargetStateText("INITIATIVE", false)}
    ${getTargetEffectText("TRAURIG.", "TRAURIGER")}
  `, "dmg"],
  "STARE": `
    ${u} starrt ${t} an.
    ${t} fühlt sich unwohl.
  `,
  "RELEASE ENERGY": `
    ${u} und seine Freunde
    entfachen ihren ultimativen Angriff!
  `,
  "VERTIGO": getOnLowestIndexText(`
    ${u} bringt die Gegner aus dem Gleichgewicht!
    ANGRIFF aller Gegner sinkt!
  `),
  "CRIPPLE": getOnLowestIndexText(`
    ${u} lähmt die Gegner!
    INITIATIVE aller Gegner sinkt.
  `),
  "SUFFOCATE": getOnLowestIndexText(`
    ${u} erstickt die Gegner!
    Alle Gegner schnappen nach Luft.
    VERTEIDIGUNG aller Gegner sinkt.
  `)
})