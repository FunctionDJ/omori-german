import { Part } from "./types";

export const generic: Part = ({ u, t }) => ({
  "BLANK": "...",
  "ATTACK": [`${u} greift ${t} an!`, "dmg"],
  "MULTIHIT": [`${u} verursacht bewegenden Schaden!`, "dmg"],
  "OBSERVE": `
    ${u} fokussiert sich und beobachtet.
    ${t}!
  `,
  "OBSERVE TARGET": `
    ${t} wirft ein Auge auf
    ${u}!
  `,
  "OBSERVE ALL": `${t} hat alle im Blick!`
})