import { Actor } from "./custom-action/types"

export const formatString = (string: string): string => {
  // LF to CRLF
  const crlf = string.replace(/([^\r])\n/g, "$1\r\n")
  return crlf
    .split("\r\n")
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join("\r\n")
}

export const getMpDamageText = (mpDamage: number, targetName: string): string => {
  if (mpDamage > 0) {
    return `${targetName} hat ${mpDamage} SAFT verloren...`
  }

  return ""
}

export const getHpDamageBaseTextPure = (
  hpDamage: number,
  result: ReturnType<Actor["result"]>,
  user: string,
  target: string
): string => {
  if (hpDamage === 0) {
    const isHit = result.isHit() === true
    return `${user}s Angriff hat ${isHit ? "nichts bewirkt." : "verfehlt!"}`
  }

  const text = target + ` nimmt ${hpDamage} Schaden!`

  if (result.elementStrong || result.elementWeak) {
    const attackType = result.elementStrong ? "bewegender Angriff!" : "dumpfer Angriff."
    return `...Es war ein ${attackType}\r\n` + text
  }

  return text
}

const autoBreakLine = (text: string) => {
  if (text.length >= 40) {
    const voinIndex = text.slice(0, 41).lastIndexOf(" ")
    const firstLine = text.slice(0, voinIndex).trim()
    const secondLine = text.slice(voinIndex).trimLeft()
    return firstLine + "\r\n" + secondLine
  }

  return text
}

export const parseNoEffectEmotion = (name: string, emotion: string): string => {
  if (emotion.toLowerCase().contains("afraid")) {
    return `${name} kann nicht ÄNGSTLICH sein!\r\n`
  }

  return autoBreakLine(`${name} kann nicht ${emotion} werden`)
}

export const getEmotionText = (actor: Actor): string => {
  if (actor._noEffectMessage) {
    return parseNoEffectEmotion(actor.name(), "HAPPIER!\r\n")
  }

  if (actor.isStateAffected(8)) {
    return `${actor.name()} feels MANIC!!!`
  } else if (actor.isStateAffected(7)) {
    return `${actor.name()} feels ECSTATIC!!`
  } else if (actor.isStateAffected(6)) {
    return `${actor.name()} feels HAPPY!`
  }

  return ""
}