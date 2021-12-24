import { aubrey } from "./custom-action/aubrey"
import { Actor, Item, Part, SwitchResult } from "./custom-action/types"
import { formatString, getHpDamageBaseTextPure, getMpDamageText } from "./custom-action-pure-functions"

const stateEffectMap = new Map<number, string>([
  [6, "FROH!"],
  [7, "BEGEISTERT!!"],
  [8, "WAHNSINNIG!!!"],
  [10, "TRAURIG."],
  [11, "DEPRIMIERT.."],
  [12, "VERZWEIFELT..."],
  [14, "WÜTEND!"],
  [15, "EMPÖRT!!"],
  [16, "ZORNIG!!!"]
])

const getStateEffect = (actor: Actor): string => {
  for (const [state, text] of stateEffectMap.entries()) {
    if (actor.isStateAffected(state)) {
      return `${actor.name()} wird ${text}`
    }
  }

  return ""
}

const getEffect = (stateMapping: Map<number, string>, actor: Actor): string => {
  for (const [state, emotionSuffix] of stateMapping.entries()) {
    if (actor.isStateAffected(state)) {
      return `${actor.name()} wird ${emotionSuffix}`
    }
  }

  return ""
}

const br = "\r\n"

export const makeCustomActionText = (
  user: Actor,
  target: Actor,
  item: Item
): string => {
  const result = target.result()
  const u = user.name()
  const t = target.name()
  const pronoun = t === "AUBREY" ? "sie" : "ihn"

  const { critical, hpDamage, mpDamage } = result

  const type = item.meta.BattleLogType.toUpperCase()
  const unitLowestIndex = target.friendsUnit().getLowestIndexMember()

  const getHpDamageBaseText = (): string => (
    getHpDamageBaseTextPure(hpDamage, result, u, t)
  )

  const getOnLowestIndexText = (text: string): SwitchResult => {
    if (target.index() <= unitLowestIndex) {
      return [text, "dmg"]
    }

    return ["", "dmg"]
  }

  const getHpDamageText = (mpDamageText: string): string => {
    const parts: string[] = []

    if (critical) {
      parts.push("DIREKT INS HERZ!")
    }

    parts.push(getHpDamageBaseText())
    
    if (mpDamage > 0) {
      parts.push(mpDamageText)
    }

    return parts.join(br)
  }

  const parseNoStateChange = (tname: string, stat: string, hl: string): string => {
    const verb = hl.replace("höher", "steigen").replace("tiefer", "sinken")
    return `${tname}s ${stat} kann nicht\r\nweiter ${verb}!` // TARGET NAME - STAT - HIGHER/LOWER
  }

  
  const state = (emotion: string, cantGetEmotion: string): string => {
    if (target._noEffectMessage) {
      return parseNoEffectEmotion(t, `${cantGetEmotion}!`)
    }

    return `${t} wird ${emotion}`
  }

  const getEmotionAbilityText = ({
    base, emotionId, statName, increasing, changeText
  }: {
    base: string, emotionId: string, statName: string,
    increasing: boolean, changeText: string
  }): string => {
    if (!target.isEmotionAffected(emotionId)) {
      return base
    }

    const noChangeDirection = increasing ? "steigen" : "sinken"

    const effectText = target._noStateMessage
      ? parseNoStateChange(t, statName, `${noChangeDirection}!`)
      : `${t}s ${statName} ${changeText}`

    return base + "\r\n" + effectText
  }

  const getTargetStateText = (statName: string, increasing: boolean): string => {
    if (target._noStateMessage) {
      const direction = increasing ? "steigen!" : "sinken!"
      return parseNoStateChange(t, statName, direction)
    }

    const direction = increasing ? "steigt!" : "sinkt!"
    return `${t}s ${statName} ${direction}`
  }

  const getTargetEffectText = (emotion: string, increased: string): string => {
    if (target._noEffectMessage) {
      return parseNoEffectEmotion(t, increased + "!")
    }

    return `${t} wird ${emotion}`
  }

  // TODO analyse. entfernen.
  if (typeof result.isHit() !== "boolean") {
    alert(`result.isHit() is not boolean, but ${typeof result.isHit()} (${JSON.stringify(result.isHit())})`)
  }

  // TODO analyse. entfernen.
  if (typeof hpDamage !== "number") {
    alert(`hpDam is not number, but ${typeof hpDamage} (${JSON.stringify(hpDamage)})`)
  }

  const mpDamageText = getMpDamageText(mpDamage, target.name())
  const hpDamageText = getHpDamageText(mpDamageText)

  const typeMapGenerators: Part[] = [
    aubrey
  ]



  const getStateText = (actor: Actor, statName: string, direction: "up" | "down"): string => {
    return "TODO"
  }

  const typeMap: Record<string, SwitchResult> = typeMapGenerators.reduce((prev, cur) => ({
    ...prev,
    ...cur({
      u,
      t,
      user,
      target,
      getEmotionText,
      getStateText,
      ifEmotion
    })
  }), {})

  const typeResult = typeMap[type]

  const switchResult = ((): SwitchResult => {
    switch (type) {
      // KEL//
      case "ANNOY": // ANNOY
        text = u + " ärgert " + t + "!\r\n"
        if (!target._noEffectMessage) {
          target += getStateEffect(target)
        } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      case "REBOUND": // REBOUND
        text = u + "s Ball prallt überall ab!"
        break

      case "FLEX": // FLEX
        text = u + " kommt durch's Muskelspiel ans Ziel!\r\n"
        text += u + " TREFFERRATE steigt!\r\n"
        break

      case "JUICE ME": // JUICE ME
        text = u + " passt die KOKOSNUSS zu " + t + "!\r\n"
        // eslint-disable-next-line no-case-declarations
        const absMp = Math.abs(mpDamage)
        if (absMp > 0) {
          text += `${t} regeneriert ${absMp} SAFT...\r\n`
        }
        text += hpDamageText
        break

      case "RALLY": // RALLY
        text = u + " bringt alle in Schwung!\r\n"
        text += getStateEffect(user) + "\r\n"
        text += "Alle erhalten ENERGIE!\r\n"
        for (const actor of $gameParty.members()) {
          if (actor.name() === "KEL") { continue }
          const result = actor.result()
          if (result.mpDamage >= 0) { continue }
          const absMp = Math.abs(result.mpDamage)
          text += `${actor.name()} regeneriert ${absMp} SAFT...\r\n`
        }
        break

      case "SNOWBALL": // SNOWBALL
        text = u + " wirft einen SCHNEEBALL auf\r\n"
        text += t + "!\r\n"
        if (!target._noEffectMessage) { text += t + " wird TRAURIG.\r\n" } else { text += parseNoEffectEmotion(t, "TRAURIGER!\r\n") }
        text += hpDamageText
        break

      case "TICKLE": // TICKLE
        text = u + " kitzelt " + t + "!\r\n"
        text += `${t} wird unachtsam!`
        break

      case "RICOCHET": // RICOCHET
        text = u + " führt einen tollen Balltrick vor!" + breakDmgText
        break

      case "CURVEBALL": // CURVEBALL
        text = u + " wirft einen Curveball...\r\n"
        text += t + " wird aus der Bahn geworfen!\r\n"
        switch ($gameTemp._randomState) {
          case 6:
            if (!target._noEffectMessage) { text += t + " wird FROH!\r\n" } else { text += parseNoEffectEmotion(t, "FROHER!\r\n") }
            break
          case 14:
            if (!target._noEffectMessage) { text += t + " wird WÜTEND!\r\n" } else { text += parseNoEffectEmotion(t, "WÜTENDER!\r\n") }
            break
          case 10:
            if (!target._noEffectMessage) { text += t + " wird TRAURIG.\r\n" } else { text += parseNoEffectEmotion(t, "TRAURIGER!\r\n") }
            break
        }
        text += hpDamageText
        break

      case "MEGAPHONE": // MEGAPHONE
        if (target.index() <= unitLowestIndex) { text = u + " rennt rum und ärgert alle!\r\n" }
        text += getStateEffect(target) + "\r\n"
        break

      case "DODGE ATTACK": // DODGE ATTACK
        text = u + " bereitet sich aufs Ausweichen vor!"
        break

      case "DODGE ANNOY": // DODGE ANNOY
        text = u + " neckt die Gegner!"
        break

      case "DODGE TAUNT": // DODGE TAUNT
        text = u + " verhöhnt die Gegner!\r\n"
        text += "TREFFERRATE aller Gegner sinkt diese Runde!"
        break

      case "PASS OMORI": // KEL PASS OMORI
        text = "OMORI hat nicht hingeschaut und wurde umgehauen!\r\n"
        text += "OMORI nimmt 1 Schaden!"
        break

      case "PASS OMORI 2": // KEL PASS OMORI 2
        text = "OMORI fängt KELs Ball!\r\n"
        text += "OMORI wirft den Ball auf\r\n"
        text += t + "!\r\n"
        if ($gameActors.actor(1).isStateAffected(6)) { text += "OMORI wird FROH!\r\n" } else if ($gameActors.actor(1).isStateAffected(7)) { text += "OMORI wird BEGEISTERT!!\r\n" }
        text += hpDamageText
        break

      case "PASS AUBREY": // KEL PASS AUBREY
        text = "AUBREY hämmert den Ball weg!" + breakDmgText
        break

      case "PASS HERO": // KEL PASS HERO
        if (target.index() <= unitLowestIndex) { text = u + " dunks on the foes!\r\n" }
        text += hpDamageText
        break

      case "PASS HERO 2": // KEL PASS HERO
        if (target.index() <= unitLowestIndex) {
          text = u + " versenkt den Ball anmutig!\r\n"
          text += "All foes' ANGRIFF fell!\r\n"
        }
        text += hpDamageText
        break

      // HERO//
      case "MASSAGE": // MASSAGE
        text = u + " massiert " + t + "!\r\n"
        if (target.isAnyEmotionAffected(true)) {
          text += t + " beruhigt sich..."
        } else { text += "Es hatte keine Auswirkung..." }
        break

      case "COOK": // COOK
        text = u + " macht einen Keks extra für " + t + "!"
        break

      case "FAST FOOD": // FAST FOOD
        text = u + " macht für " + t + " eine schnelle Mahlzeit."
        break

      case "JUICE": // JUICE
        text = u + " bereitet " + t + " eine Erfrischung vor."
        break

      case "SMILE": // SMILE
        text = u + " lächelt " + t + " an!\r\n"
        if (!target._noStateMessage) { text += t + "s ANGRIFF sinkt." } else { text += parseNoStateChange(t, "ATTACK", "tiefer!\r\n") }
        break

      case "DAZZLE":
        text = u + " lächelt " + t + " an!\r\n"
        if (!target._noStateMessage) { text += t + "s ANGRIFF sinkt.\r\n" } else { text += parseNoStateChange(t, "ATTACK", "tiefer!\r\n") }
        if (!target._noEffectMessage) {
          text += t + " wird FROH!"
        } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break
      case "TENDERIZE": // TENDERIZE
        text = u + " massiert\r\n"
        text += t + " intensiv!\r\n"
        if (!target._noStateMessage) { text += t + "s VERTEIDIGUNG sinkt!\r\n" } else { text += parseNoStateChange(t, "VERTEIDIGUNG", "tiefer!\r\n") }
        text += hpDamageText
        break

      case "SNACK TIME": // SNACK TIME
        text = u + " macht allen Kekse!"
        break

      case "TEA TIME": // TEA TIME
        text = u + " holt Tee für eine kurze Pause.\r\n"
        text += t + " fühlt sich erholt!\r\n"
        if (result.hpDamage < 0) {
          const absHp = Math.abs(result.hpDamage)
          text += `${t} regeneriert ${absHp} HERZ!\r\n`
        }
        if (result.mpDamage < 0) {
          const absMp = Math.abs(result.mpDamage)
          text += `${t} regeneriert ${absMp} SAFT...\r\n`
        }
        break

      case "SPICY FOOD": // SPICY FOOD
        text = u + " kocht scharfes Essen!" + breakDmgText
        break

      case "SINGLE TAUNT": // SINGLE TAUNT
        text = u + " lenkt " + t + "s\r\n"
        text += "Aufmerksamkeit auf sich."
        break

      case "TAUNT": // TAUNT
        text = u + " lockt die Gegner an."
        break

      case "SUPER TAUNT": // SUPER TAUNT
        text = u + " lockt die Gegner an.\r\n"
        text += u + " bereitet sich aufs Blocken vor."
        break

      case "ENCHANT": // ENCHANT
        text = u + " lockt die Gegner\r\n"
        text += "mit einem Lächeln an.\r\n"
        if (!target._noEffectMessage) { text += t + " wird FROH!" } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "MENDING": // MENDING
        text = u + " bewirtet " + t + ".\r\n"
        text += u + " ist nun " + t + "s Koch!"
        break

      case "SHARE FOOD": // SHARE FOOD
        if (t !== u) {
          text = u + " teilt Essen mit " + t + "!"
        }
        break

      case "CALL OMORI": // CALL OMORI
        text = u + " gibt OMORI ein Zeichen!\r\n"
        if ($gameTemp._statsState[0]) {
          const absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(1).hp)
          if (absHp > 0) { text += `OMORI regeneriert ${absHp} HERZ!\r\n` }
        }
        if ($gameTemp._statsState[1]) {
          const absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(1).mp)
          if (absMp > 0) { text += `OMORI regeneriert ${absMp} SAFT...` }
        }
        $gameTemp._statsState = undefined
        break

      case "CALL KEL": // CALL KEL
        text = u + " eifert KEL an!\r\n"
        if ($gameTemp._statsState[0]) {
          const absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(3).hp)
          if (absHp > 0) { text += `KEL regeneriert ${absHp} HERZ!\r\n` }
        }
        if ($gameTemp._statsState[1]) {
          const absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(3).mp)
          if (absMp > 0) { text += `KEL regeneriert ${absMp} SAFT...` }
        }
        break

      case "CALL AUBREY": // CALL AUBREY
        text = u + " spornt AUBREY an!\r\n"
        if ($gameTemp._statsState[0]) {
          const absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp)
          if (absHp > 0) { text += `AUBREY regeneriert ${absHp} HERZ!\r\n` }
        }
        if ($gameTemp._statsState[1]) {
          const absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp)
          if (absMp > 0) { text += `AUBREY regeneriert ${absMp} SAFT...` }
        }
        break

      // PLAYER//
      case "CALM DOWN": // PLAYER CALM DOWN
        if (item.id !== 1445) { text = u + " beruhigt sich.\r\n" } // Process if Calm Down it's not broken;
        if (Math.abs(hpDamage) > 0) { text += u + " regeneriert " + Math.abs(hpDamage) + " HERZ!" }
        break

      case "FOCUS": // PLAYER FOCUS
        text = u + " focuses."
        break

      case "PERSIST": // PLAYER PERSIST
        text = u + " persists."
        break

      case "OVERCOME": // PLAYER OVERCOME
        text = u + " overcomes."
        break

      // UNIVERSAL//
      case "FIRST AID": // FIRST AID
        text = u + " kümmert sich um " + t + "!\r\n"
        text += t + " regeneriert " + Math.abs(target._result.hpDamage) + " HERZ!"
        break

      case "PROTECT": // PROTECT
        text = u + " stellt sich vor " + t + "!"
        break

      case "GAURD": // GAURD
        text = u + " bereitet sich aufs Blocken vor."
        break

      // FOREST BUNNY//
      case "BUNNY ATTACK": // FOREST BUNNY ATTACK
        text = u + " knabbert an " + t + "!" + breakDmgText
        break

      case "BUNNY NOTHING": // BUNNY DO NOTHING
        text = u + " hüpft herum!"
        break

      case "BE CUTE": // BE CUTE
        text = u + " zwinkert " + t + " an!\r\n"
        text += t + "s ANGRIFF sinkt..."
        break

      case "SAD EYES": // SAD EYES
        text = u + " schaut " + t + " traurig an.\r\n"
        if (!target._noEffectMessage) { text += t + " wird TRAURIG." } else { text += parseNoEffectEmotion(t, "TRAURIGER!") }
        break

      // FOREST BUNNY?//
      case "BUNNY ATTACK2": // BUNNY? ATTACK
        text = u + " knabbert an " + t + "?" + breakDmgText
        break

      case "BUNNY NOTHING2": // BUNNY? DO NOTHING
        text = u + " hüpft herum?"
        break

      case "BUNNY CUTE2": // BE CUTE?
        text = u + " zwinkert " + t + "an?\r\n"
        text += t + "s ANGRIFF sinkt?"
        break

      case "SAD EYES2": // SAD EYES?
        text = u + " schaut " + t + " traurig an...\r\n"
        if (!target._noEffectMessage) { text += t + " wird TRAURIG?" } else { text += parseNoEffectEmotion(t, "TRAURIGER!") }
        break

      // SPROUT MOLE//
      case "SPROUT ATTACK": // SPROUT MOLE ATTACK
        text = u + " rempelt " + t + " an!" + breakDmgText
        break

      case "SPROUT NOTHING": // SPROUT NOTHING
        text = u + " rollt herum."
        break

      case "RUN AROUND": // RUN AROUND
        text = u + " rennt herum!"
        break

      case "HAPPY RUN AROUND": // HAPPY RUN AROUND
        text = u + " rennt energisch herum!"
        break

      // MOON BUNNY//
      case "MOON ATTACK": // MOON BUNNY ATTACK
        text = u + " stößt in " + t + "!" + breakDmgText
        break

      case "MOON NOTHING": // MOON BUNNY NOTHING
        text = u + " starrt ins Leere."
        break

      case "BUNNY BEAM": // BUNNY BEAM
        text = u + " schießt einen Laser!" + breakDmgText
        break

      // DUST BUNNY//
      case "DUST NOTHING": // DUST NOTHING
        text = u + " versucht, sich\r\n"
        text += "zusammenzuhalten."
        break

      case "DUST SCATTER": // DUST SCATTER
        text = u + " explodiert!"
        break

      // U.F.O//
      case "UFO ATTACK": // UFO ATTACK
        text = u + " stößt mit " + t + " zusammen!" + breakDmgText
        break

      case "UFO NOTHING": // UFO NOTHING
        text = u + " verliert das Interesse."
        break

      case "STRANGE BEAM": // STRANGE BEAM
        text = u + " lässt ein komisches Licht erleuchten!\r\n"
        text += t + " fühlt eine zufällige EMOTION!"
        break

      case "ORANGE BEAM": // ORANGE BEAM
        text = u + " schießt einen orangen Laser!" + breakDmgText
        break

      // VENUS FLYTRAP//
      case "FLYTRAP ATTACK": // FLYTRAP ATTACK
        text = u + " greift " + t + " an!" + breakDmgText
        break

      case "FLYTRAP NOTHING": // FLYTRAP NOTHING
        text = u + " kaut auf nichts rum."
        break

      case "FLYTRAP CRUNCH": // FLYTRAP
        text = u + " beißt " + t + "!" + breakDmgText
        break

      // WORMHOLE//
      case "WORM ATTACK": // WORM ATTACK
        text = u + " schlägt " + t + "!" + breakDmgText
        break

      case "WORM NOTHING": // WORM NOTHING
        text = u + " wackelt herum..."
        break

      case "OPEN WORMHOLE": // OPEN WORMHOLE
        text = u + " öffnet ein Wurmloch!"
        break

      // MIXTAPE//
      case "MIXTAPE ATTACK": // MIXTAPE ATTACK
        text = u + " schlägt " + t + "!" + breakDmgText
        break

      case "MIXTAPE NOTHING": // MIXTAPE NOTHING
        text = u + " entwirrt sich selbst."
        break

      case "TANGLE": // TANGLE
        text = t + " verwickelt sich in " + u + "!\r\n"
        text += t + "s INITIATIVE sinkt..."
        break

      // DIAL-UP//
      case "DIAL ATTACK": // DIAL ATTACK
        text = u + " ist langsam.\r\n"
        text += `${t} verletzt sich selbst in Frustration!` + breakDmgText
        break

      case "DIAL NOTHING": // DIAL NOTHING
        text = u + " lädt..."
        break

      case "DIAL SLOW": return (
        `${u} wird laaaaaaaangsamer.\r\n` +
        "INITIATIVE von allen sinkt..."
      )

      // DOOMBOX
      case "DOOM ATTACK": return `${u} wirft sich auf ${t}!${breakDmgText}`
      case "DOOM NOTHING": return `${u} stellt das Radio ein.`
      case "BLAST MUSIC": return `${u} spielt geile Musik!`

      // SHARKPLANE//
      case "SHARK ATTACK": return `${u} rammt sich in ${t}!${breakDmgText}`

      case "SHARK NOTHING": return `${u} stochert an seinen Zähnen herum.`

      case "OVERCLOCK ENGINE": // OVERCLOCK ENGINE
        text = u + " dreht seinen Motor auf!\r\n"
        if (!target._noStateMessage) {
          text += u + "s INITIATIVE steigt!"
        } else { text += parseNoStateChange(u, "INITIATIVE", "höher!") }
        break

      case "SHARK CRUNCH": return `${u} beißt ${t}!${breakDmgText}`

      // SNOW BUNNY//
      case "SNOW BUNNY ATTACK": return `${u} kickt Schnee auf ${t}!${breakDmgText}`
      case "SNOW NOTHING": return `${u} bleibt cool.`
      case "SMALL SNOWSTORM": return `${u} wirft Schnee auf alle,\r\nwas einen kleinen Schneesturm entfacht!`

      // SNOW ANGEL//
      case "SNOW ANGEL ATTACK": return `${u} berührt ${t}\r\nmit seinen kalten Händen.` + breakDmgText

      case "UPLIFTING HYMN": {
        target._noEffectMessage = undefined

        if (target.index() <= unitLowestIndex) {
          return (
            `${u} singt ein schönes Lied...\r\n` +
            "Alle werden FROH!"
          )
        }

        return ""
      }

      case "PIERCE HEART": return `${u} trifft ${t} ins HERZ.${breakDmgText}`

      // SNOW PILE//
      case "SNOW PILE ATTACK": // SNOW PILE ATTACK
        text = u + " wirft Schnee auf " + t + "!" + breakDmgText
        break

      case "SNOW PILE NOTHING": // SNOW PILE NOTHING
        text = u + " fühlt sich frostig."
        break

      case "SNOW PILE ENGULF": // SNOW PILE ENGULF
        text = u + " hüllt " + t + " in Schnee ein!\r\n"
        text += u + "s INITIATIVE sinkt.\r\n"
        text += u + "s VERTEIDIGUNG sinkt."
        break

      case "SNOW PILE MORE SNOW": // SNOW PILE MORE SNOW
        text = u + " häuft Schnee auf sich selbst!\r\n"
        text += u + "s ANGRIFF steigt!\r\n"
        text += u + "s VERTEIDIGUNG steigt!"
        break

      // CUPCAKE BUNNY//
      case "CCB ATTACK": // CUP CAKE BUNNY ATTACK
        text = u + " rempelt " + t + " an." + breakDmgText
        break

      case "CCB NOTHING": // CUP CAKE BUNNY NOTHING
        text = u + " hüpft auf der Stelle."
        break

      case "CCB SPRINKLES": // CUP CAKE BUNNY SPRINKLES
        text = u + " hüllt " + t + "\r\n"
        text += "in Streuseln ein.\r\n"
        if (!target._noEffectMessage) { text += t + " wird FROH!\r\n" } else { text += parseNoEffectEmotion(t, "FROHER!\r\n") }
        text += t + "'s WERTE steigen!"
        break

      // MILKSHAKE BUNNY//
      case "MSB ATTACK": // MILKSHAKE BUNNY ATTACK
        text = u + " verschüttet Milchshake auf " + t + "." + breakDmgText
        break

      case "MSB NOTHING": // MILKSHAKE BUNNY NOTHING
        text = u + " dreht sich im Kreis."
        break

      case "MSB SHAKE": // MILKSHAKE BUNNY SHAKE
        text = u + " schüttelt wild!\r\n"
        text += "Milchshake fliegt durch die Gegend!"
        break

      // PANCAKE BUNNY//
      case "PAN ATTACK": // PANCAKE BUNNY ATTACK
        text = u + " knabbert an " + t + "." + breakDmgText
        break

      case "PAN NOTHING": // PANCAKE BUNNY NOTHING
        text = u + " macht einen Salto!\r\n"
        text += "Wie talentiert!"
        break

      // STRAWBERRY SHORT SNAKE//
      case "SSS ATTACK": // STRAWBERRY SHORT SNAKE ATTACK
        text = u + " beißt sich in " + t + " ein." + breakDmgText
        break

      case "SSS NOTHING": // STRAWBERRY SHORT SNAKE NOTHING
        text = u + " zischt."
        break

      case "SSS SLITHER": // STRAWBERRY SHORT SNAKE SLITHER
        text = u + " schlängelt fröhlich herum!\r\n"
        if (!user._noEffectMessage) { text += u + " wird FROH!" } else { text += parseNoEffectEmotion(u, "FROHER!") }
        break

      // PORCUPIE//
      case "PORCUPIE ATTACK": // PORCUPIE ATTACK
        text = u + " stupst " + t + " an." + breakDmgText
        break

      case "PORCUPIE NOTHING": // PORCUPIE NOTHING
        text = u + " schnüffelt herum."
        break

      case "PORCUPIE PIERCE": // PORCUPIE PIERCE
        text = u + " spießt " + t + " auf!" + breakDmgText
        break

      // BUN BUNNY//
      case "BUN ATTACK": // BUN ATTACK
        text = u + " rempelt " + t + " an!" + breakDmgText
        break

      case "BUN NOTHING": // BUN NOTHING
        text = u + " faulenzt."
        break

      case "BUN HIDE": // BUN HIDE
        text = u + " versteckt sich in seinem Brötchen."
        break

      // TOASTY//
      case "TOASTY ATTACK": // TOASTY ATTACK
        text = u + " stürzt sich auf " + t + "." + breakDmgText
        break

      case "TOASTY NOTHING": // TOASTY NOTHING
        text = u + " bohrt in der Nase."
        break

      case "TOASTY RILE": // TOASTY RILE
        if (target.index() <= unitLowestIndex) {
          text = u + " hält eine kontroverse Rede!\r\n"
          text += "Alle werden WÜTEND!"
        }
        target._noEffectMessage = undefined
        break

      // SOURDOUGH//
      case "SOUR ATTACK": // SOURDOUGH ATTACK
        text = u + " tritt auf " + t + "s Zeh!" + breakDmgText
        break

      case "SOUR NOTHING": // SOURDOUGH NOTHING
        text = u + " kickt Schmutz."
        break

      case "SOUR BAD WORD": // SOURDOUGH BAD WORD
        text = "Oh no! " + u + " sagt ein böses Wort!" + breakDmgText
        break

      // SESAME//
      case "SESAME ATTACK": // SESAME ATTACK
        text = u + " wirft Samen auf " + t + "." + breakDmgText
        break

      case "SESAME NOTHING": // SESAME Nothing
        text = u + " kratzt seinen Kopf."
        break

      case "SESAME ROLL": // SESAME BREAD ROLL
        if (target.index() <= unitLowestIndex) {
          text = u + " rollt über alle!\r\n"
        }
        text += hpDamageText
        break

      // CREEPY PASTA//
      case "CREEPY ATTACK": // CREEPY ATTACK
        text = u + " lässt " + t + " sich\r\n"
        text += "unwohl fühlen." + breakDmgText
        break

      case "CREEPY NOTHING": // CREEPY NOTHING
        text = u + " macht nichts... bedrohlich!"
        break

      case "CREEPY SCARE": // CREEPY SCARE
        text = u + " zeigt allen ihre\r\n"
        text += "schlimmsten Alpträume!"
        break

      // COPY PASTA//
      case "COPY ATTACK": // COPY ATTACK
        text = u + " wirft sich auf " + t + "!" + breakDmgText
        break

      case "DUPLICATE": // DUPLICATE
        text = u + " kopiert sich! "
        break

      // HUSH PUPPY//
      case "HUSH ATTACK": // HUSH ATTACK
        text = u + " rammt sich in " + t + "!" + breakDmgText
        break

      case "HUSH NOTHING": // HUSH NOTHING
        text = u + " versucht, zu bellen...\r\n"
        text += "Aber nichts geschieht..."
        break

      case "MUFFLED SCREAMS": // MUFFLED SCREAMS
        text = u + " fängt an zu schreien!\r\n"
        if (!target._noEffectMessage && t !== "OMORI") {
          text += t + " wird ÄNGSTLICH."
        } else { text += parseNoEffectEmotion(t, "AFRAID") }
        break

      // GINGER DEAD MAN//
      case "GINGER DEAD ATTACK": // GINGER DEAD MAN ATTACK
        text = u + " sticht " + t + "!" + breakDmgText
        break

      case "GINGER DEAD NOTHING": // GINGER DEAD MAN DO NOTHING
        text = u + "s Kopf fällt ab...\r\n"
        text += u + " setzt ihn wieder auf."
        break

      case "GINGER DEAD THROW HEAD": // GINGER DEAD MAN THROW HEAD
        text = u + " wirft seinen Kopf auf\r\n"
        text += t + "!" + breakDmgText
        break

      // LIVING BREAD//
      case "LIVING BREAD ATTACK": // LIVING BREAD ATTACK
        text = u + " schlägt auf " + t + " ein!" + breakDmgText
        break

      case "LIVING BREAD NOTHING": // LIVING BREAD ATTACK
        text = u + " kommt langsam näher\r\n"
        text += t + "!"
        break

      case "LIVING BREAD BITE": // LIVING BREAD BITE
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "LIVING BREAD BAD SMELL": // LIVING BREAD BAD SMELL
        text = u + " riecht fürchterlich!\r\n"
        text += t + "s VERTEIDIGUNG sinkt!"
        break

      // Bug Bunny//
      case "BUG BUN ATTACK": // Bug Bun Attack
        text = u + " schlägt auf " + t + " ein!" + breakDmgText
        break

      case "BUG BUN NOTHING": // Bug Bun Nothing
        text = u + " versucht, sich auf seinem\r\nKopf zu balancieren."
        break

      case "SUDDEN JUMP": // SUDDEN JUMP
        text = u + " stürzt sich plötzlich auf " + t + "!" + breakDmgText
        break

      case "SCUTTLE": // Bug Bun Scuttle
        text = u + " krabbelt fröhlich herum.\r\n"
        text += "It was really cute!\r\n"
        if (!user._noEffectMessage) { text += u + " wird FROH!" } else { text += parseNoEffectEmotion(u, "FROHER!") }
        break

      // RARE BEAR//
      case "BEAR ATTACK": // BEAR ATTACK
        text = u + " geht auf " + t + " los!" + breakDmgText
        break

      case "BEAR HUG": // BEAR HUG
        text = u + " umarmt " + t + "!\r\n"
        text += t + "s INITIATIVE sinkt!" + breakDmgText
        break

      case "ROAR": // ROAR
        text = u + " lässt einen lauten Brüller raus!\r\n"
        if (!user._noEffectMessage) { text += u + " wird WÜTEND!" } else { text += parseNoEffectEmotion(u, "WÜTENDER!") }
        break

      // POTTED PALM//
      case "PALM ATTACK": // PALM ATTACK
        text = u + " rammt sich in " + t + "!" + breakDmgText
        break

      case "PALM NOTHING": // PALM NOTHING
        text = u + " ruht sich im Topf aus. "
        break

      case "PALM TRIP": // PALM TRIP
        text = t + " stolpert über " + u + "s Wurzeln." + breakDmgText + ".\r\n"
        text += t + "s INITIATIVE sinkt."
        break

      case "PALM EXPLOSION": // PALM EXPLOSION
        text = u + " explodiert!"
        break

      // SPIDER CAT//
      case "SPIDER ATTACK": // SPIDER ATTACK
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "SPIDER NOTHING": // SPIDER NOTHING
        text = u + " spuckt einen Netzball aus."
        break

      case "SPIN WEB": // SPIN WEB
        text = u + " schießt ein Netz auf " + t + "!\r\n"
        text += t + "s INITIATIVE sinkt."
        break

      // SPROUT MOLE?//
      case "SPROUT ATTACK 2": return `${u} rempelt ${t} an?` + breakDmgText
      case "SPROUT NOTHING 2": return `${u} rollt herum?`
      case "SPROUT RUN AROUND 2": return `${u} rennt herum?`

      // HAROLD//
      case "HAROLD ATTACK": return `${u} schwingt sein Schwert auf ${t}!` + breakDmgText
      case "HAROLD NOTHING": return `${u} stellt seinen Helm zurecht.`
      case "HAROLD PROTECT": return `${u} schützt sich.`
      case "HAROLD WINK": return `${u} zwinkert ${t} an.\r\n` + state("FROH!", "FROHER!")

      // MARSHA//
      case "MARSHA ATTACK":return `${u} schwingt ihre Axt auf ${t}!${breakDmgText}`
      case "MARSHA NOTHING":return `${u} fällt hin.`
      case "MARSHA SPIN":return `${u} dreht sich in Schallgeschwindigkeit!${breakDmgText}`
      case "MARSHA CHOP":return `${u} knallt ihre Axt auf ${t}!${breakDmgText}`

      // THERESE//
      case "THERESE ATTACK": return `${u} schießt einen Pfeil auf ${t}!` + breakDmgText
      case "THERESE NOTHING": return `${u} lässt einen Pfeil fallen.`
      case "THERESE SNIPE": return `${u} schießt auf ${t}s Schwachstelle!` + breakDmgText

      case "THERESE INSULT": // THERESE INSULT
        text = u + " nennt " + t + " einen Schwachkopf!\r\n"
        if (!target._noEffectMessage) { text += t + " wird WÜTEND!\r\n" } else { text += parseNoEffectEmotion(t, "WÜTENDER!\r\n") }
        text += hpDamageText
        break

      case "DOUBLE SHOT": // THERESE DOUBLE SHOT
        text = u + " schießt zwei Pfeile auf einmal!"
        break

      // LUSCIOUS//
      case "LUSCIOUS ATTACK": // LUSCIOUS ATTACK
        text = u + " versucht einen Zauber zu wirken...\r\n"
        text += u + " macht etwas Magisches!" + breakDmgText
        break

      case "LUSCIOUS NOTHING": // LUSCIOUS NOTHING
        text = u + " versucht einen Zauber zu wirken...\r\n"
        text += "Aber nichts geschieht..."
        break

      case "FIRE MAGIC": // FIRE MAGIC
        text = u + " versucht einen Zauber zu wirken...\r\n"
        text += u + " zündet die Gruppe an!" + breakDmgText
        break

      case "MISFIRE MAGIC": // MISFIRE MAGIC
        text = u + " versucht einen Zauber zu wirken...\r\n"
        text += u + " zündet den Raum an!!!" + breakDmgText
        break

      // HORSE HEAD//
      case "HORSE HEAD ATTACK": // HORSE HEAD ATTACK
        text = u + " beißt " + t + "s Arm." + breakDmgText
        break

      case "HORSE HEAD NOTHING": // HORSE HEAD NOTHING
        text = u + " rülpst."
        break

      case "HORSE HEAD LICK": // HORSE HEAD LICK
        text = u + " leckt " + t + "s Haar" + breakDmgText + "\r\n"
        if (!target._noEffectMessage) { text += t + " wird WÜTEND!" } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      case "HORSE HEAD WHINNY": // HORSE HEAD WHINNY
        text = u + " wiehert fröhlich um sich her!"
        break

      // HORSE BUTT//
      case "HORSE BUTT ATTACK": return `${u} stampft auf ${t}!${breakDmgText}`
      case "HORSE BUTT NOTHING": return `${u} pupst.`
      case "HORSE BUTT KICK": return `${u} kickt ${t}!${breakDmgText}`
      case "HORSE BUTT PRANCE": return `${u} tänzelt herum.`

      // FISH BUNNY//
      case "FISH BUNNY ATTACK": // FISH BUNNY ATTACK
        text = u + " schwimmt auf " + t + " zu!" + breakDmgText
        break

      case "FISH BUNNY NOTHING": // FISH BUNNY NOTHING
        text = u + " schwimmt im Kreis. "
        break

      case "SCHOOLING": // SCHOOLING
        text = u + " ruft nach Freunden! "
        break

      // MAFIA ALLIGATOR//
      case "MAFIA ATTACK": // MAFIA ATTACK
        text = u + " demonstriert " + t + " seine\r\nbissigen Kauratekünste!" + breakDmgText
        break

      case "MAFIA NOTHING": // MAFIA NOTHING
        text = u + " knackst seine Knöchel."
        break

      case "MAFIA ROUGH UP": // MAFIA ROUGH UP
        text = u + " verprügelt " + t + "!" + breakDmgText
        break

      case "MAFIA BACK UP": // MAFIA ALLIGATOR BACKUP
        text = u + " ruft nach Verstärkung!"
        break

      // MUSSEL//
      case "MUSSEL ATTACK": // MUSSEL ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "MUSSEL FLEX": // MUSSEL FLEX
        text = u + " lässt seine Muskeln spielen!\r\n"
        text += u + "'s TREFFERRATE steigt!\r\n"
        break

      case "MUSSEL HIDE": // MUSSEL HIDE
        text = u + " versteckt sich in seiner Schale."
        break

      // REVERSE MERMAID//
      case "REVERSE ATTACK": // REVERSE ATTACK
        text = t + " läuft in " + u + " rein!" + breakDmgText
        break

      case "REVERSE NOTHING": // REVERSE NOTHING
        text = u + " macht einen Rückwertssalto!\r\n"
        text += "WOW!"
        break

      case "REVERSE RUN AROUND": // REVERSE RUN AROUND
        text = "Alle laufen vor " + u + " weg,\r\n"
        text += "aber sie laufen stattdessen rein..." + breakDmgText
        break

      // SHARK FIN//
      case "SHARK FIN ATTACK": // SHARK FIN ATTACK
        text = u + " stürzt sich auf " + t + "!" + breakDmgText
        break

      case "SHARK FIN NOTHING": // SHARK FIN NOTHING
        text = u + " schwimmt im Kreis."
        break

      case "SHARK FIN BITE": // SHARK FIN BITE
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "SHARK WORK UP": // SHARK FIN WORK UP
        text = u + " regt sich auf!\r\n"
        text += u + "s INITIATIVE steigt!\r\n"
        if (!user._noEffectMessage) {
          text += u + " wird WÜTEND!"
        } else { text += parseNoEffectEmotion(u, "WÜTENDER!") }
        break

      // ANGLER FISH//
      case "ANGLER ATTACK": // ANGLER FISH ATTACK
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "ANGLER NOTHING": // ANGLER FISH NOTHING
        text = u + "s Magen knurrt."
        break

      case "ANGLER LIGHT OFF": // ANGLER FISH LIGHT OFF
        text = u + " macht sein Licht aus.\r\n"
        text += u + " verschwindet in der Finsternis."
        break

      case "ANGLER BRIGHT LIGHT": // ANGLER FISH BRIGHT LIGHT
        text = "Alle sehen ihr Leben vor\r\n"
        text += "ihren Augen aufblitzen!"
        break

      case "ANGLER CRUNCH": // ANGLER FISH CRUNCH
        text = u + " spießt " + t + " mit seinen Zähnen auf!" + breakDmgText
        break

      // SLIME BUNNY//
      case "SLIME BUN ATTACK": // SLIME BUNNY ATTACK
        text = u + " schmiegt sich an " + t + "." + breakDmgText
        break

      case "SLIME BUN NOTHING": // SLIME BUN NOTHING
        text = u + " lächelt alle an.\r\n"
        break

      case "SLIME BUN STICKY": // SLIME BUN STICKY
        text = u + " fühlt sich allein und weint.\r\n"
        if (!target._noStateMessage) { text += t + "s INITIATIVE sinkt!\r\n" } else { text += parseNoStateChange(t, "INITIATIVE", "tiefer!\r\n") }
        text += t + " wird TRAURIG."
        break

      // WATERMELON MIMIC//
      case "WATERMELON RUBBER BAND": // WATERMELON MIMIC RUBBER BAND
        text = u + " schleudert ein GUMMIBAND!" + breakDmgText
        break

      case "WATERMELON JACKS": // WATERMELON MIMIC JACKS
        text = u + " verteilt STECKNADELN!" + breakDmgText
        break

      case "WATERMELON DYNAMITE": // WATERMELON MIMIC DYNAMITE
        text = u + " schmeißt DYNAMITE!\r\n"
        text += "OH NO!" + breakDmgText
        break

      case "WATERMELON WATERMELON SLICE": // WATERMELON MIMIC WATERMELON SLICE
        text = u + " wirft MELONENSAFT!" + breakDmgText
        break

      case "WATERMELON GRAPES": // WATERMELON MIMIC GRAPES
        text = u + " wirft TRAUBEN-LIMO!" + breakDmgText
        break

      case "WATEMELON FRENCH FRIES": // WATERMELON MIMIC FRENCH FRIES
        text = u + " wirft POMMES!" + breakDmgText
        break

      case "WATERMELON CONFETTI": // WATERMELON MIMIC CONFETTI
        if (target.index() <= unitLowestIndex) {
          text = u + " wirft KONFETTI!\r\n"
          text += "Alle werden FROH!"
        }
        target._noEffectMessage = undefined
        break

      case "WATERMELON RAIN CLOUD": // WATERMELON MIMIC RAIN CLOUD
        if (target.index() <= unitLowestIndex) {
          text = u + " ruft eine REGENWOLKE herbei!\r\n"
          text += "Alle werden TRAURIG."
        }
        target._noEffectMessage = undefined
        break

      case "WATERMELON AIR HORN": // WATERMELON MIMIC AIR HORN
        if (target.index() <= unitLowestIndex) {
          text = u + " benutzt ein RIESIGES AIR HORN!\r\n"
          text += "Alle werden WÜTEND!"
        }
        target._noEffectMessage = undefined
        break

      // SQUIZZARD//
      case "SQUIZZARD ATTACK": // SQUIZZARD ATTACK
        text = u + " wirkt Magie auf " + t + "!" + breakDmgText
        break

      case "SQUIZZARD NOTHING": // SQUIZZARD NOTHING
        text = u + " murmelt Unsinn."
        break

      case "SQUID WARD": // SQUID WARD
        text = u + " erschafft ein Schild.\r\n"
        text += t + "s VERTEIDIGUNG steigt."
        break

      case "SQUID MAGIC": // SQUID MAGIC
        text = u + " wirkt Tintenfisch-Magie!\r\n"
        text += "Alle fühlen sich komisch..."
        break

      // WORM-BOT//
      case "BOT ATTACK": // MECHA WORM ATTACK
        text = u + " stürzt sich auf " + t + "!" + breakDmgText
        break

      case "BOT NOTHING": // MECHA WORM NOTHING
        text = u + " knirscht laut!"
        break

      case "BOT LASER": // MECHA WORM CRUNCH
        text = u + " schießt einen Laser auf " + t + "!" + breakDmgText
        break

      case "BOT FEED": // MECHA WORM FEED
        text = u + " frisst " + t + "!" + breakDmgText
        break

      // SNOT BUBBLE//
      case "SNOT INFLATE": // SNOT INFLATE
        text = u + "s Schnodder bläst sich auf!\r\n"
        text += t + "s ANGRIFF steigt!"
        break

      case "SNOT POP": // SNOT POP
        text = u + " explodiert!\r\n"
        text += "Schnodder fliegt durch die Gegend!!" + breakDmgText
        break

      // LAB RAT//
      case "LAB ATTACK": // LAB RAT ATTACK
        text = u + " schießt einen kleinen Maus-Laser!" + breakDmgText
        break

      case "LAB NOTHING": // LAB RAT NOTHING
        text = u + " lässt Dampf ab."
        break

      case "LAB HAPPY GAS": // LAB RAT HAPPY GAS
        text = u + " setzt FROH-Gas frei!\r\n"
        text += "Alle werden FROH!"
        target._noEffectMessage = undefined
        break

      case "LAB SCURRY": // LAB RAT SCURRY
        text = u + " schwirrt herum!\r\n"
        break

      // MECHA MOLE//
      case "MECHA MOLE ATTACK": // MECHA MOLE ATTACK
        text = u + " schießt einen Laser auf " + t + "!" + breakDmgText
        break

      case "MECHA MOLE NOTHING": // MECHA MOLE NOTHING
        text = u + "s Augen leuchten ein wenig."
        break

      case "MECHA MOLE EXPLODE": // MECHA MOLE EXPLODE
        text = u + " vergießt eine einzelne Träne.\r\n"
        text += u + " explodiert glorreich!"
        break

      case "MECHA MOLE STRANGE LASER": // MECHA MOLE STRANGE LASER
        text = u + "s strahlt ein komisches\r\n"
        text += "Licht aus. " + t + " fühlt sich komisch."
        break

      case "MECHA MOLE JET PACK": // MECHA MOLE JET PACK
        text = "Ein Jetpack erscheint auf " + u + "!\r\n"
        text += u + " fliegt durch alle!"
        break

      // CHIMERA CHICKEN//
      case "CHICKEN RUN AWAY": // CHIMERA CHICKEN RUN AWAY
        text = u + " rennt weg."
        break

      case "CHICKEN NOTHING": // CHICKEN DO NOTHING
        text = u + " gackert. "
        break

      // SALLI//
      case "SALLI ATTACK": // SALLI ATTACK
        text = u + " rennt in " + t + " rein!" + breakDmgText
        break

      case "SALLI NOTHING": // SALLI NOTHING
        text = u + " macht einen kleinen Salto!"
        break

      case "SALLI INITIATIVE UP": // SALLI INITIATIVE UP
        text = u + " rast durch den Raum!\r\n"
        if (!target._noStateMessage) {
          text += u + "s INITIATIVE steigt!"
        } else { text += parseNoStateChange(u, "INITIATIVE", "höher!") }
        break

      case "SALLI DODGE ANNOY": // SALLI STARE
        text = u + " fokussiert sich intensiv! "
        break

      // CINDI//
      case "CINDI ATTACK": // CINDI ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "CINDI NOTHING": // CINDI NOTHING
        text = u + " dreht sich im Kreis."
        break

      case "CINDI SLAM": // CINDI SLAM
        text = u + " schlägt ihren Arm auf " + t + "!" + breakDmgText
        break

      case "CINDI COUNTER ATTACK": // CINDI COUNTER ATTACK
        text = u + " bereitet sich vor!"
        break

      // DOROTHI//
      case "DOROTHI ATTACK": // DOROTHI ATTACK
        text = u + " stampft auf " + t + "!" + breakDmgText
        break

      case "DOROTHI NOTHING": // DOROTHI NOTHING
        return u + " weint in der Finsternis."

      case "DOROTHI KICK": // DOROTHI KICK
        text = u + " kickt " + t + "!" + breakDmgText
        break

      case "DOROTHI HAPPY": return u + " tänzelt herum!"

      // NANCI//
      case "NANCI ATTACK": // NANCI ATTACK
        text = u + " sticht ihre Krallen in " + t + "!" + breakDmgText
        break

      case "NANCI NOTHING": return u + " schwankt hin und her."
      case "NANCI ANGRY": return u + " kocht vor Wut!"

      // MERCI//
      case "MERCI ATTACK": // MERCI ATTACK
        text = u + " berührt " + t + "s Brust.\r\n"
        text += `${t} fühlt, wie sich ${t === "AUBREY" ? "ihre" : "seine"} Organe zerreißen!\r\n'`
        text += hpDamageText
        break

      case "MERCI NOTHING": return u + " lächelt unheimlich."

      case "MERCI MELODY": // MERCI LAUGH
        text = u + " singt ein Lied.\r\n"
        text += t + " hört eine bekannte Melodie.\r\n"
        text += getStateEffect(target) + "\r\n"
        break

      case "MERCI SCREAM": // MERCI SCREAM
        text = u + " gibt einen entsetzlichen Schrei von sich!" + breakDmgText
        break

      // LILI//
      case "LILI ATTACK": // LILI ATTACK
        text = u + " starrt in " + t + "s Seele!" + breakDmgText
        break

      case "LILI NOTHING": return u + " zwinkert."

      case "LILI MULTIPLY": // LILI MULTIPLY
        text = u + "s Auge fällt raus!\r\n"
        text += "Das Auge wurde zu einem weiteren " + u + "!"
        break

      case "LILI CRY": // LILI CRY
        text = "Tränen sammeln sich in " + u + "s Augen.\r\n"
        text += t + " wird TRAURIG."
        break

      case "LILI SAD EYES": // LILI SAD EYES
        text = t + " sieht Betrübtheit in " + u + "s Augen.\r\n"
        text += t + " will " + u + " nicht angreifen.\r\n"
        break

      // HOUSEFLY//
      case "HOUSEFLY ATTACK": // HOUSEFLY ATTACK
        text = u + " landet auf " + t + "s Gesicht.\r\n"
        text += t + " schlägt sich selbst ins Gesicht!" + breakDmgText
        break

      case "HOUSEFLY NOTHING": return u + " schwirrt umher!"

      case "HOUSEFLY ANNOY": // HOUSEFLY ANNOY
        text = u + " summt an " + t + "s Ohr!\r\n"
        if (!target._noEffectMessage) { text += t + " wird WÜTEND!" } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      // RECYCLIST//
      case "FLING TRASH": // FLING TRASH
        text = u + " schleudert MÜLL auf " + t + "!" + breakDmgText
        break

      case "GATHER TRASH": // GATHER TRASH
        text = u + " findet MÜLL auf dem Boden\r\n"
        text += "und kehrt ihn in seinen Sack!" + breakDmgText
        break

      case "RECYCLIST CALL FOR FRIENDS": return u + " ruft nach RECYCULTISTs!!"

      // STRAY DOG//
      case "STRAY DOG ATTACK": // STRAY DOG ATTACK
        text = u + " führt einen Beißangriff aus!" + breakDmgText
        break

      case "STRAY DOG HOWL": return u + " lässt ein schrilles Geheul raus!"

      // CROW//
      case "CROW ATTACK":
        text = u + " pecks at " + t + "s eyes." + breakDmgText
        break

      case "CROW GRIN": return u + " has a big grin on his face."
      case "CROW STEAL": return u + " steals something!"

      // BEE //
      case "BEE ATTACK":
        text = u + " sticht " + t + "." + breakDmgText
        break

      case "BEE NOTHING": return u + " fliegt schnell durch die Gegend!"

      // GHOST BUNNY //
      case "GHOST BUNNY ATTACK": // GHOST BUNNY ATTACK
        text = u + " dringt durch " + t + "!\r\n"
        text += t + " wird müde.\r\n"
        text += mpDamageText
        break

      case "GHOST BUNNY NOTHING": return u + " fliegt auf der Stelle."

      // TOAST GHOST//
      case "TOAST GHOST ATTACK": // TOAST GHOST ATTACK
        text = u + " dringt durch " + t + "!\r\n"
        text += t + " wird müde." + breakDmgText
        break

      case "TOAST GHOST NOTHING": return u + " macht ein gruseliges Geräusch."

      // SPROUT BUNNY//
      case "SPROUT BUNNY ATTACK": // SPROUT BUNNY ATTACK
        text = u + " schlägt " + t + "." + breakDmgText
        break

      case "SPROUT BUNNY NOTHING": return u + " knabbert an Gras."

      case "SPROUT BUNNY FEED": // SPROUT BUNNY FEED
        text = u + " verspeist " + t + ".\r\n"
        text += `${u} regeneriert ${Math.abs(hpDamage)} HERZ!`
        break

      // CELERY//
      case "CELERY ATTACK":
        text = u + " rammt sich in " + t + "." + breakDmgText
        break

      case "CELERY NOTHING": return u + " fällt hin."

      // CILANTRO//
      case "CILANTRO ATTACK":
        text = u + " haut " + t + "." + breakDmgText
        break

      case "CILANTRO NOTHING": return u + " denkt über sein Leben nach."

      case "GARNISH": // CILANTRO GARNISH
        text = u + " opfert sich, um\r\n"
        text += t + " zu verbessern."
        break

      // GINGER//
      case "GINGER ATTACK":
        text = u + " dreht durch und greift " + t + " an." + breakDmgText
        break

      case "GINGER NOTHING": return u + " findet inneren Frieden."
      case "GINGER SOOTHE": return u + " beruhigt " + t + ".\r\n"

      // YE OLD MOLE//
      case "YE OLD ROLL OVER": // MEGA SPROUT MOLE ROLL OVER
        text = u + " wälzt sich über alle!"
        text += hpDamageText
        break

      // KITE KID//
      case "KITE KID ATTACK":
        text = u + " wirft STECKNADELN\r\nauf " + t + "!" + breakDmgText
        break

      case "KITE KID BRAG":
        text = u + " prahlt mit dem KINDESDRACHEN!\r\n"
        if (!target._noEffectMessage) {
          text += t + " wird FROH!"
        } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "REPAIR":
        text = u + " verbindet den KINDESDRACHEN!\r\n"
        text += "KINDESDRACHEN fühlt sich wie neu!"
        break

      // KID'S KITE//
      case "KIDS KITE ATTACK":
        text = u + " stürzt sich auf " + t + "!" + breakDmgText
        break

      case "KITE NOTHING": return u + " ist übermütig!"
      case "FLY 1": return u + " fliegt weit hoch!"
      case "FLY 2": return u + " schießt herab!!"

      // PLUTO//
      case "PLUTO NOTHING": return u + " posiert!\r\n"

      case "PLUTO HEADBUTT": // PLUTO HEADBUTT
        text = u + " springt auf " + t + " zu!" + breakDmgText
        break

      case "PLUTO BRAG": // PLUTO BRAG
        text = u + " prahlt mit seinen Muskeln!\r\n"
        if (!user._noEffectMessage) {
          text += u + " wird FROH!"
        } else { text += parseNoEffectEmotion(u, "FROHER!") }
        break

      case "PLUTO EXPAND": // PLUTO EXPAND
        text = u + " kräftigt sich!!\r\n"
        if (!target._noStateMessage) {
          text += u + "s ANGRIFF and VERTEIDIGUNG steigt!!\r\n"
          text += u + "s INITIATIVE sinkt."
        } else {
          text += parseNoStateChange(u, "ATTACK", "höher!\r\n")
          text += parseNoStateChange(u, "VERTEIDIGUNG", "höher!\r\n")
          text += parseNoStateChange(u, "INITIATIVE", "tiefer!")
        }
        break

      case "EXPAND NOTHING": // PLUTO NOTHING
        text = u + "s Muskeln\r\n"
        text += "schüchtern dich ein."
        break

      // RIGHT ARM//
      case "R ARM ATTACK": // R ARM ATTACK
        text = u + " schlägt " + t + "!" + breakDmgText
        break

      case "GRAB": // GRAB
        text = u + " packt " + t + "!\r\n"
        text += t + "s INITIATIVE sinkt." + breakDmgText
        break

      // LEFT ARM//
      case "L ARM ATTACK": // L ARM ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "POKE": // POKE
        text = u + " stupst " + t + " an!\r\n"
        if (!target._noEffectMessage) {
          text += t + " wird WÜTEND!\r\n"
        } else { text += parseNoEffectEmotion(t, "WÜTENDER!\r\n") }
        text += hpDamageText
        break

      // DOWNLOAD WINDOW//
      case "DL DO NOTHING": // DL DO NOTHING
        return u + " ist bei 99%."

      case "DL DO NOTHING 2": // DL DO NOTHING 2
        return u + " ist immernoch bei 99%..."

      case "DOWNLOAD ATTACK": // DOWNLOAD ATTACK
        return u + " stürzt ab und brennt!"

      // SPACE EX-BOYFRIEND//
      case "SXBF ATTACK": // SXBF ATTACK
        text = u + " kickt " + t + "!" + breakDmgText
        break

      case "SXBF NOTHING": // SXBF NOTHING
        text = u + " schaut wehmütig\r\n"
        text += "into the distance."
        break

      case "ANGRY SONG": // ANGRY SONG
        return u + " jammert ungemein!"

      case "ANGSTY SONG": // ANGSTY SONG
        text = u + " singt betrübt...\r\n"
        text += getStateEffect(target)
        break

      case "BIG LASER": // BIG LASER
        text = u + " schießt seinen Laser!" + breakDmgText
        break

      case "BULLET HELL": // BULLET HELL
        text = u + " schießt aus\r\n"
        text += "Verzweiflung wild herum!"
        break

      case "SXBF DESPERATE": // SXBF NOTHING
        text = u + "\r\n"
        text += "knirscht mit seinen Zähnen!"
        break

      // THE EARTH//
      case "EARTH ATTACK": // EARTH ATTACK
        text = u + " greift " + t + " an!" + breakDmgText
        break

      case "EARTH NOTHING": // EARTH NOTHING
        return u + " dreht sich langsam."

      case "EARTH CRUEL": // EARTH CRUEL
        text = u + " ist gemein zu " + t + "!\r\n"
        text += getStateEffect(target)
        break

      case "CRUEL EPILOGUE": // EARTH CRUEL
        if (target.index() <= unitLowestIndex) {
          text = u + " ist gemein zu allen...\r\n"
          text += "Alle werden TRAURIG."
        }
        break

      case "PROTECT THE EARTH": // PROTECT THE EARTH
        text = u + " entfacht ihren stärksten Angriff!"
        break

      // SPACE BOYFRIEND//
      case "SBF ATTACK": // SPACE BOYFRIEND ATTACK
        text = u + " kickt " + t + " geschwind!" + breakDmgText
        break

      case "SBF LASER": // SPACE BOYFRIEND LASER
        text = u + " schießt seinen Laser!" + breakDmgText
        break

      case "SBF CALM DOWN": // SPACE BOYFRIEND CALM DOWN
        text = u + " bekommt seinen Kopf\r\n"
        text += "frei und entfernt alle EMOTIONEN."
        break

      case "SBF ANGRY SONG": // SPACE BOYFRIEND ANGRY SONG
        if (target.index() <= unitLowestIndex) {
          text = u + " jammert voller Wut!\r\n"
          text += "Alle werden WÜTEND!\r\n"
        }
        text += hpDamageText
        break

      case "SBF ANGSTY SONG": // SPACE BOYFRIEND ANGSTY SONG
        if (target.index() <= unitLowestIndex) {
          text = u + " singt mit all der\r\n"
          text += "Finsternis in seiner Seele!\r\n"
          text += "Alle werden TRAURIG.\r\n"
        }
        text += mpDamageText
        break

      case "SBF JOYFUL SONG": // SPACE BOYFRIEND JOYFUL SONG
        if (target.index() <= unitLowestIndex) {
          text = u + " singt mit all der\r\n"
          text += "Freude in seinem Herzen!\r\n"
          text += "Alle werden FROH!\r\n"
        }
        text += hpDamageText
        break

      // NEFARIOUS CHIP//
      case "EVIL CHIP ATTACK": // NEFARIOUS CHIP ATTACK
        text = u + " stürzt sich auf " + t + "!" + breakDmgText
        break

      case "EVIL CHIP NOTHING": // NEFARIOUS CHIP NOTHING
        text = u + " streicht seinen\r\n"
        text += "bösen Bart!"
        break

      case "EVIL LAUGH": // NEFARIOUS LAUGH
        text = u + " lacht mit all\r\n"
        text += "seiner Zwietracht!\r\n"
        if (!target._noEffectMessage) { text += t + " wird FROH!" } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "EVIL COOKIES": // NEFARIOUS COOKIES
        text = u + " bewirft alle mit HAFERKEKSEN!\r\n"
        text += "Wie gemein!"
        break

      // BISCUIT AND DOUGHIE//
      case "BD ATTACK": // BISCUIT AND DOUGHIE ATTACK
        text = u + " greifen gemeinsam an!" + breakDmgText
        break

      case "BD NOTHING": // BISCUIT AND DOUGHIE NOTHING
        text = u + " haben etwas\r\n"
        text += "im Ofen vergessen!"
        break

      case "BD BAKE BREAD": // BISCUIT AND DOUGHIE BAKE BREAD
        text = u + " holen BROT\r\n"
        text += "aus dem Ofen!"
        break

      case "BD COOK": // BISCUIT AND DOUGHIE CHEER UP
        text = u + " macht einen Keks!\r\n"
        text += `${t} regeneriert ${Math.abs(hpDamage)}\r\nHERZ!`
        break

      case "BD CHEER UP": // BISCUIT AND DOUGHIE CHEER UP
        text = u + " versuchen ihr\r\n"
        text += "Bestes, nicht TRAURIG zu sein."
        break

      // KING CRAWLER//
      case "KC ATTACK": // KING CRAWLER ATTACK
        text = u + " stürzt sich auf " + t + "!" + breakDmgText
        break

      case "KC NOTHING": // KING CRAWLER NOTHING
        text = u + " gibt einen ohren-\r\n"
        text += "betäubenden Schrei von sich!\r\n"
        if (!target._noEffectMessage) {
          text += t + " wird WÜTEND!"
        } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      case "KC CONSUME": // KING CRAWLER CONSUME
        text = u + " frisst einen\r\n"
        text += "VERIRRTEN SPROSSWURF!\r\n"
        text += `${t} regeneriert ${Math.abs(hpDamage)} HERZ!\r\n`
        break

      case "KC RECOVER": // KING CRAWLER CONSUME
        text = `${t} regeneriert ${Math.abs(hpDamage)} HERZ!\r\n`
        if (!target._noEffectMessage) { text += t + " wird FROH!" } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "KC CRUNCH": // KING CRAWLER CRUNCH
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "KC RAM": // KING CRAWLER RAM
        text = u + " rennt durch die Gruppe!" + breakDmgText
        break

      // KING CARNIVORE//
      case "SWEET GAS":
        if (target.index() <= unitLowestIndex) {
          text = u + " setzt Gas frei!\r\n"
          text += "Es riecht süßlich!\r\n"
          text += "Alle werden FROH!"
        }
        target._noEffectMessage = undefined
        break

      // SPROUTMOLE LADDER//
      case "SML NOTHING": // SPROUT MOLE LADDER NOTHING
        return u + " steht felsenfest herum. "

      case "SML SUMMON MOLE": // SPROUT MOLE LADDER SUMMON SPROUT MOLE
        return "Ein SPROSSWURF klettert " + u + " hoch!"

      case "SML REPAIR": // SPROUT MOLE LADDER REPAIR
        return u + " wurde repariert."

      // UGLY PLANT CREATURE//
      case "UPC ATTACK": // UGLY PLANT CREATURE ATTACK
        text = u + " verwickelt\r\n"
        text += t + " in Ranken!" + breakDmgText
        break

      case "UPC NOTHING": // UGLY PLANT CRATURE NOTHING
        return u + " brüllt!"

      // ROOTS//
      case "ROOTS NOTHING": // ROOTS NOTHING
        return u + " wackelt herum."

      case "ROOTS HEAL": // ROOTS HEAL
        text = u + " versorgt\r\n"
        text += t + " mit Nährstoffen."
        break

      // BANDITO MOLE//
      case "BANDITO ATTACK": // BANDITO ATTACK
        text = u + " schlitzt " + t + "!" + breakDmgText
        break

      case "BANDITO STEAL": // BANDITO STEAL
        text = u + " klaut geschwind ein\r\n"
        text += "Item von der Gruppe!"
        break

      case "B.E.D.": // B.E.D.
        text = u + " zuckt das B.E.D.!" + breakDmgText
        break

      // SIR MAXIMUS//
      case "MAX ATTACK": // SIR MAXIMUS ATTACK
        text = u + " schwingt sein Schwert!" + breakDmgText
        break

      case "MAX NOTHING": // SIR MAXIMUS NOTHING
        text = u + " zieht sich zurück...\r\n"
        if (!target._noEffectMessage) {
          text += t + " wird TRAURIG."
        } else { text += parseNoEffectEmotion(t, "TRAURIGER!") }
        break

      case "MAX STRIKE": // SIR MAXIMUS SWIFT STRIKE
        return u + " greift zweimal an!"

      case "MAX ULTIMATE ATTACK": // SIR MAXIMUS ULTIMATE ATTACK
        text = "\"ZEIT FÜR MEINEN ULTIMATIVEN ANGRIFF!\""
        text += hpDamageText
        break

      case "MAX SPIN": // SIR MAXIMUS SPIN
        break

      // SIR MAXIMUS II//
      case "MAX 2 NOTHING": // SIR MAXIMUS II NOTHING
        text = u + " erinnert sich an\r\n"
        text += "die letzten Worte seines Vaters.\r\n"
        if (!target._noEffectMessage) {
          text += t + " wird TRAURIG."
        } else { text += parseNoEffectEmotion(t, "TRAURIGER!") }
        break

      // SIR MAXIMUS III//
      case "MAX 3 NOTHING": // SIR MAXIMUS III NOTHING
        text = u + " erinnert sich an\r\n"
        text += "die letzten Worte seines Großvaters.\r\n"
        text += t + " wird TRAURIG."
        break

      // SWEETHEART//
      case "SH ATTACK": // SWEET HEART ATTACK
        text = u + " schlägt " + t + "." + breakDmgText
        break

      case "SH INSULT": // SWEET HEART INSULT
        if (target.index() <= unitLowestIndex) {
          text = u + " beleidigt alle!\r\n"
          text += "Alle werden WÜTEND!\r\n"
        }
        text += hpDamageText
        target._noEffectMessage = undefined
        break

      case "SH SNACK": // SWEET HEART SNACK
        text = u + " fordert von ihren\r\n"
        text += "Dienern einen SNACK." + breakDmgText
        break

      case "SH SWING MACE": // SWEET HEART SWING MACE
        text = u + " schwingt eifrig ihren Morgenstern!" + breakDmgText
        break

      case "SH BRAG": // SWEET HEART BRAG
        text = u + " prahlt über\r\n"
        text += "eines ihrer vielen, vielen Talente!\r\n"
        if (!target._noEffectMessage) {
          text += getStateEffect(target)
        } else { text += parseNoEffectEmotion(t, "FROHER!") }

        break

      // MR. JAWSUM //
      case "DESK SUMMON MINION": // MR. JAWSUM DESK SUMMON MINION
        text = u + " geht ans Telefon und\r\n"
        text += "ruft einen KROKO-KERL!"
        break

      case "JAWSUM ATTACK ORDER":
        if (target.index() <= unitLowestIndex) {
          text = u + " gibt ein Kommando!\r\n"
          text += "Alle werden WÜTEND!"
        }
        break

      case "DESK NOTHING": // MR. JAWSUM DESK DO NOTHING
        return u + " fängt an,\r\nMUSCHELN zu zählen."

      // PLUTO EXPANDED//
      case "EXPANDED ATTACK": // PLUTO EXPANDED ATTACK
        text = u + " wirft den Mond auf\r\n"
        text += t + "!" + breakDmgText
        break

      case "EXPANDED SUBMISSION HOLD": // PLUTO EXPANDED SUBMISSION HOLD
        text = u + " nimmt " + t + "\r\n"
        text += "in einen Würgegriff!\r\n"
        text += t + "s INITIATIVE sinkt." + breakDmgText
        break

      case "EXPANDED HEADBUTT": // PLUTO EXPANDED HEADBUTT
        text = u + " verpasst\r\n"
        text += t + " einen Kopfstoß!" + breakDmgText
        break

      case "EXPANDED FLEX COUNTER": // PLUTO EXPANDED FLEX COUNTER
        text = u + " spannt seine Muskeln\r\n"
        text += "an und bereitet sich vor!"
        break

      case "EXPANDED EXPAND FURTHER": // PLUTO EXPANDED EXPAND FURTHER
        text = u + " expandiert noch weiter!\r\n"
        if (!target._noStateMessage) {
          text += t + "s ANGRIFF steigt!\r\n"
          text += t + "s VERTEIDIGUNG steigt!\r\n"
          text += t + "s INITIATIVE sinkt."
        } else {
          text += parseNoStateChange(u, "ATTACK", "höher!\r\n")
          text += parseNoStateChange(u, "VERTEIDIGUNG", "höher!\r\n")
          text += parseNoStateChange(u, "INITIATIVE", "tiefer!")
        }
        break

      case "EXPANDED EARTH SLAM": // PLUTO EXPANDED EARTH SLAM
        text = u + " ergreift die Erde\r\n"
        text += "und rammt sie in alle hinein!"
        break

      case "EXPANDED ADMIRATION": // PLUTO EXPANDED ADMIRATION
        text = u + " bewundert KELs Fortschritt!\r\n"
        text += getStateEffect(target)
        break

      // ABBI TENTACLE//
      case "TENTACLE ATTACK": // ABBI TENTACLE ATTACK
        text = u + " knallt auf " + t + "!" + breakDmgText
        break

      case "TENTACLE TICKLE": // ABBI TENTACLE TICKLE
        text = u + " schwächt " + t + "!\r\n"
        text += `${t} wird unachtsam!`
        break

      case "TENTACLE GRAB": // ABBI TENTACLE GRAB
        text = u + " wickelt sich um " + t + "!\r\n"
        if (result.isHit()) {
          if (t !== "OMORI" && !target._noEffectMessage) { text += t + " wird ÄNGSTLICH.\r\n" } else { text += parseNoEffectEmotion(t, "AFRAID") }
        }
        text += hpDamageText
        break

      case "TENTACLE GOOP": // ABBI TENTACLE GOOP
        text = t + " ist voller dunkler Flüssigkeit!\r\n"
        text += t + " fühlt sich schwächer...\r\n"
        text += t + "s ANGRIFF sinkt.\r\n"
        text += t + "s VERTEIDIGUNG sinkt.\r\n"
        text += t + "s INITIATIVE sinkt."
        break

      // ABBI//
      case "ABBI ATTACK": // ABBI ATTACK
        text = u + " greift " + t + " an!" + breakDmgText
        break

      case "ABBI REVIVE TENTACLE": // ABBI REVIVE TENTACLE
        return u + " fokussiert ihr HERZ."

      case "ABBI VANISH": // ABBI VANISH
        return u + " verschwindet im Schatten..."

      case "ABBI ATTACK ORDER":
        if (target.index() <= unitLowestIndex) {
          text = u + " streckt ihre Tentakel.\r\n"
          text += "ANGRIFF von allen steigt!!\r\n"
          text += "Alle werden WÜTEND!"
        }
        break

      case "ABBI COUNTER TENTACLE": // ABBI COUNTER TENTACLES
        return u + " bewegt sich durch die Schatten..."

      // ROBO HEART//
      case "ROBO HEART ATTACK": // ROBO HEART ATTACK
        text = u + " schießt Raketenhände!" + breakDmgText
        break

      case "ROBO HEART NOTHING": // ROBO HEART NOTHING
        text = u + " lädt..."
        break

      case "ROBO HEART LASER": // ROBO HEART LASER
        text = u + " öffnet ihren Mund und\r\n"
        text += "schießt einen Laser!" + breakDmgText
        break

      case "ROBO HEART EXPLOSION": // ROBO HEART EXPLOSION
        text = u + " vergießt eine einzelne Roboterträne.\r\n"
        text += u + " explodiert!"
        break

      case "ROBO HEART SNACK": // ROBO HEART SNACK
        text = u + " öffnet ihren Mund.\r\n"
        text += "Ein nährreicher SNACK erscheint!" + breakDmgText
        break

      // MUTANT HEART//
      case "MUTANT HEART ATTACK": // MUTANT HEART ATTACK
        text = u + " singt " + t + " ein Lied!\r\n"
        text += "Es war nicht sehr gut..." + breakDmgText
        break

      case "MUTANT HEART NOTHING": // MUTANT HEART NOTHING
        text = u + " posiert!"
        break

      case "MUTANT HEART HEAL": // MUTANT HEART HEAL
        text = u + " stellt ihr Kleid zurecht!"
        text += hpDamageText
        break

      case "MUTANT HEART WINK": // MUTANT HEART WINK
        text = u + " zwinkert " + t + " an!\r\n"
        text += "Irgendwie süß...\r\n"
        if (!target._noEffectMessage) { text += t + " wird FROH!" } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "MUTANT HEART INSULT": // MUTANT HEART INSULT
        text = u + " sagt aus Versehen\r\n"
        text += "etwas Gemeines.\r\n"
        if (!target._noEffectMessage) { text += t + " wird WÜTEND!" } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      case "MUTANT HEART KILL": // MUTANT HEART KILL
        text = "MUTANTHEART schlägt " + u + "!" + breakDmgText
        break

        // PERFECT HEART//
      case "PERFECT STEAL HEART": // PERFECT HEART STEAL HEART
        text = u + " stielt " + t + "s\r\n"
        text += "HERZ." + breakDmgText + "\r\n"
        if (user.result().hpDamage < 0) { text += `${u} regeneriert ${Math.abs(user.result().hpDamage)} HERZ!\r\n` }
        break

      case "PERFECT STEAL BREATH": // PERFECT HEART STEAL BREATH
        text = u + " raubt " + t + "s\r\n"
        text += "den Atem.\r\n"
        text += mpDamageText + "\r\n"
        if (user.result().mpDamage < 0) { text += `${u} regeneriert ${Math.abs(user.result().mpDamage)} SAFT...\r\n` }
        break

      case "PERFECT EXPLOIT EMOTION": // PERFECT HEART EXPLOIT EMOTION
        text = u + " nutzt " + t + "s\r\n"
        text += "EMOTIONEN aus!" + breakDmgText
        break

      case "PERFECT SPARE": // PERFECT SPARE
        text = u + " entscheidet sich,\r\n"
        text += t + " am Leben zu lassen." + breakDmgText
        break

      case "PERFECT ANGELIC VOICE": // UPLIFTING HYMN
        if (target.index() <= unitLowestIndex) {
          text = u + " singt ein gefühlsvolles Lied...\r\n"
          if (!user._noEffectMessage) { text += u + " wird TRAURIG.\r\n" } else { text += parseNoEffectEmotion(u, "TRAURIGER!\r\n") }
          text += "Alle werden FROH!"
        }
        break

      case "PERFECT ANGELIC WRATH":
        if (target.index() <= unitLowestIndex) { text = u + " entfacht ihren Zorn.\r\n" }
        if (!target._noEffectMessage) {
          target += getStateEffect(target) + "\r\n"
        } else {
          if (target.isEmotionAffected("happy")) { text += parseNoEffectEmotion(t, "FROHER!\r\n") } else if (target.isEmotionAffected("sad")) { text += parseNoEffectEmotion(t, "TRAURIGER!\r\n") } else if (target.isEmotionAffected("angry")) { text += parseNoEffectEmotion(t, "WÜTENDER!\r\n") }
        }
        text += hpDamageText
        break

      // SLIME GIRLS//
      case "SLIME GIRLS COMBO ATTACK": // SLIME GIRLS COMBO ATTACK
        text = "The " + u + " greifen gleichzeitig an!" + breakDmgText
        break

      case "SLIME GIRLS DO NOTHING": // SLIME GIRLS DO NOTHING
        text = "MEDUSA wirft eine Flasche...\r\n"
        text += "Aber nichts geschieht..."
        break

      case "SLIME GIRLS STRANGE GAS": // SLIME GIRLS STRANGE GAS
        if (!target._noEffectMessage) {
          target += getStateEffect(target) + "\r\n"
        } else {
          if (target.isEmotionAffected("happy")) { text += parseNoEffectEmotion(t, "FROHER!\r\n") } else if (target.isEmotionAffected("sad")) { text += parseNoEffectEmotion(t, "TRAURIGER!\r\n") } else if (target.isEmotionAffected("angry")) { text += parseNoEffectEmotion(t, "WÜTENDER!\r\n") }
        }
        break

      case "SLIME GIRLS DYNAMITE": // SLIME GIRLS DYNAMITE
        // text = 'MEDUSA threw a bottle...\r\n';
        // text += 'And it explodiert!\r\n';
        return hpDamageText

      case "SLIME GIRLS STING RAY": // SLIME GIRLS STING RAY
        text = "MOLLY schießt ihre Stacheln!\r\n"
        text += t + " wird getroffen!" + breakDmgText
        break

      case "SLIME GIRLS SWAP": // SLIME GIRLS SWAP
        text = "MEDUSA macht ihr Ding!\r\n"
        text += "Dein HERZ und SAFT wurde vertauscht!"
        break

      case "SLIME GIRLS CHAIN SAW": // SLIME GIRLS CHAIN SAW
        text = "MARINA zückt eine Kettensäge!" + breakDmgText
        break

      // HUMPHREY SWARM//
      case "H SWARM ATTACK": // HUMPHREY SWARM ATTACK
        return `HUMPREY umzingelt ${t} und greift ${pronoun} an!\r\n` + hpDamageText

      // HUMPHREY LARGE//
      case "H LARGE ATTACK": // HUMPHREY LARGE ATTACK
        return `HUMPHREY rammt sich in ${t}!\r\n` + hpDamageText

      // HUMPHREY FACE//
      case "H FACE CHOMP": // HUMPHREY FACE CHOMP
        text = "HUMPHREY beißt sich in " + t + " ein!" + breakDmgText
        break

      case "H FACE DO NOTHING": // HUMPHREY FACE DO NOTHING
        text = "HUMPHREY starrt " + t + " an!\r\n"
        text += "HUMPHREYs läuft das Wasser im Mund zusammen."
        break

      case "H FACE HEAL": // HUMPHREY FACE HEAL
        text = "HUMPHREY verschlingt einen Gegner!\r\n"
        text += `HUMPHREY regeneriert ${Math.abs(hpDamage)} HERZ!`
        break

      // HUMPHREY UVULA//
      case "UVULA DO NOTHING 1": // HUMPHREY UVULA DO NOTHING
        return u + " grinst " + t + " an.\r\n"

      case "UVULA DO NOTHING 2": // HUMPHREY UVULA DO NOTHING
        return u + " zwinkert " + t + " an.\r\n"

      case "UVULA DO NOTHING 3": // HUMPHREY UVULA DO NOTHING
        return u + " spuckt auf " + t + ".\r\n"

      case "UVULA DO NOTHING 4": // HUMPHREY UVULA DO NOTHING
        return u + " starrt " + t + " an.\r\n"

      case "UVULA DO NOTHING 5": // HUMPHREY UVULA DO NOTHING
        return u + " blinzelt " + t + " an.\r\n"

      // FEAR OF FALLING//
      case "DARK NOTHING": // SOMETHING IN THE DARK NOTHING
        text = u + " verhöhnt " + t + "\r\n"
        text += "während er fällt."
        break

      case "DARK ATTACK": // SOMETHING IN THE DARK ATTACK
        text = u + " schubst " + t + "." + breakDmgText
        break

      // FEAR OF BUGS//
      case "BUGS ATTACK": // FEAR OF BUGS ATTACK
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "BUGS NOTHING": // FEAR OF BUGS NOTHING
        return u + " versucht, mit dir zu reden..."

      case "SUMMON BABY SPIDER": // SUMMON BABY SPIDER
        text = "Ein Spinnen-Ei schlüpft\r\n"
        text += "Eine BABY-SPINNE erscheint."
        break

      case "BUGS SPIDER WEBS": // FEAR OF BUGS SPIDER WEBS
        text = u + " verwickelt " + t + "\r\n"
        text += "in klebrigen Netzen.\r\n"
        text += t + "s INITIATIVE sinkt!\r\n"
        break

      // BABY SPIDER//
      case "BABY SPIDER ATTACK": // BABY SPIDER ATTACK
        text = u + " beißt " + t + "!" + breakDmgText
        break

      case "BABY SPIDER NOTHING": // BABY SPIDER NOTHING
        return u + " macht ein komisches Geräusch."

      // FEAR OF DROWNING//
      case "DROWNING ATTACK": // FEAR OF DROWNING ATTACK
        text = "Wasser zieht " + t + " in verschiedene\r\n"
        text += "Richtungen." + breakDmgText
        break

      case "DROWNING NOTHING": // FEAR OF DROWNING NOTHING
        return u + " hört " + t + "s Qualen zu."

      case "DROWNING DRAG DOWN": // FEAR OF DROWNING DRAG DOWN
        // text = userName + ' grabs\r\n';
        // text += targetName + '\s leg and drags him down!\r\n';
        return hpDamageText

      // OMORI'S SOMETHING//
      case "O SOMETHING ATTACK": // OMORI SOMETHING ATTACK
        text = u + " greift durch " + t + "." + breakDmgText
        break

      case "O SOMETHING NOTHING": // OMORI SOMETHING NOTHING
        return u + " sieht durch " + t + ".\r\n"

      case "O SOMETHING BLACK SPACE": // OMORI SOMETHING BLACK SPACE
        // text = userName + ' drags ' + targetName + ' into\r\n';
        // text += 'the shadows.';
        return hpDamageText

      case "O SOMETHING SUMMON": // OMORI SOMETHING SUMMON SOMETHING
        text = u + " ruft etwas aus\r\n"
        text += "der Finsternis."
        break

      case "O SOMETHING RANDOM EMOTION": // OMORI SOMETHING RANDOM EMOTION
        return u + " spielt mit " + t + "s EMOTIONEN."

      // BLURRY IMAGE//
      case "BLURRY NOTHING": return "ETWAS flattert im Wind."

      // HANGING BODY//
      case "HANG WARNING": return "Du spürst, wie ein Schauer über den Rücken läuft."
      case "HANG NOTHING 1": return "Dir wird schwindlig."
      case "HANG NOTHING 2": return "Du spürst, wie sich deine Lungen\r\nzusammenziehen."
      case "HANG NOTHING 3": return "Du spürst etwas in deinen Magen\r\nversinken."
      case "HANG NOTHING 4": return "Du spürst, wie dein Herz rast."
      case "HANG NOTHING 5": return "Du spürst, wie du zitterst."
      case "HANG NOTHING 6": return "Du spürst, wie deine Knie\r\nnachlassen."
      case "HANG NOTHING 7": return "Du spürst, wie Schweiß von deiner\r\nStirn tropft."
      case "HANG NOTHING 8": return "Du spürst, wie sich deine Faust\r\nvon selber ballt."
      case "HANG NOTHING 9": return "Du hörst dein Herz schlagen."
      case "HANG NOTHING 10": return "Du hörst, wie sich dein Herz\r\nstabilisiert."
      case "HANG NOTHING 11": return "Du hörst, wie sich dein Atem\r\nstabilisiert."
      case "HANG NOTHING 12": return "Du fokussierst dich darauf,\r\nwas vor dir ist"

      // AUBREY//
      case "AUBREY NOTHING": return `${u} spuckt auf deinen Schuh.`
      case "AUBREY TAUNT": return `${u} nennt ${t} schwach!\r\n${t} wird WÜTEND!`

      // THE HOOLIGANS//
      case "CHARLIE ATTACK": return "CHARLIE gibt alles!" + breakDmgText

      case "ANGEL ATTACK": // HOOLIGANS ANGEL ATTACK
        text = "ANGEL schlägt " + t + " geschwind!" + breakDmgText
        break

      case "MAVERICK CHARM": // HOOLIGANS MAVERICK CHARM
        text = "DER EINZELGÄNGER zwinkert " + t + " an!\r\n"
        text += t + "s ANGRIFF sinkt."
        break

      case "KIM HEADBUTT": // HOOLIGANS KIM HEADBUTT
        text = "KIM rammt ihren Kopf in " + t + "!" + breakDmgText
        break

      case "VANCE CANDY": // HOOLIGANS VANCE CANDY
        text = "VANCE wirft Bonbon!" + breakDmgText
        break

      case "HOOLIGANS GROUP ATTACK": // THE HOOLIGANS GROUP ATTACK
        text = u + " gehen aufs Ganze!" + breakDmgText
        break

      // BASIL//
      case "BASIL ATTACK": // BASIL ATTACK
        text = u + " greift in " + t + " hinein." + breakDmgText
        break

      case "BASIL NOTHING": // BASIL NOTHING
        text = u + "s Augen sind rot vom Weinen."
        break

      case "BASIL PREMPTIVE STRIKE": // BASIL PREMPTIVE STRIKE
        text = u + " schlitzt " + t + "s Arm." + breakDmgText
        break

      // BASIL'S SOMETHING//
      case "B SOMETHING ATTACK": // BASIL'S SOMETHING ATTACK
        text = u + " würgt " + t + "." + breakDmgText
        break

      case "B SOMETHING TAUNT": // BASIL'S SOMETHING TAUNT BASIL
        text = u + " greift in " + t + " hinein.\r\n"
        break

      // PLAYER SOMETHING BASIL FIGHT//
      case "B PLAYER SOMETHING STRESS": // B PLAYER SOMETHING STRESS
        text = u + " tut " + t + " etwas." + breakDmgText
        break

      case "B PLAYER SOMETHING HEAL": // B PLAYER SOMETHING HEAL
        text = u + " sickert durch " + t + "s Wunden." + breakDmgText
        break

      case "B OMORI SOMETHING CONSUME EMOTION": // B OMORI SOMETHING CONSUME EMOTION
        text = u + " verzehrt " + t + "s EMOTIONEN."
        break

      // CHARLIE//
      case "CHARLIE RELUCTANT ATTACK": // CHARLIE RELUCTANT ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "CHARLIE NOTHING": // CHARLIE NOTHING
        text = u + " steht rum."
        break

      case "CHARLIE LEAVE": // CHARLIE LEAVE
        text = u + " hört auf, zu kämpfen."
        break

      case "ANGEL NOTHING": // ANGEL NOTHING
        text = u + " macht einen Salto und posiert!"
        break

      case "ANGEL QUICK ATTACK": // ANGEL QUICK ATTACK
        text = u + " teleportiert sich hinter " + t + "!" + breakDmgText
        break

      case "ANGEL TEASE": // ANGEL TEASE
        text = u + " sagt böse Dinge über " + t + "!"
        break

      // THE MAVERICK//
      case "MAVERICK ATTACK": // THE MAVERICK ATTACK
        text = u + " schlägt " + t + "!" + breakDmgText
        break

      case "MAVERICK NOTHING": // THE MAVERICK NOTHING
        text = u + " prahlt vor seinen\r\n"
        text += "verehrenden Fans!"
        break

      case "MAVERICK SMILE": // THE MAVERICK SMILE
        text = u + " lächelt verführerisch!\r\n"
        text += t + "s ANGRIFF sinkt."
        break

      case "MAVERICK TAUNT": // THE MAVERICK TAUNT
        text = u + " macht sich über\r\n"
        text += t + " lustig!\r\n"
        text += t + " wird WÜTEND!"
        break

      // KIM//
      case "KIM ATTACK": // KIM ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "KIM NOTHING": // KIM DO NOTHING
        text = u + "s Telefon klingelt...\r\n"
        text += "Verwählt."
        break

      case "KIM SMASH": // KIM SMASH
        text = u + " ergreift " + t + "s Shirt und\r\n"
        text += "haut ihm ins Gesicht!" + breakDmgText
        break

      case "KIM TAUNT": // KIM TAUNT
        text = u + " macht sich über " + t + " lustig!\r\n"
        text += t + " wird TRAURIG."
        break

      // VANCE//
      case "VANCE ATTACK": // VANCE ATTACK
        text = u + " haut " + t + "!" + breakDmgText
        break

      case "VANCE NOTHING": // VANCE NOTHING
        text = u + " kratzt seinen Bauch."
        break

      case "VANCE TEASE": // VANCE TEASE
        text = u + " sagt böse Dinge über " + t + "!\r\n"
        text += t + " wird TRAURIG."
        break

      // JACKSON//
      case "JACKSON WALK SLOWLY": // JACKSON WALK SLOWLY
        text = u + " kommt langsam näher...\r\n"
        text += "Du spürst dich auswegslos!"
        break

      case "JACKSON KILL": return (
        `${u} HAT DICH GEFANGEN!!!\r\n` +
        "Du siehst dein Leben vor\r\ndeinen Augen aufblitzen!"
      )

      // RECYCLEPATH//
      case "R PATH ATTACK": return `${u} schlägt ${t} mit einem Sack!${breakDmgText}`

      case "R PATH SUMMON MINION": return (
        `${u} ruft einen Anhänger!\r\n` +
        "Ein RECYCULTIST erscheint!"
      )

      case "R PATH FLING TRASH": return (
        u + " schleudert all seinen\r\n" +
        "MÜLL auf " + t + "!" + breakDmgText)

      case "R PATH GATHER TRASH": return u + " hebt MÜLL auf."

      // SOMETHING IN THE CLOSET//
      case "CLOSET ATTACK": return `${u} zieht ${t}!${breakDmgText}`
      case "CLOSET NOTHING": return `${u} murmelt unheimlich.`
      case "CLOSET MAKE AFRAID": return `${u} knows your secret!`
      case "CLOSET MAKE WEAK": return `${u} saps ${t}s will to live!`

      // BIG STRONG TREE//
      case "BST SWAY": // BIG STRONG TREE NOTHING 1
        text = "Eine leichte Brise weht durch die Blätter."
        break

      case "BST NOTHING": // BIG STRONG TREE NOTHING 2
        text = u + " steht still, weil\r\n"
        text += "er ein Baum ist."
        break

      // DREAMWORLD FEAR EXTRA BATTLES//
      // HEIGHTS//
      case "DREAM HEIGHTS ATTACK": // DREAM FEAR OF HEIGHTS ATTACK
        text = u + " greift " + t + " an." + breakDmgText
        break

      case "DREAM HEIGHTS GRAB": // DREAM FEAR OF HEIGHTS GRAB
        if (target.index() <= unitLowestIndex) {
          text = "Hände erscheinen und greifen alle!\r\n"
          text += "ANGRIFF von allen sinkt..."
        }

        break

      case "DREAM HEIGHTS HANDS": // DREAM FEAR OF HEIGHTS HANDS
        text = "Mehr Hände erscheinen und\r\n"
        text += "umzingeln " + u + ".\r\n"
        if (!target._noStateMessage) { text += u + "s VERTEIDIGUNG steigt!" } else { text += parseNoStateChange(u, "VERTEIDIGUNG", "höher!") }
        break

      case "DREAM HEIGHTS SHOVE": // DREAM FEAR OF HEIGHTS SHOVE
        text = u + " schubst " + t + "." + breakDmgText + "\r\n"
        if (!target._noEffectMessage && t !== "OMORI") { text += t + " wird ÄNGSTLICH." } else { text += parseNoEffectEmotion(t, "AFRAID") }
        break

      case "DREAM HEIGHTS RELEASE ANGER": return `${u} lässt seine WUT raus!`
      case "DREAM SPIDERS CONSUME": return `${u} wickelt ${t} ein und frisst ${pronoun}.` + breakDmgText
      case "DREAM DROWNING SMALL": return "Alle tun sich schwer, zu atmen."
      case "DREAM DROWNING BIG": return "Alle fühlen sich, als würden sie\r\nbewusstlos werden."

      // BLACK SPACE EXTRA //
      case "BS LIAR": return "Lügner."

        // BACKGROUND ACTORS//

      // BERLY//
      case "BERLY ATTACK": return `BERLY verpasst ${t} eine Kopfnuss!${breakDmgText}`
      case "BERLY NOTHING 1": return "BERLY versteckt sich mutig."
      case "BERLY NOTHING 2": return "BERLY justiert ihre Brille."

      // TOYS//
      case "CAN": return `${u} kickt die DOSE.`

      case "DANDELION": return (
        `${u} pustet auf die PUSTEBLUME.\r\n` +
        `${u} fühlt sich wieder wie sich selbst.`
      )

      case "DYNAMITE": return `${u} wirft DYNAMIT!`

      case "LIFE JAM": return (
        `${u} benutzt MARMELEBEN auf TOAST!\r\n` +
        `TOAST wurde zu ${t}!`
      )

      case "PRESENT":
        text = t + " öffnet das GESCHENK\r\n"
        text += "Es ist nicht, was " + t + " wollte...\r\n"
        if (!target._noEffectMessage) { text += t + " wird WÜTEND! " } else { text += parseNoEffectEmotion(t, "WÜTENDER!") }
        break

      case "SILLY STRING": // DYNAMITE
        if (target.index() <= unitLowestIndex) {
          text = u + " uses SILLY STRING!\r\n"
          text += "WOOOOO!! Party!\r\n"
          text += "Alle werden FROH! "
        }
        break

      case "SPARKLER":
        text = u + " zündet die WUNDERKERZE an!\r\n"
        text += "WOOOOO!! Party!\r\n"
        if (!target._noEffectMessage) { text += t + " wird FROH!" } else { text += parseNoEffectEmotion(t, "FROHER!") }
        break

      case "COFFEE": return `${u} trinkt den KAFFEE...\r\n${u} fühlt sich großartig!`
      case "RUBBERBAND": return `${u} schleudert auf ${t}!` + breakDmgText

      // OMORI BATTLE//
      case "OMORI ERASES": return `${u} löscht den Gegner aus.` + breakDmgText
      case "MARI ATTACK": return (
        `${u} löscht den Gegner aus.\r\n` +
        `${t} wird ÄNGSTLICH.` + breakDmgText
      )

      // STATES//
      case "HAPPY": return state("FROH", "FROHER")
      case "ECSTATIC": return state("BEGEISTERT", "FROHER")
      case "MANIC": return state("WAHNSINNIG", "FROHER")
      case "SAD": return state("TRAURIG", "TRAURIGER")
      case "DEPRESSED": return state("DEPRIMIERT", "TRAURIGER")
      case "MISERABLE": return state("VERZWEIFELT", "TRAURIGER")
      case "ANGRY": return state("WÜTEND", "WÜTENDER")
      case "ENRAGED": return state("EMPÖRT", "WÜTENDER")
      case "FURIOUS": return state("ZORNIG", "WÜTENDER")
      case "AFRAID": return state("ÄNGSTLICH", "AFRAID")
      case "CANNOT MOVE": return `${t} ist bewegungsunfähig! `
      case "INFATUATION": return `${t} erstarrt vor Liebe! `

      case "SNALEY MEGAPHONE": {
        const text = target.index() <= unitLowestIndex ? `${u} benutzt ein AIR HORN!` : ""
        return text + getEffect({ 16: "ZORNIG!!!", 15: "EMPÖRT!!", 14: "WÜTEND!" }, target) + "\r\n"
      }


      default: {
        throw new Error(`Unhandled case "${type}"`)
      }
    }
  })()

  if (typeof switchResult === "string") {
    return formatString(switchResult)
  }

  return formatString(
    switchResult.text + br
    + (switchResult.suffix === "dmg" ? hpDamageText : mpDamageText)
  )
}