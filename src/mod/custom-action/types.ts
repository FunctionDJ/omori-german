export interface Result {
  critical: unknown
  hpDamage: number
  mpDamage: number
  isHit(): unknown
  elementStrong: boolean
  elementWeak: boolean
}

export interface Actor {
  name(): string
  result(): Result
  friendsUnit(): {
    getLowestIndexMember(): number
  }
  isStateAffected(state: number): boolean
  isEmotionAffected(emotionId: string): boolean
  _noEffectMessage: unknown
  _noStateMessage: unknown
  index(): number
}

declare global {
  var $gameActors: {
    actor(id: number): Actor
  }
}

export interface Item {
  meta: {
    BattleLogType: string
  }
}

interface AdvancedResult {
  text: string
  suffix: "dmg" | "mp"
}

export type SwitchResult = string | AdvancedResult

export type Emotion = "happy" | "sad" | "angry"

export type Stat = "INITIATIVE" | "VERTEIDIGUNG"

export type Direction = "up" | "down"

export type Part = (props: {
  u: string
  t: string
  user: Actor,
  target: Actor
  getEmotionText: (actor: Actor) => string
  getStateText: (actor: Actor, statName: Stat, direction: Direction) => string,
  ifEmotion: (actor: Actor, emotionId: Emotion) => ({
    then(stat: Stat, direction: Direction): string
  }),
  autoBr: (text: string) => string
}) => Record<string, SwitchResult>