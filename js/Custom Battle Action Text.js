// ### Translation: Finished
// ### Editing: None
// ### Comment: should be 100%, some text may be a bit iffy

// ### Translated by: jasu

//=============================================================================
// TDS Custom Battle Action Text
// Version: 1.0
//=============================================================================
// Add to Imported List
var Imported = Imported || {} ; Imported.TDS_CustomBattleActionText = true;
// Initialize Alias Object
var _TDS_ = _TDS_ || {} ; _TDS_.CustomBattleActionText = _TDS_.CustomBattleActionText || {};
//=============================================================================
 /*:
 * @plugindesc
 * This plugins allows you to set customized messages for actions.
 *
 * @author TDS
 */
//=============================================================================


//=============================================================================
// ** Window_BattleLog
//-----------------------------------------------------------------------------
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.
//=============================================================================
// Alias Listing
//=============================================================================
_TDS_.CustomBattleActionText.Window_BattleLog_displayAction         = Window_BattleLog.prototype.displayAction;
_TDS_.CustomBattleActionText.Window_BattleLog_displayActionResults  = Window_BattleLog.prototype.displayActionResults;
//=============================================================================
// * Make Custom Action Text
//=============================================================================
Window_BattleLog.prototype.makeCustomActionText = function(subject, target, item) {
  var user          = subject;
  var result        = target.result();
  var hit           = result.isHit();
  var success       = result.success;
  var critical      = result.critical;
  var missed        = result.missed;
  var evaded        = result.evaded;
  var hpDam         = result.hpDamage;
  var mpDam         = result.mpDamage;
  var tpDam         = result.tpDamage;
  var addedStates   = result.addedStates;
  var removedStates = result.removedStates;
  var strongHit     = result.elementStrong;
  var weakHit       = result.elementWeak;
  var text = '';
  var type = item.meta.BattleLogType.toUpperCase();
  var switches = $gameSwitches;
  var unitLowestIndex = target.friendsUnit().getLowestIndexMember();


  function parseNoEffectEmotion(tname, em) {
    if(em.toLowerCase().contains("afraid")) {
      if(tname === "OMORI") {return "OMORI kann nicht ÄNGSTLICH sein!\r\n"}
      return target.name() + " kann nicht ÄNGSTLICH sein!\r\n";
    }
    let finalString = `${tname} kann nicht ${em} werden`;
    if(finalString.length >= 40) {
      let voinIndex = 0;
      for(let i = 40; i >= 0; i--) {
        if(finalString[i] === " ") {
          voinIndex = i;
          break;
        }
      }
      finalString = [finalString.slice(0, voinIndex).trim(), "\r\n", finalString.slice(voinIndex).trimLeft()].join('')
    }
    return finalString;
  }

  function parseNoStateChange(tname,stat,hl) {
    hl.replace('höher', 'steigen').replace('tiefer', 'sinken')
    let noStateChangeText = `${tname}s ${stat} kann nicht\r\nweiter ${hl}!`; // TARGET NAME - STAT - HIGHER/LOWER
    return noStateChangeText
  }

  // Type case
//OMORI//
if (hpDam != 0) {
  var hpDamageText = target.name() + ' nimmt ' + hpDam + ' Schaden!';
  if (strongHit) {
    hpDamageText = '...Es war ein bewegender Angriff!\r\n' + hpDamageText;
  } else if (weakHit) {
    hpDamageText = '...Es war ein dumpfer Angriff.\r\n' + hpDamageText;
  }
} else if (result.isHit() === true) {
  var hpDamageText = user.name() + "s Angriff hat nichts bewirkt.";
} else {
  var hpDamageText = user.name() + "s Angriff hat verfehlt!";
}

if (critical) {
    hpDamageText = 'DIREKT INS HERZ!\r\n' + hpDamageText;
}

if (mpDam > 0) {
  var mpDamageText = target.name() + ' hat ' + mpDam + ' SAFT verloren...';
  hpDamageText = hpDamageText + "\r\n" + mpDamageText;
} else {
  var mpDamageText = '';
}

  switch (type) {
  case 'BLANK': // ATTACK
    text = '...';
    break;

  case 'ATTACK': // ATTACK
    text = user.name() + ' greift ' + target.name() + ' an!\r\n';
    text += hpDamageText;
    break;

  case 'MULTIHIT':
    text = user.name() + " verursacht bewegenden Schaden!\r\n";
    break;

  case 'OBSERVE': // OBSERVE
    text = user.name() + ' fokussiert sich und beobachtet.\r\n';
    text += target.name() + '!';
    break;

  case 'OBSERVE TARGET': // OBSERVE TARGET
    //text = user.name() + " observes " + target.name() + ".\r\n";
    text = target.name() + ' wirft ein Auge auf\r\n';
    text += user.name() + '!';
    break;

  case 'OBSERVE ALL': // OBSERVE TARGET
    //text = user.name() + " observes " + target.name() + ".\r\n";
    text = user.name() + ' fokussiert sich und beobachtet.\r\n';
    text += target.name() + '!';
    text = target.name() + ' wirft ein Auge auf alle!';
    break;

  case 'SAD POEM':  // SAD POEM
    text = user.name() + ' liest ein trauriges Gedicht vor.\r\n';
    if(!target._noEffectMessage) {
      if(target.isStateAffected(12)) {text += target.name() + ' wird VERZWEIFELT...';}
      else if(target.isStateAffected(11)) {text += target.name() + ' wird DEPRIMIERT..';}
      else if(target.isStateAffected(10)) {text += target.name() + ' wird TRAURIG.';}
    }
    else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!")}
    break;

  case 'STAB': // STAB
    text = user.name() + ' sticht ' + target.name() + '.\r\n';
    text += hpDamageText;
    break;

  case 'TRICK':  // TRICK
    text = user.name() + ' trickst ' + target.name() + ' aus.\r\n';
    if(target.isEmotionAffected("happy")) {
      if(!target._noStateMessage) {text += target.name() + 's INITIATIVE sinkt!\r\n';}
      else {text += parseNoStateChange(target.name(), "INITIATIVE", "tiefer\r\n")}
    }
    text += hpDamageText;
    break;

  case 'SHUN': // SHUN
    text = user.name() + ' verscheucht ' + target.name() + '.\r\n';
    if(target.isEmotionAffected("sad")) {
      if(!target._noStateMessage) {text += target.name() + 's VERTEIDIGUNG sinkt.\r\n';}
      else {text += parseNoStateChange(target.name(), "VERTEIDIGUNG", "tiefer!\r\n")}
    }
    text += hpDamageText;
    break;

  case 'MOCK': // MOCK
    text = user.name() + ' verspottet ' + target.name() + '.\r\n';
    text += hpDamageText;
    break;

  case 'HACKAWAY':  // Hack Away
    text = user.name() + ' schwingt sein Messer wild herum!';
    break;

  case 'PICK POCKET': //Pick Pocket
    text = user.name() + ' versucht, ein Item zu stehlen!\r\n';
    text += 'von ' + target.name();
    break;

  case 'BREAD SLICE': //Bread Slice
    text = user.name() + ' schlitzt ' + target.name() + '!\r\n';
    text += hpDamageText;
    break;

  case 'HIDE': // Hide
    text = user.name() + ' verschwindet in den Hintergrund... ';
    break;

  case 'QUICK ATTACK': // Quick Attack
    text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
    text += hpDamageText;
    break;

  case 'EXPLOIT HAPPY': //Exploit Happy
    text = user.name() + ' nutzt ' + target.name() + 's\r\nFreude aus!\r\n';
    text += hpDamageText;
    break;

  case 'EXPLOIT SAD': // Exploit Sad
    text = user.name() + ' nutzt ' + target.name() + 's\r\n';
    text += 'Trauer aus!\r\n';
    text += hpDamageText;
    break;

  case 'EXPLOIT ANGRY': // Exploit Angry
    text = user.name() + ' nutzt ' + target.name() + 's\r\n';
    text += 'Wut aus!\r\n';
    text += hpDamageText;
    break;

  case 'EXPLOIT EMOTION': // Exploit Emotion
    text = user.name() + " nutzt " + target.name() + "s EMOTIONEN aus";
    if(text.length >= 34) {
      text = user.name() + ' nutzt ' + target.name() + 's\r\n';
      text += 'EMOTIONEN aus!\r\n';
    }
    else {text += "\r\n"}
    text += hpDamageText;
    break;

  case 'FINAL STRIKE': // Final Strike
    text = user.name() + ' entfacht seinen ultimativen Angriff!';
    break;

  case 'TRUTH': // PAINFUL TRUTH
    text = user.name() + ' flüstert \r\n';
    text += target.name() + 'etwas zu.\r\n';
    text += hpDamageText + "\r\n";
    if(!target._noEffectMessage) {
      text += target.name() + " wird TRAURIG.\r\n";
    }
    else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
    if(user.isStateAffected(12)) {text += user.name() + " wird VERZWEIFELT...";}
    else if(user.isStateAffected(11)) {text += user.name() + " wird DEPRIMIERT..";}
    else if(user.isStateAffected(10)) {text += user.name() + " wird TRAURIG.";}
    break;

  case 'ANGRIFF AGAIN':  // ANGRIFF AGAIN 2
    text = user.name() + ' greift erneut an!\r\n';
    text += hpDamageText;
    break;

  case 'TRIP':  // TRIP
    text = user.name() + ' bringt ' + target.name() + ' zum Stolpern!\r\n';
    if(!target._noStateMessage) {text += target.name() + 's INITIATIVE sinkt!\r\n';}
    else {text += parseNoStateChange(target.name(), "INITIATIVE", "tiefer!\r\n")}
    text += hpDamageText;
    break;

    case 'TRIP 2':  // TRIP 2
      text = user.name() + ' trips ' + target.name() + '!\r\n';
      if(!target._noStateMessage) {text += target.name() + 's INITIATIVE sinkt!\r\n';}
      else {text += parseNoStateChange(target.name(), "INITIATIVE", "tiefer!\r\n")}
      if(!target._noEffectMessage) {text += target.name() + ' wird TRAURIG.\r\n';}
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
      text += hpDamageText;
      break;

  case 'STARE': // STARE
    text = user.name() + ' starrt ' + target.name() + ' an.\r\n';
    text += target.name() + ' fühlt sich unwohl.';
    break;

  case 'RELEASE ENERGY':  // RELEASE ENERGY
    text = user.name() + ' und seine Freunde\r\n';
    text += 'entfachen ihren ultimativen Angriff!';
    break;

  case 'VERTIGO': // OMORI VERTIGO
    if(target.index() <= unitLowestIndex) {
      text = user.name() + ' bringt die Gegner aus dem Gleichgewicht!\r\n';
      text += 'ANGRIFF aller Gegner sinkt!\r\n';
    }
    text += hpDamageText;
    break;

  case 'CRIPPLE': // OMORI CRIPPLE
    if(target.index() <= unitLowestIndex) {
      text = user.name() + ' lähmt die Gegner!\r\n';
      text += "INITIATIVE aller Gegner sinkt.\r\n";
    }
    text += hpDamageText;
    break;

  case 'SUFFOCATE': // OMORI SUFFOCATE
    if(target.index() <= unitLowestIndex) {
      text = user.name() + ' erstickt die Gegner!\r\n';
      text += 'Alle Gegner schnappen nach Luft.\r\n';
      text += "VERTEIDIGUNG aller Gegner sinkt.\r\n";
    }
    text += hpDamageText;
    break;

  //AUBREY//
  case 'PEP TALK':  // PEP TALK
    text = user.name() + ' feuert ' + target.name() + ' an!\r\n';
    if(!target._noEffectMessage) {
      if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!';}
      else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!';}
      else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!';}
    }
    else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
    break;

  case 'TEAM SPIRIT':  // TEAM SPIRIT
    text = user.name() + ' feuert ' + target.name() + ' an!\r\n';
    if(!target._noEffectMessage) {
      if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!\r\n';}
      else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!\r\n';}
      else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!\r\n';}
    }
    else {text += parseNoEffectEmotion(target.name(), "FROHER!\r\n")}

    if(!user._noEffectMessage) {
      if(user.isStateAffected(8)) {text += user.name() + ' wird WAHNSINNIG!!!';}
      else if(user.isStateAffected(7)) {text += user.name() + ' wird BEGEISTERT!!';}
      else if(user.isStateAffected(6)) {text += user.name() + ' wird FROH!';}
    }
    else {text += parseNoEffectEmotion(user.name(), "FROHER!\r\n")}
    break;

  case 'HEADBUTT':  // HEADBUTT
    text = user.name() + ' verpasst ' + target.name() + ' eine Kopfnuss!\r\n';
    text += hpDamageText;
    break;

  case 'HOMERUN': // Homerun
    text = user.name() + ' landet auf ' + target.name() + '\r\n';
    text += 'einen Volltreffer!\r\n';
    text += hpDamageText;
    break;

  case 'THROW': // Wind-up Throw
    text = user.name() + ' wirft ihre Waffe!';
    break;

  case 'POWER HIT': //Power Hit
    text = user.name() + ' schlägt ' + target.name() + '!\r\n';
    if(!target._noStateMessage) {text += target.name() + 's VERTEIDIGUNG sinkt.\r\n';}
    else {text += parseNoStateChange(target.name(), "VERTEIDIGUNG", "tiefer!\r\n")}
    text += hpDamageText;
    break;

  case 'LAST RESORT': // Last Resort
    text = user.name() + ' greift ' + target.name() + '\r\n';
    text += 'mit letzter Kraft an!\r\n';
    text += hpDamageText;
    break;

  case 'COUNTER ATTACK': // Counter Attack
    text = user.name() + ' bereitet ihren Schläger vor!';
    break;

  case 'COUNTER HEADBUTT': // Counter Headbutt
    text = user.name() + ' bereitet ihren Kopf vor!';
    break;

  case 'COUNTER ANGRY': //Counter Angry
    text = user.name() + ' macht sich gefasst!';
    break;

  case 'LOOK OMORI 1':  // Look at Omori 2
    text = 'OMORI hat ' + user.name() + ', nicht bemerkt, also\r\n';
    text += 'greift ' + user.name() + ' erneut an!\r\n';
    text += hpDamageText;
    break;

  case 'LOOK OMORI 2': // Look at Omori 2
    text = 'OMORI hat ' + user.name() + ', immernoch nicht bemerkt,\r\n';
    text += 'also greift ' + user.name() + ' härter an!\r\n';
    text += hpDamageText;
    break;

  case 'LOOK OMORI 3': // Look at Omori 3
    text = 'OMORI bemerkt ' + user.name() + ' endlich!\r\n';
    text += user.name() + ' schwingt aus Freude ihren Schläger!\r\n';
    text += hpDamageText;
    break;

  case 'LOOK KEL 1':  // Look at Kel 1
    text = 'KEL stachelt AUBREY an!\r\n';
    text += target.name() + " wird WÜTEND!";
    break;

  case 'LOOK KEL 2': // Look at Kel 2
   text = 'KEL stachelt AUBREY an!\r\n';
   text += 'KELs und AUBREYs ANGRIFF steigt!\r\n';
   var AUBREY = $gameActors.actor(2);
   var KEL = $gameActors.actor(3);
   if(AUBREY.isStateAffected(14) && KEL.isStateAffected(14)) {text += 'KEL und AUBREY werden WÜTEND!';}
   else if(AUBREY.isStateAffected(14) && KEL.isStateAffected(15)) {
    text += 'KEL wird EMPÖRT!!\r\n';
    text += 'AUBREY wird WÜTEND!';
   }
   else if(AUBREY.isStateAffected(15) && KEL.isStateAffected(14)) {
    text += 'KEL wird WÜTEND!\r\n';
    text += 'AUBREY wird EMPÖRT!!';
   }
   else if(AUBREY.isStateAffected(15) && KEL.isStateAffected(15)) {text += 'KEL und AUBREY werden EMPÖRT!!';}
   else {text += 'KEL and AUBREY werden WÜTEND!';}
   break;

  case 'LOOK HERO':  // LOOK AT HERO 1
    text = 'HERO sagt AUBREY, sie soll sich konzentrieren!\r\n';
    if(target.isStateAffected(6)) {text += target.name() + " wird FROH!\r\n"}
    else if(target.isStateAffected(7)) {text += target.name() + " wird BEGEISTERT!!\r\n"}
    text += user.name() + 's VERTEIDIGUNG steigt!!';
    break;

  case 'LOOK HERO 2': // LOOK AT HERO 2
    text = 'HERO ermutigt AUBREY!\r\n';
    text += 'AUBREYs VERTEIDIGUNG steigt!!\r\n';
    if(target.isStateAffected(6)) {text += target.name() + " wird FROH!\r\n"}
    else if(target.isStateAffected(7)) {text += target.name() + " wird BEGEISTERT!!\r\n"}
    if(!!$gameTemp._statsState[0]) {
      var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp);
      if(absHp > 0) {text += `AUBREY regeneriert ${absHp} HERZ!\r\n`;}
    }
    if(!!$gameTemp._statsState[1]) {
      var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp);
      if(absMp > 0) {text += `AUBREY regeneriert ${absMp} SAFT...`;}
    }
    $gameTemp._statsState = undefined;
    break;

  case 'TWIRL': // ATTACK
    text = user.name() + ' greift ' + target.name() + ' an!\r\n';
    text += hpDamageText;
    break;

  //KEL//
    case 'ANNOY':  // ANNOY
      text = user.name() + ' ärgert ' + target.name() + '!\r\n';
      if(!target._noEffectMessage) {
        if(target.isStateAffected(14)) {text += target.name() + ' wird WÜTEND!';}
        else if(target.isStateAffected(15)) {text += target.name() + ' wird EMPÖRT!!';}
        else if(target.isStateAffected(16)) {text += target.name() + ' wird ZORNIG!!!';}
      }
      else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
      break;

    case 'REBOUND':  // REBOUND
      text = user.name() + 's Ball prallt überall ab!';
      break;

    case 'FLEX':  // FLEX
      text = user.name() + ' kommt durch\'s Muskelspiel ans Ziel!\r\n';
      text += user.name() + " TREFFERRATE steigt!\r\n"
      break;

    case 'JUICE ME': // JUICE ME
      text = user.name() + ' passt die KOKOSNUSS zu ' + target.name() + '!\r\n'
      var absMp = Math.abs(mpDam);
      if(absMp > 0) {
        text += `${target.name()} regeneriert ${absMp} SAFT...\r\n`
      }
      text += hpDamageText;
      break;

    case 'RALLY': // RALLY
      text = user.name() + ' bringt alle in Schwung!\r\n';
      if(user.isStateAffected(7)) {text += user.name() + " wird BEGEISTERT!!\r\n"}
      else if(user.isStateAffected(6)) {text += user.name() + " wird FROH!\r\n"}
      text += "Alle erhalten ENERGIE!\r\n"
      for(let actor of $gameParty.members()) {
        if(actor.name() === "KEL") {continue;}
        var result = actor.result();
        if(result.mpDamage >= 0) {continue;}
        var absMp = Math.abs(result.mpDamage);
        text += `${actor.name()} regeneriert ${absMp} SAFT...\r\n`
      }
      break;

    case 'SNOWBALL': // SNOWBALL
      text = user.name() + ' wirft einen SCHNEEBALL auf\r\n';
      text += target.name() + '!\r\n';
      if(!target._noEffectMessage) {text += target.name() + " wird TRAURIG.\r\n"}
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
      text += hpDamageText;
      break;

    case 'TICKLE': // TICKLE
      text = user.name() + ' kitzelt ' + target.name() + '!\r\n'
      text += `${target.name()} wird unachtsam!`
      break;

    case 'RICOCHET': // RICOCHET
     text = user.name() + ' führt einen tollen Balltrick vor!\r\n';
     text += hpDamageText;
     break;

    case 'CURVEBALL': // CURVEBALL
     text = user.name() + ' wirft einen Curveball...\r\n';
     text += target.name() + ' wird aus der Bahn geworfen!\r\n';
     switch($gameTemp._randomState) {
       case 6:
         if(!target._noEffectMessage) {text += target.name() + " wird FROH!\r\n"}
         else {text += parseNoEffectEmotion(target.name(), "FROHER!\r\n")}
         break;
      case 14:
        if(!target._noEffectMessage) {text += target.name() + " wird WÜTEND!\r\n"}
        else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!\r\n")}
        break;
      case 10:
        if(!target._noEffectMessage) {text += target.name() + " wird TRAURIG.\r\n"}
        else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
        break;

     }
     text += hpDamageText;
     break;

    case 'MEGAPHONE': // MEGAPHONE
      if(target.index() <= unitLowestIndex) {text = user.name() + ' rennt rum und ärgert alle!\r\n';}
      if(target.isStateAffected(16)) {text += target.name() + ' wird ZORNIG!!!\r\n'}
      else if(target.isStateAffected(15)) {text += target.name() + ' wird EMPÖRT!!\r\n'}
      else if(target.isStateAffected(14)) {text += target.name() + ' wird WÜTEND!\r\n'}
      break;

    case 'DODGE ATTACK': // DODGE ATTACK
      text = user.name() + ' bereitet sich aufs Ausweichen vor!';
      break;

    case 'DODGE ANNOY': // DODGE ANNOY
      text = user.name() + ' neckt die Gegner!';
      break;

    case 'DODGE TAUNT': // DODGE TAUNT
      text = user.name() + ' verhöhnt die Gegner!\r\n';
      text += "TREFFERRATE aller Gegner sinkt diese Runde!"
      break;

    case 'PASS OMORI':  // KEL PASS OMORI
      text = 'OMORI hat nicht hingeschaut und wurde umgehauen!\r\n';
      text += 'OMORI nimmt 1 Schaden!';
      break;

    case 'PASS OMORI 2': //KEL PASS OMORI 2
      text = 'OMORI fängt KELs Ball!\r\n';
      text += 'OMORI wirft den Ball auf\r\n';
      text += target.name() + '!\r\n';
      var OMORI = $gameActors.actor(1);
      if(OMORI.isStateAffected(6)) {text += "OMORI wird FROH!\r\n"}
      else if(OMORI.isStateAffected(7)) {text += "OMORI wird BEGEISTERT!!\r\n"}
      text += hpDamageText;
      break;

    case 'PASS AUBREY':  // KEL PASS AUBREY
      text = 'AUBREY hämmert den Ball weg!\r\n';
      text += hpDamageText;
      break;

    case 'PASS HERO':  // KEL PASS HERO
      if(target.index() <= unitLowestIndex) {text = user.name() + ' dunks on the foes!\r\n';}
      text += hpDamageText;
      break;

    case 'PASS HERO 2':  // KEL PASS HERO
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' versenkt den Ball anmutig!\r\n';
        text += "All foes' ANGRIFF fell!\r\n";
      }
      text += hpDamageText;
      break;

    //HERO//
    case 'MASSAGE':  // MASSAGE
      text = user.name() + ' massiert ' + target.name() + '!\r\n';
      if(!!target.isAnyEmotionAffected(true)) {
        text += target.name() + ' beruhigt sich...';
      }
      else {text += "Es hatte keine Auswirkung..."}
      break;

    case 'COOK':  // COOK
      text = user.name() + ' macht einen Keks extra für ' + target.name() + '!';
      break;

    case 'FAST FOOD': //FAST FOOD
      text = user.name() + ' macht für ' + target.name() + ' eine schnelle Mahlzeit.';
      break;

    case 'JUICE': // JUICE
      text = user.name() + ' bereitet ' + target.name() + ' eine Erfrischung vor.';
      break;

    case 'SMILE':  // SMILE
      text = user.name() + ' lächelt ' + target.name() + ' an!\r\n';
      if(!target._noStateMessage) {text += target.name() + 's ANGRIFF sinkt.';}
      else {text += parseNoStateChange(target.name(), "ATTACK", "tiefer!\r\n")}
      break;

    case 'DAZZLE':
      text = user.name() + ' lächelt ' + target.name() + ' an!\r\n';
      if(!target._noStateMessage) {text += target.name() + 's ANGRIFF sinkt.\r\n';}
      else {text += parseNoStateChange(target.name(), "ATTACK", "tiefer!\r\n")}
      if(!target._noEffectMessage) {
        text += target.name() + ' wird FROH!';
      }
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;
    case 'TENDERIZE': // TENDERIZE
      text = user.name() + ' massiert\r\n';
      text += target.name() + ' intensiv!\r\n';
      if(!target._noStateMessage) {text += target.name() + 's VERTEIDIGUNG sinkt!\r\n';}
      else {text += parseNoStateChange(target.name(), "VERTEIDIGUNG", "tiefer!\r\n")}
      text += hpDamageText;
      break;

    case 'SNACK TIME':  // SNACK TIME
      text = user.name() + ' macht allen Kekse!';
      break;

    case 'TEA TIME': // TEA TIME
      text = user.name() + ' holt Tee für eine kurze Pause.\r\n';
      text += target.name() + ' fühlt sich erholt!\r\n';
      if(result.hpDamage < 0) {
        var absHp = Math.abs(result.hpDamage);
        text += `${target.name()} regeneriert ${absHp} HERZ!\r\n`
      }
      if(result.mpDamage < 0) {
        var absMp = Math.abs(result.mpDamage);
        text += `${target.name()} regeneriert ${absMp} SAFT...\r\n`
      }
      break;

    case 'SPICY FOOD': // SPICY FOOD
      text = user.name() + ' kocht scharfes Essen!\r\n';
      text += hpDamageText;
      break;

    case 'SINGLE TAUNT': // SINGLE TAUNT
      text = user.name() + ' lenkt ' + target.name() + 's\r\n';
      text += 'Aufmerksamkeit auf sich.';
      break;

    case 'TAUNT':  // TAUNT
      text = user.name() + ' lockt die Gegner an.';
      break;

    case 'SUPER TAUNT': // SUPER TAUNT
      text = user.name() + ' lockt die Gegner an.\r\n';
      text += user.name() + ' bereitet sich aufs Blocken vor.';
      break;

    case 'ENCHANT':  // ENCHANT
      text = user.name() + ' lockt die Gegner\r\n';
      text += 'mit einem Lächeln an.\r\n';
      if(!target._noEffectMessage) {text += target.name() + " wird FROH!";}
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;

    case 'MENDING': //MENDING
      text = user.name() + ' bewirtet ' + target.name() + '.\r\n';
      text += user.name() + ' ist nun ' + target.name() + 's Koch!';
      break;

    case 'SHARE FOOD': //SHARE FOOD
      if(target.name() !== user.name()) {
        text = user.name() + ' teilt Essen mit ' + target.name() + '!'
      }
      break;

    case 'CALL OMORI':  // CALL OMORI
      text = user.name() + ' gibt OMORI ein Zeichen!\r\n';
      if(!!$gameTemp._statsState[0]) {
        var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(1).hp);
        if(absHp > 0) {text += `OMORI regeneriert ${absHp} HERZ!\r\n`;}
      }
      if(!!$gameTemp._statsState[1]) {
        var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(1).mp);
        if(absMp > 0) {text += `OMORI regeneriert ${absMp} SAFT...`;}
      }
      $gameTemp._statsState = undefined;
      break;

    case 'CALL KEL':  // CALL KEL
      text = user.name() + ' eifert KEL an!\r\n';
      if(!!$gameTemp._statsState[0]) {
        var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(3).hp);
        if(absHp > 0) {text += `KEL regeneriert ${absHp} HERZ!\r\n`;}
      }
      if(!!$gameTemp._statsState[1]) {
        var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(3).mp);
        if(absMp > 0) {text += `KEL regeneriert ${absMp} SAFT...`;}
      }
      break;

    case 'CALL AUBREY':  // CALL AUBREY
      text = user.name() + ' spornt AUBREY an!\r\n';
      if(!!$gameTemp._statsState[0]) {
        var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp);
        if(absHp > 0) {text += `AUBREY regeneriert ${absHp} HERZ!\r\n`;}
      }
      if(!!$gameTemp._statsState[1]) {
        var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp);
        if(absMp > 0) {text += `AUBREY regeneriert ${absMp} SAFT...`;}
      }
      break;

    //PLAYER//
    case 'CALM DOWN':  // PLAYER CALM DOWN
      if(item.id !== 1445) {text = user.name() + ' beruhigt sich.\r\n';} // Process if Calm Down it's not broken;
      if(Math.abs(hpDam) > 0) {text += user.name() + ' regeneriert ' + Math.abs(hpDam) + ' HERZ!';}
      break;

    case 'FOCUS':  // PLAYER FOCUS
      text = user.name() + ' focuses.';
      break;

    case 'PERSIST':  // PLAYER PERSIST
      text = user.name() + ' persists.';
      break;

    case 'OVERCOME':  // PLAYER OVERCOME
      text = user.name() + ' overcomes.';
      break;

  //UNIVERSAL//
    case 'FIRST AID':  // FIRST AID
      text = user.name() + ' kümmert sich um ' + target.name() + '!\r\n';
      text += target.name() + ' regeneriert ' + Math.abs(target._result.hpDamage) + ' HERZ!';
      break;

    case 'PROTECT':  // PROTECT
      text = user.name() + ' stellt sich vor ' + target.name() + '!';
      break;

    case 'GAURD': // GAURD
      text = user.name() + ' bereitet sich aufs Blocken vor.';
      break;

  //FOREST BUNNY//
    case 'BUNNY ATTACK': // FOREST BUNNY ATTACK
      text = user.name() + ' knabbert an ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'BUNNY NOTHING': // BUNNY DO NOTHING
      text = user.name() + ' hüpft herum!';
      break;

    case 'BE CUTE':  // BE CUTE
      text = user.name() + ' zwinkert ' + target.name() + ' an!\r\n';
      text += target.name() + 's ANGRIFF sinkt...';
      break;

    case 'SAD EYES': //SAD EYES
      text = user.name() + ' schaut ' + target.name() + ' traurig an.\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird TRAURIG.';}
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!")}
      break;

  //FOREST BUNNY?//
    case 'BUNNY ATTACK2': // BUNNY? ATTACK
      text = user.name() + ' knabbert an ' + target.name() + '?\r\n';
      text += hpDamageText;
      break;

    case 'BUNNY NOTHING2':  // BUNNY? DO NOTHING
      text = user.name() + ' hüpft herum?';
      break;

    case 'BUNNY CUTE2':  // BE CUTE?
      text = user.name() + ' zwinkert ' + target.name() + 'an?\r\n';
      text += target.name() + 's ANGRIFF sinkt?';
      break;

    case 'SAD EYES2': // SAD EYES?
      text = user.name() + ' schaut ' + target.name() + ' traurig an...\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird TRAURIG?';}
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!")}
      break;

    //SPROUT MOLE//
    case 'SPROUT ATTACK':  // SPROUT MOLE ATTACK
      text = user.name() + ' rempelt ' + target.name() + ' an!\r\n';
      text += hpDamageText;
      break;

    case 'SPROUT NOTHING':  // SPROUT NOTHING
      text = user.name() + ' rollt herum.';
      break;

    case 'RUN AROUND':  // RUN AROUND
      text = user.name() + ' rennt herum!';
      break;

    case 'HAPPY RUN AROUND': //HAPPY RUN AROUND
      text = user.name() + ' rennt energisch herum!';
       break;

    //MOON BUNNY//
    case 'MOON ATTACK':  // MOON BUNNY ATTACK
      text = user.name() + ' stößt in ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MOON NOTHING':  // MOON BUNNY NOTHING
      text = user.name() + ' starrt ins Leere.';
      break;

    case 'BUNNY BEAM':  // BUNNY BEAM
      text = user.name() + ' schießt einen Laser!\r\n';
      text += hpDamageText;
      break;

    //DUST BUNNY//
    case 'DUST NOTHING':  // DUST NOTHING
      text = user.name() + ' versucht, sich\r\n';
      text += 'zusammenzuhalten.';
      break;

    case 'DUST SCATTER':  // DUST SCATTER
      text = user.name() + ' explodiert!';
      break;

    //U.F.O//
    case 'UFO ATTACK':  // UFO ATTACK
      text = user.name() + ' stößt mit ' + target.name() + ' zusammen!\r\n';
      text += hpDamageText;
      break;

    case 'UFO NOTHING':  // UFO NOTHING
      text = user.name() + ' verliert das Interesse.';
      break;

    case 'STRANGE BEAM':  // STRANGE BEAM
      text = user.name() + ' lässt ein komisches Licht erleuchten!\r\n';
      text += target.name() + " fühlt eine zufällige EMOTION!"
      break;

    case 'ORANGE BEAM':  // ORANGE BEAM
      text = user.name() + ' schießt einen orangen Laser!\r\n';
      text += hpDamageText;
      break;

    //VENUS FLYTRAP//
    case 'FLYTRAP ATTACK':  // FLYTRAP ATTACK
      text = user.name() + ' greift ' + target.name() + ' an!\r\n';
      text += hpDamageText;
      break;

    case 'FLYTRAP NOTHING':  // FLYTRAP NOTHING
      text = user.name() + ' kaut auf nichts rum.';
      break;

    case 'FLYTRAP CRUNCH':  // FLYTRAP
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    //WORMHOLE//
    case 'WORM ATTACK':  // WORM ATTACK
      text = user.name() + ' schlägt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'WORM NOTHING':  // WORM NOTHING
      text = user.name() + ' wackelt herum...';
      break;

    case 'OPEN WORMHOLE':  // OPEN WORMHOLE
      text = user.name() + ' öffnet ein Wurmloch!';
      break;

    //MIXTAPE//
    case 'MIXTAPE ATTACK':  // MIXTAPE ATTACK
      text = user.name() + ' schlägt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MIXTAPE NOTHING':  // MIXTAPE NOTHING
      text = user.name() + ' entwirrt sich selbst.';
      break;

    case 'TANGLE':  // TANGLE
      text = target.name() + ' verwickelt sich in ' + user.name() + '!\r\n';
      text += target.name() + 's INITIATIVE sinkt...';
      break;

    //DIAL-UP//
    case 'DIAL ATTACK':  // DIAL ATTACK
      text = user.name() + ' ist langsam.\r\n';
      text += `${target.name()} verletzt sich selbst in Frustration!\r\n`;
      text += hpDamageText;
      break;

    case 'DIAL NOTHING':  // DIAL NOTHING
      text = user.name() + ' lädt...';
      break;

    case 'DIAL SLOW':  // DIAL SLOW
      text = user.name() + ' wird laaaaaaaangsamer.\r\n';
      text += 'INITIATIVE von allen sinkt...';
      break;

    //DOOMBOX//
    case 'DOOM ATTACK':  // DOOM ATTACK
      text = user.name() + ' wirft sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'DOOM NOTHING':  // DOOM NOTHING
      text = user.name() + ' stellt das Radio ein.';
      break;

    case 'BLAST MUSIC':  // BLAST MUSIC
      text = user.name() + ' spielt geile Musik!';
      break;

    //SHARKPLANE//
    case 'SHARK ATTACK':  // SHARK PLANE
      text = user.name() + ' rammt sich in ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SHARK NOTHING':  // SHARK NOTHING
      text = user.name() + ' stochert an seinen Zähnen herum.';
      break;

    case 'OVERCLOCK ENGINE':  // OVERCLOCK ENGINE
      text = user.name() + ' dreht seinen Motor auf!\r\n';
      if(!target._noStateMessage) {
        text += user.name() + 's INITIATIVE steigt!';
      }
      else {text += parseNoStateChange(user.name(), "INITIATIVE", "höher!")}
      break;

    case 'SHARK CRUNCH':  // SHARK
        text = user.name() + ' beißt ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

    //SNOW BUNNY//
    case 'SNOW BUNNY ATTACK':  // SNOW ATTACK
      text = user.name() + ' kickt Schnee auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SNOW NOTHING':  // SNOW NOTHING
      text = user.name() + ' bleibt cool.';
      break;

    case 'SMALL SNOWSTORM':  // SMALL SNOWSTORM
      text = user.name() + ' wirft Schnee auf alle,\r\n';
      text += 'was einen kleinen Schneesturm entfacht!';
      break;

    //SNOW ANGEL//
    case 'SNOW ANGEL ATTACK': //SNOW ANGEL ATTACK
      text = user.name() + ' berührt ' + target.name() + '\r\n';
      text += 'mit seinen kalten Händen.\r\n';
      text += hpDamageText;
      break;

    case 'UPLIFTING HYMN': //UPLIFTING HYMN
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' singt ein schönes Lied...\r\n';
        text += 'Alle werden FROH!';
      }
      target._noEffectMessage = undefined;
      break;

    case 'PIERCE HEART': //PIERCE HEART
      text = user.name() + ' trifft ' + target.name() + ' ins HERZ.\r\n';
      text += hpDamageText;
      break;

    //SNOW PILE//
    case 'SNOW PILE ATTACK': //SNOW PILE ATTACK
      text = user.name() + ' wirft Schnee auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SNOW PILE NOTHING': //SNOW PILE NOTHING
      text = user.name() + ' fühlt sich frostig.';
      break;

    case 'SNOW PILE ENGULF': //SNOW PILE ENGULF
      text = user.name() + ' hüllt ' + target.name() + ' in Schnee ein!\r\n';
      text += user.name() + 's INITIATIVE sinkt.\r\n';
      text += user.name() + 's VERTEIDIGUNG sinkt.';
      break;

    case 'SNOW PILE MORE SNOW': //SNOW PILE MORE SNOW
      text = user.name() + ' häuft Schnee auf sich selbst!\r\n';
      text += user.name() + 's ANGRIFF steigt!\r\n';
      text += user.name() + 's VERTEIDIGUNG steigt!';
      break;

    //CUPCAKE BUNNY//
    case 'CCB ATTACK': //CUP CAKE BUNNY ATTACK
      text = user.name() + ' rempelt ' + target.name() + ' an.\r\n';
      text += hpDamageText;
      break;

    case 'CCB NOTHING': //CUP CAKE BUNNY NOTHING
      text = user.name() + ' hüpft auf der Stelle.';
      break;

    case 'CCB SPRINKLES': //CUP CAKE BUNNY SPRINKLES
      text = user.name() + ' hüllt ' + target.name() + '\r\n';
      text += 'in Streuseln ein.\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird FROH!\r\n';}
      else {text += parseNoEffectEmotion(target.name(), "FROHER!\r\n")}
      text += target.name() + "'s WERTE steigen!"
      break;

    //MILKSHAKE BUNNY//
    case 'MSB ATTACK': //MILKSHAKE BUNNY ATTACK
      text = user.name() + ' verschüttet Milchshake auf ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'MSB NOTHING': //MILKSHAKE BUNNY NOTHING
      text = user.name() + ' dreht sich im Kreis.';
      break;

    case 'MSB SHAKE': //MILKSHAKE BUNNY SHAKE
      text = user.name() + ' schüttelt wild!\r\n';
      text += 'Milchshake fliegt durch die Gegend!';
      break;

    //PANCAKE BUNNY//
    case 'PAN ATTACK': //PANCAKE BUNNY ATTACK
      text = user.name() + ' knabbert an ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'PAN NOTHING': //PANCAKE BUNNY NOTHING
      text = user.name() + ' macht einen Salto!\r\n';
      text += 'Wie talentiert!';
      break;

    //STRAWBERRY SHORT SNAKE//
    case 'SSS ATTACK': //STRAWBERRY SHORT SNAKE ATTACK
      text = user.name() + ' beißt sich in ' + target.name() + ' ein.\r\n';
      text += hpDamageText;
      break;

    case 'SSS NOTHING': //STRAWBERRY SHORT SNAKE NOTHING
      text = user.name() + ' zischt.';
      break;

    case 'SSS SLITHER': //STRAWBERRY SHORT SNAKE SLITHER
      text = user.name() + ' schlängelt fröhlich herum!\r\n';
      if(!user._noEffectMessage) {text += user.name() + ' wird FROH!';}
      else {text += parseNoEffectEmotion(user.name(), "FROHER!")}
      break;

    //PORCUPIE//
    case 'PORCUPIE ATTACK': //PORCUPIE ATTACK
      text = user.name() + ' stupst ' + target.name() + ' an.\r\n';
      text += hpDamageText;
      break;

    case 'PORCUPIE NOTHING': //PORCUPIE NOTHING
      text = user.name() + ' schnüffelt herum.';
      break;

    case 'PORCUPIE PIERCE': //PORCUPIE PIERCE
      text = user.name() + ' spießt ' + target.name() + ' auf!\r\n';
      text += hpDamageText;
      break;

    //BUN BUNNY//
    case 'BUN ATTACK': //BUN ATTACK
      text = user.name() + ' rempelt ' + target.name() + ' an!\r\n';
      text += hpDamageText;
      break;

    case 'BUN NOTHING': //BUN NOTHING
      text = user.name() + ' faulenzt.';
      break;

    case 'BUN HIDE': //BUN HIDE
      text = user.name() + ' versteckt sich in seinem Brötchen.';
      break;

    //TOASTY//
    case 'TOASTY ATTACK': //TOASTY ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'TOASTY NOTHING': //TOASTY NOTHING
      text = user.name() + ' bohrt in der Nase.';
      break;

    case 'TOASTY RILE': //TOASTY RILE
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' hält eine kontroverse Rede!\r\n';
        text += 'Alle werden WÜTEND!';
      }
      target._noEffectMessage = undefined;
      break;

    //SOURDOUGH//
    case 'SOUR ATTACK': //SOURDOUGH ATTACK
      text = user.name() + ' tritt auf ' + target.name() + 's Zeh!\r\n';
      text += hpDamageText;
      break;

    case 'SOUR NOTHING': //SOURDOUGH NOTHING
      text = user.name() + ' kickt Schmutz.';
      break;

    case 'SOUR BAD WORD': //SOURDOUGH BAD WORD
      text = 'Oh no! ' + user.name() + ' sagt ein böses Wort!\r\n';
      text += hpDamageText;
      break;

    //SESAME//
    case 'SESAME ATTACK': //SESAME ATTACK
      text = user.name() + ' wirft Samen auf ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'SESAME NOTHING': //SESAME Nothing
      text = user.name() + ' kratzt seinen Kopf.';
      break;

    case 'SESAME ROLL': //SESAME BREAD ROLL
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' rollt über alle!\r\n';
      }
      text += hpDamageText;
      break;

    //CREEPY PASTA//
    case 'CREEPY ATTACK': //CREEPY ATTACK
      text = user.name() + ' lässt ' + target.name() + ' sich\r\n';
      text += 'unwohl fühlen.\r\n';
      text += hpDamageText;
      break;

    case 'CREEPY NOTHING': //CREEPY NOTHING
      text = user.name() + ' macht nichts... bedrohlich!';
      break;

    case 'CREEPY SCARE': //CREEPY SCARE
      text = user.name() + ' zeigt allen ihre\r\n';
      text += 'schlimmsten Alpträume!';
      break;

    //COPY PASTA//
    case 'COPY ATTACK': //COPY ATTACK
      text = user.name() + ' wirft sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'DUPLICATE': //DUPLICATE
      text = user.name() + ' kopiert sich! ';
      break;

    //HUSH PUPPY//
    case 'HUSH ATTACK': //HUSH ATTACK
      text = user.name() + ' rammt sich in ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'HUSH NOTHING': //HUSH NOTHING
      text = user.name() + ' versucht, zu bellen...\r\n';
      text += 'Aber nichts geschieht...';
      break;

    case 'MUFFLED SCREAMS': //MUFFLED SCREAMS
      text = user.name() + ' fängt an zu schreien!\r\n';
      if(!target._noEffectMessage && target.name() !== "OMORI") {
        text += target.name() + ' wird ÄNGSTLICH.';
      }
      else {text += parseNoEffectEmotion(target.name(), "AFRAID")}
      break;

    //GINGER DEAD MAN//
    case 'GINGER DEAD ATTACK': //GINGER DEAD MAN ATTACK
      text = user.name() + ' sticht ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'GINGER DEAD NOTHING': //GINGER DEAD MAN DO NOTHING
      text = user.name() + 's Kopf fällt ab...\r\n';
      text += user.name() + ' setzt ihn wieder auf.';
      break;

    case 'GINGER DEAD THROW HEAD': //GINGER DEAD MAN THROW HEAD
      text = user.name() + ' wirft seinen Kopf auf\r\n';
      text +=  target.name() + '!\r\n';
      text += hpDamageText;
      break;

    //LIVING BREAD//
    case 'LIVING BREAD ATTACK': //LIVING BREAD ATTACK
      text = user.name() + ' schlägt auf ' + target.name() + ' ein!\r\n';
      text += hpDamageText;
      break;

    case 'LIVING BREAD NOTHING': //LIVING BREAD ATTACK
      text = user.name() + ' kommt langsam näher\r\n';
      text += target.name() + '!';
      break;

    case 'LIVING BREAD BITE': //LIVING BREAD BITE
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'LIVING BREAD BAD SMELL': //LIVING BREAD BAD SMELL
      text = user.name() + ' riecht fürchterlich!\r\n';
      text += target.name() + 's VERTEIDIGUNG sinkt!';
      break;

    //Bug Bunny//
    case 'BUG BUN ATTACK': //Bug Bun Attack
     text = user.name() + ' schlägt auf ' + target.name() + ' ein!\r\n';
     text += hpDamageText;
     break;

    case 'BUG BUN NOTHING': //Bug Bun Nothing
      text = user.name() + ' versucht, sich auf seinem\r\nKopf zu balancieren.';
      break;

    case 'SUDDEN JUMP': //SUDDEN JUMP
      text = user.name() + ' stürzt sich plötzlich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SCUTTLE': //Bug Bun Scuttle
      text = user.name() + ' krabbelt fröhlich herum.\r\n';
      text += 'It was really cute!\r\n';
      if(!user._noEffectMessage) {text += user.name() + ' wird FROH!';}
      else {text += parseNoEffectEmotion(user.name(), "FROHER!")}
      break;

    //RARE BEAR//
    case 'BEAR ATTACK': //BEAR ATTACK
      text = user.name() + ' geht auf ' + target.name() + ' los!\r\n';
      text += hpDamageText;
      break;

    case 'BEAR HUG': //BEAR HUG
      text = user.name() + ' umarmt ' + target.name() + '!\r\n';
      text += target.name() + 's INITIATIVE sinkt!\r\n';
      text += hpDamageText;
      break;

    case 'ROAR': //ROAR
      text = user.name() + ' lässt einen lauten Brüller raus!\r\n';
      if(!user._noEffectMessage) {text += user.name() + ' wird WÜTEND!';}
      else {text += parseNoEffectEmotion(user.name(), "WÜTENDER!")}
      break;

    //POTTED PALM//
    case 'PALM ATTACK': //PALM ATTACK
      text = user.name() + ' rammt sich in ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'PALM NOTHING': //PALM NOTHING
      text = user.name() + ' ruht sich im Topf aus. ';
      break;

    case 'PALM TRIP': //PALM TRIP
      text = target.name() + ' stolpert über ' + user.name() + 's Wurzeln.\r\n';
      text += hpDamageText + '.\r\n';
      text += target.name() + 's INITIATIVE sinkt.';
      break;

    case 'PALM EXPLOSION': //PALM EXPLOSION
      text = user.name() + ' explodiert!';
      break;

    //SPIDER CAT//
    case  'SPIDER ATTACK': //SPIDER ATTACK
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SPIDER NOTHING': //SPIDER NOTHING
      text = user.name() + ' spuckt einen Netzball aus.';
      break;

    case 'SPIN WEB': //SPIN WEB
       text = user.name() + ' schießt ein Netz auf ' + target.name() + '!\r\n';
       text += target.name() + 's INITIATIVE sinkt.';
       break;

    //SPROUT MOLE?//
    case 'SPROUT ATTACK 2':  // SPROUT MOLE? ATTACK
      text = user.name() + ' rempelt ' + target.name() + ' an?\r\n';
      text += hpDamageText;
      break;

    case 'SPROUT NOTHING 2':  // SPROUT MOLE? NOTHING
      text = user.name() + ' rollt herum?';
      break;

    case 'SPROUT RUN AROUND 2':  // SPROUT MOLE? RUN AROUND
      text = user.name() + ' rennt herum?';
      break;

    //HAROLD//
    case 'HAROLD ATTACK': //HAROLD ATTACK
      text = user.name() + ' schwingt sein Schwert auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'HAROLD NOTHING': // HAROLD NOTHING
      text = user.name() + ' stellt seinen Helm zurecht.';
      break;

    case 'HAROLD PROTECT': // HAROLD PROTECT
      text = user.name() + ' schützt sich.';
      break;

    case 'HAROLD WINK': //HAROLD WINK
      text = user.name() + ' zwinkert ' + target.name() + ' an.\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird FROH!';}
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;

    //MARSHA//
    case 'MARSHA ATTACK': //MARSHA ATTACK
      text = user.name() + ' schwingt ihre Axt auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MARSHA NOTHING': //MARSHA NOTHING
      text = user.name() + ' fällt hin.';
      break;

    case 'MARSHA SPIN': //MARSHA NOTHING
      text = user.name() + ' dreht sich in Schallgeschwindigkeit!\r\n';
      text += hpDamageText;
      break;

    case 'MARSHA CHOP': //MARSHA CHOP
      text = user.name() + ' knallt ihre Axt auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    //THERESE//
    case 'THERESE ATTACK': //THERESE ATTACK
      text = user.name() + ' schießt einen Pfeil auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'THERESE NOTHING': //THERESE NOTHING
      text = user.name() + ' lässt einen Pfeil fallen.';
      break;

    case 'THERESE SNIPE': //THERESE SNIPE
      text = user.name() + ' schießt auf ' + target.name() + 's Schwachstelle!\r\n';
      text += hpDamageText;
      break;

    case 'THERESE INSULT': //THERESE INSULT
      text = user.name() + ' nennt ' + target.name() + ' einen Schwachkopf!\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird WÜTEND!\r\n';}
      else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!\r\n")}
      text += hpDamageText;
      break;

    case 'DOUBLE SHOT': //THERESE DOUBLE SHOT
      text = user.name() + ' schießt zwei Pfeile auf einmal!';
      break;

    //LUSCIOUS//
    case 'LUSCIOUS ATTACK': //LUSCIOUS ATTACK
      text = user.name() + ' versucht einen Zauber zu wirken...\r\n';
      text += user.name() + ' macht etwas Magisches!\r\n';
      text += hpDamageText;
      break;

    case 'LUSCIOUS NOTHING': //LUSCIOUS NOTHING
      text = user.name() + ' versucht einen Zauber zu wirken...\r\n';
      text += 'Aber nichts geschieht...';
      break;

    case 'FIRE MAGIC': //FIRE MAGIC
      text = user.name() + ' versucht einen Zauber zu wirken...\r\n';
      text += user.name() + ' zündet die Gruppe an!\r\n';
      text += hpDamageText;
      break;

    case 'MISFIRE MAGIC': //MISFIRE MAGIC
      text = user.name() + ' versucht einen Zauber zu wirken...\r\n';
      text += user.name() + ' zündet den Raum an!!!\r\n';
      text += hpDamageText;
      break;

    //HORSE HEAD//
    case 'HORSE HEAD ATTACK': //HORSE HEAD ATTACK
      text = user.name() + ' beißt ' + target.name() + 's Arm.\r\n';
      text += hpDamageText;
      break;

    case 'HORSE HEAD NOTHING': //HORSE HEAD NOTHING
      text = user.name() + ' rülpst.';
      break;

    case 'HORSE HEAD LICK': //HORSE HEAD LICK
     text = user.name() + ' leckt ' + target.name() + 's Haar\r\n';
     text += hpDamageText + '\r\n';
     if(!target._noEffectMessage) {text += target.name() + ' wird WÜTEND!';}
     else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
     break;

    case 'HORSE HEAD WHINNY': //HORSE HEAD WHINNY
      text = user.name() + ' wiehert fröhlich um sich her!';
      break;

    //HORSE BUTT//
    case 'HORSE BUTT ATTACK': //HORSE BUTT ATTACK
      text = user.name() + ' stampft auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'HORSE BUTT NOTHING': //HORSE BUTT NOTHING
      text = user.name() + ' pupst.';
      break;

    case 'HORSE BUTT KICK': //HORSE BUTT KICK
      text = user.name() + ' kickt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'HORSE BUTT PRANCE': //HORSE BUTT PRANCE
      text = user.name() + ' tänzelt herum.';
      break;

    //FISH BUNNY//
    case 'FISH BUNNY ATTACK': //FISH BUNNY ATTACK
      text = user.name() + ' schwimmt auf ' + target.name() + ' zu!\r\n';
      text += hpDamageText;
      break;

    case 'FISH BUNNY NOTHING': //FISH BUNNY NOTHING
      text = user.name() + ' schwimmt im Kreis. ';
      break;

    case 'SCHOOLING': //SCHOOLING
      text = user.name() + ' ruft nach Freunden! ';
      break;

    //MAFIA ALLIGATOR//
    case 'MAFIA ATTACK': //MAFIA ATTACK
      text = user.name() + ' demonstriert ' + target.name() + ' seine\r\nbissigen Kauratekünste!\r\n';
      text += hpDamageText;
      break;

    case 'MAFIA NOTHING': //MAFIA NOTHING
      text = user.name() + ' knackst seine Knöchel.';
      break;

    case 'MAFIA ROUGH UP': //MAFIA ROUGH UP
      text = user.name() + ' verprügelt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MAFIA BACK UP': //MAFIA ALLIGATOR BACKUP
      text = user.name() + ' ruft nach Verstärkung!';
      break;

    //MUSSEL//
    case 'MUSSEL ATTACK': //MUSSEL ATTACK
      text = user.name() + ' haut ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MUSSEL FLEX': //MUSSEL FLEX
     text = user.name() + ' lässt seine Muskeln spielen!\r\n';
     text += user.name() + "'s TREFFERRATE steigt!\r\n"
     break;

    case 'MUSSEL HIDE': //MUSSEL HIDE
     text = user.name() + ' versteckt sich in seiner Schale.';
     break;

    //REVERSE MERMAID//
    case 'REVERSE ATTACK': //REVERSE ATTACK
     text = target.name() + ' läuft in ' + user.name() + ' rein!\r\n';
     text += hpDamageText;
     break;

    case 'REVERSE NOTHING': //REVERSE NOTHING
     text = user.name() + ' macht einen Rückwertssalto!\r\n';
     text += 'WOW!';
     break;

    case 'REVERSE RUN AROUND': //REVERSE RUN AROUND
      text = 'Alle laufen vor ' + user.name() + ' weg,\r\n';
      text += 'aber sie laufen stattdessen rein...\r\n';
      text += hpDamageText;
      break;

    //SHARK FIN//
    case 'SHARK FIN ATTACK': //SHARK FIN ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SHARK FIN NOTHING': //SHARK FIN NOTHING
      text = user.name() + ' schwimmt im Kreis.';
      break;

    case 'SHARK FIN BITE': //SHARK FIN BITE
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SHARK WORK UP': //SHARK FIN WORK UP
      text = user.name() + ' regt sich auf!\r\n';
      text += user.name() + 's INITIATIVE steigt!\r\n';
      if(!user._noEffectMessage) {
        text += user.name() + ' wird WÜTEND!';
      }
      else {text += parseNoEffectEmotion(user.name(), "WÜTENDER!")}
      break;

    //ANGLER FISH//
    case 'ANGLER ATTACK': //ANGLER FISH ATTACK
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'ANGLER NOTHING': //ANGLER FISH NOTHING
      text = user.name() + 's Magen knurrt.';
      break;

    case 'ANGLER LIGHT OFF': //ANGLER FISH LIGHT OFF
      text = user.name() + ' macht sein Licht aus.\r\n';
      text += user.name() + ' verschwindet in der Finsternis.';
      break;

    case 'ANGLER BRIGHT LIGHT': //ANGLER FISH BRIGHT LIGHT
      text = 'Alle sehen ihr Leben vor\r\n';
      text += 'ihren Augen aufblitzen!';
      break;

    case 'ANGLER CRUNCH': //ANGLER FISH CRUNCH
      text = user.name() + ' spießt ' + target.name() + ' mit seinen Zähnen auf!\r\n';
      text += hpDamageText;
      break;

    //SLIME BUNNY//
    case 'SLIME BUN ATTACK': //SLIME BUNNY ATTACK
      text = user.name() + ' schmiegt sich an ' + target.name() +'.\r\n';
      text += hpDamageText;
      break;

    case 'SLIME BUN NOTHING': //SLIME BUN NOTHING
      text = user.name() + ' lächelt alle an.\r\n';
      break;

    case 'SLIME BUN STICKY': //SLIME BUN STICKY
      text = user.name() + ' fühlt sich allein und weint.\r\n';
      if(!target._noStateMessage) {text += target.name() + 's INITIATIVE sinkt!\r\n';}
      else {text += parseNoStateChange(target.name(), "INITIATIVE", "tiefer!\r\n")}
      text += target.name() + " wird TRAURIG.";
      break;

    //WATERMELON MIMIC//
    case 'WATERMELON RUBBER BAND': //WATERMELON MIMIC RUBBER BAND
      text = user.name() + ' schleudert ein GUMMIBAND!\r\n';
      text += hpDamageText;
      break;

    case 'WATERMELON JACKS': //WATERMELON MIMIC JACKS
      text = user.name() + ' verteilt STECKNADELN!\r\n';
      text += hpDamageText;
      break;

    case 'WATERMELON DYNAMITE': //WATERMELON MIMIC DYNAMITE
      text = user.name() + ' schmeißt DYNAMITE!\r\n';
      text += 'OH NO!\r\n';
      text += hpDamageText;
      break;

    case 'WATERMELON WATERMELON SLICE': //WATERMELON MIMIC WATERMELON SLICE
      text = user.name() + ' wirft MELONENSAFT!\r\n';
      text += hpDamageText;
      break;

    case 'WATERMELON GRAPES': //WATERMELON MIMIC GRAPES
      text = user.name() + ' wirft TRAUBEN-LIMO!\r\n';
      text += hpDamageText;
      break;

    case 'WATEMELON FRENCH FRIES': //WATERMELON MIMIC FRENCH FRIES
      text = user.name() + ' wirft POMMES!\r\n';
      text += hpDamageText;
      break;

    case 'WATERMELON CONFETTI': //WATERMELON MIMIC CONFETTI
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' wirft KONFETTI!\r\n';
        text += "Alle werden FROH!"
      }
      target._noEffectMessage = undefined;
      break;

    case 'WATERMELON RAIN CLOUD': //WATERMELON MIMIC RAIN CLOUD
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' ruft eine REGENWOLKE herbei!\r\n';
        text += "Alle werden TRAURIG."
      }
      target._noEffectMessage = undefined;
      break;

    case 'WATERMELON AIR HORN': //WATERMELON MIMIC AIR HORN
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' benutzt ein RIESIGES AIR HORN!\r\n';
        text += "Alle werden WÜTEND!"
      }
      target._noEffectMessage = undefined;
      break;

    //SQUIZZARD//
    case 'SQUIZZARD ATTACK': //SQUIZZARD ATTACK
      text = user.name() + ' wirkt Magie auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SQUIZZARD NOTHING': //SQUIZZARD NOTHING
      text = user.name() + ' murmelt Unsinn.';
      break;

    case 'SQUID WARD': //SQUID WARD
      text = user.name() + ' erschafft ein Schild.\r\n';
      text += target.name() + 's VERTEIDIGUNG steigt.';
      break;

    case  'SQUID MAGIC': //SQUID MAGIC
      text = user.name() +  ' wirkt Tintenfisch-Magie!\r\n';
      text += 'Alle fühlen sich komisch...';
      break;

    //WORM-BOT//
    case 'BOT ATTACK': //MECHA WORM ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'BOT NOTHING': //MECHA WORM NOTHING
      text = user.name() + ' knirscht laut!';
      break;

    case 'BOT LASER': //MECHA WORM CRUNCH
      text = user.name() + ' schießt einen Laser auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'BOT FEED': //MECHA WORM FEED
      text = user.name() + ' frisst ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;


    //SNOT BUBBLE//
    case 'SNOT INFLATE': //SNOT INFLATE
      text = user.name() + 's Schnodder bläst sich auf!\r\n';
      text += target.name() + 's ANGRIFF steigt!';
      break;

    case 'SNOT POP': //SNOT POP
      text = user.name() + ' explodiert!\r\n';
      text += 'Schnodder fliegt durch die Gegend!!\r\n';
      text += hpDamageText;
      break;

    //LAB RAT//
    case  'LAB ATTACK': //LAB RAT ATTACK
      text = user.name() + ' schießt einen kleinen Maus-Laser!\r\n';
      text += hpDamageText;
      break;

    case  'LAB NOTHING': //LAB RAT NOTHING
      text = user.name() + ' lässt Dampf ab.';
      break;

    case  'LAB HAPPY GAS': //LAB RAT HAPPY GAS
      text = user.name() + ' setzt FROH-Gas frei!\r\n';
      text += 'Alle werden FROH!';
      target._noEffectMessage = undefined;
      break;

    case  'LAB SCURRY': //LAB RAT SCURRY
      text = user.name() + ' schwirrt herum!\r\n';
      break;

    //MECHA MOLE//
    case 'MECHA MOLE ATTACK': //MECHA MOLE ATTACK
      text = user.name() + ' schießt einen Laser auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'MECHA MOLE NOTHING': //MECHA MOLE NOTHING
      text = user.name() + 's Augen leuchten ein wenig.';
      break;

    case 'MECHA MOLE EXPLODE': //MECHA MOLE EXPLODE
      text = user.name() + ' vergießt eine einzelne Träne.\r\n';
      text += user.name() + ' explodiert glorreich!';
      break;

    case 'MECHA MOLE STRANGE LASER': //MECHA MOLE STRANGE LASER
      text = user.name() + 's strahlt ein komisches\r\n';
      text += 'Licht aus. ' + target.name() + ' fühlt sich komisch.';
      break;

    case 'MECHA MOLE JET PACK': //MECHA MOLE JET PACK
      text = 'Ein Jetpack erscheint auf ' + user.name() + '!\r\n';
      text += user.name() + ' fliegt durch alle!';
      break;

    //CHIMERA CHICKEN//
    case 'CHICKEN RUN AWAY': //CHIMERA CHICKEN RUN AWAY
      text = user.name() + ' rennt weg.';
      break;

    case 'CHICKEN NOTHING': //CHICKEN DO NOTHING
      text = user.name() + ' gackert. ';
      break;

    //SALLI//
    case 'SALLI ATTACK': //SALLI ATTACK
      text = user.name() + ' rennt in ' + target.name() + ' rein!\r\n';
      text += hpDamageText;
      break;

    case 'SALLI NOTHING': //SALLI NOTHING
      text = user.name() + ' macht einen kleinen Salto!';
      break;

    case 'SALLI INITIATIVE UP': //SALLI INITIATIVE UP
      text = user.name() + ' rast durch den Raum!\r\n';
      if(!target._noStateMessage) {
        text += user.name() + 's INITIATIVE steigt!';
      }
      else {text += parseNoStateChange(user.name(), "INITIATIVE", "höher!")}
      break;

    case 'SALLI DODGE ANNOY': //SALLI STARE
      text = user.name() + ' fokussiert sich intensiv! ';
      break;

    //CINDI//
    case 'CINDI ATTACK': //CINDI ATTACK
      text = user.name() + ' haut ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'CINDI NOTHING': //CINDI NOTHING
      text = user.name() + ' dreht sich im Kreis.';
      break;

    case 'CINDI SLAM': //CINDI SLAM
      text = user.name() + ' schlägt ihren Arm auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'CINDI COUNTER ATTACK': //CINDI COUNTER ATTACK
      text = user.name() + ' bereitet sich vor!';
      break;

    //DOROTHI//
    case 'DOROTHI ATTACK': //DOROTHI ATTACK
      text = user.name() + ' stampft auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'DOROTHI NOTHING': //DOROTHI NOTHING
      text = user.name() + ' weint in der Finsternis.';
      break;

    case 'DOROTHI KICK': //DOROTHI KICK
      text = user.name() + ' kickt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'DOROTHI HAPPY': //DOROTHI HAPPY
      text = user.name() + ' tänzelt herum!';
      break;

    //NANCI//
    case 'NANCI ATTACK': //NANCI ATTACK
      text = user.name() + ' sticht ihre Krallen in ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'NANCI NOTHING': //NANCI NOTHING
      text = user.name() + ' schwankt hin und her.';
      break;

    case 'NANCI ANGRY': //NANCI ANGRY
      text = user.name() + ' kocht vor Wut!';
      break;

    //MERCI//
    case 'MERCI ATTACK': //MERCI ATTACK
      text = user.name() + ' berührt ' + target.name() + 's Brust.\r\n';
      var pronumn = target.name() === "AUBREY" ? "ihre" : "seine";
      text += `${target.name()} fühlt, wie sich ${pronumn} Organe zerreißen!\r\n'`;
      text += hpDamageText;
      break;

    case 'MERCI NOTHING': //MERCI NOTHING
      text = user.name() + ' lächelt unheimlich.';
      break;

    case 'MERCI MELODY': //MERCI LAUGH
      text = user.name() + ' singt ein Lied.\r\n';
      text += target.name() + ' hört eine bekannte Melodie.\r\n';
      if(target.isStateAffected(6)) {text += target.name() + " wird FROH!\r\n"}
      else if(target.isStateAffected(7)) {text += target.name() + " wird BEGEISTERT!!\r\n"}
      else if(target.isStateAffected(8)) {text += target.name() + " wird WAHNSINNIG!!!\r\n"}
      break;

    case 'MERCI SCREAM': //MERCI SCREAM
      text = user.name() + ' gibt einen entsetzlichen Schrei von sich!\r\n';
      text += hpDamageText;
      break;


    //LILI//
    case 'LILI ATTACK': //LILI ATTACK
      text = user.name() + ' starrt in ' + target.name() + 's Seele!\r\n';
      text += hpDamageText;
      break;

    case 'LILI NOTHING': //LILI NOTHING
      text = user.name() + ' zwinkert.';
      break;

    case 'LILI MULTIPLY': //LILI MULTIPLY
      text = user.name() + 's Auge fällt raus!\r\n';
      text += 'Das Auge wurde zu einem weiteren ' + user.name() + '!';
      break;

    case 'LILI CRY': //LILI CRY
      text = 'Tränen sammeln sich in ' + user.name() + 's Augen.\r\n';
      text += target.name() + " wird TRAURIG."
      break;

    case 'LILI SAD EYES': //LILI SAD EYES
      text = target.name() + ' sieht Betrübtheit in ' + user.name() + 's Augen.\r\n';
      text += target.name() + ' will ' + user.name(); + ' nicht angreifen.\r\n'
      break;

    //HOUSEFLY//
    case 'HOUSEFLY ATTACK': //HOUSEFLY ATTACK
      text = user.name() + ' landet auf ' + target.name() + 's Gesicht.\r\n';
      text += target.name() + ' schlägt sich selbst ins Gesicht!\r\n';
      text += hpDamageText;
      break;

    case 'HOUSEFLY NOTHING': //HOUSEFLY NOTHING
      text = user.name() + ' schwirrt umher!';
      break;

    case 'HOUSEFLY ANNOY': //HOUSEFLY ANNOY
      text = user.name() + ' summt an ' + target.name() + 's Ohr!\r\n';
      if(!target._noEffectMessage) {text += target.name() + ' wird WÜTEND!';}
      else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
      break;

    //RECYCLIST//
    case 'FLING TRASH': //FLING TRASH
      text = user.name() + ' schleudert MÜLL auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'GATHER TRASH': //GATHER TRASH
      text = user.name() + ' findet MÜLL auf dem Boden\r\n';
      text += 'und kehrt ihn in seinen Sack!\r\n';
      text += hpDamageText;
      break;

    case 'RECYCLIST CALL FOR FRIENDS': //RECYCLIST CALL FOR FRIENDS
      text = user.name() + ' ruft nach RECYCULTISTs!!';
      break;

    //STRAY DOG//
    case 'STRAY DOG ATTACK': //STRAY DOG ATTACK
      text = user.name() + ' führt einen Beißangriff aus!\r\n';
      text += hpDamageText;
      break;

    case 'STRAY DOG HOWL': //STRAY DOG HOWL
      text = user.name() + ' lässt ein schrilles Geheul raus!';
      break;

    //CROW//
    case 'CROW ATTACK': //CROW ATTACK
      text = user.name() + ' pecks at ' + target.name() + 's eyes.\r\n';
      text += hpDamageText;
      break;

    case 'CROW GRIN': //CROW GRIN
      text = user.name() + ' has a big grin on his face.';
      break;

    case 'CROW STEAL': //CROW STEAL
      text = user.name() + ' steals something!';
      break;

    // BEE //
    case 'BEE ATTACK': //BEE Attack
      text = user.name() + ' sticht ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'BEE NOTHING': //BEE NOTHING
      text = user.name() + ' fliegt schnell durch die Gegend!';
      break;

    // GHOST BUNNY //
    case 'GHOST BUNNY ATTACK': //GHOST BUNNY ATTACK
      text = user.name() + ' dringt durch ' + target.name() + '!\r\n';
      text += target.name() + ' wird müde.\r\n';
      text += mpDamageText;
      break;

    case 'GHOST BUNNY NOTHING': //GHOST BUNNY DO NOTHING
      text = user.name() + ' fliegt auf der Stelle.';
      break;

    //TOAST GHOST//
    case 'TOAST GHOST ATTACK': //TOAST GHOST ATTACK
      text = user.name() + ' dringt durch ' + target.name() + '!\r\n';
      text += target.name() + ' wird müde.\r\n';
      text += hpDamageText;
      break;

    case 'TOAST GHOST NOTHING': //TOAST GHOST NOTHING
      text = user.name() + ' macht ein gruseliges Geräusch.';
      break;

    //SPROUT BUNNY//
    case 'SPROUT BUNNY ATTACK': //SPROUT BUNNY ATTACK
      text = user.name() + ' schlägt ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'SPROUT BUNNY NOTHING': //SPROUT BUNNY NOTHING
      text = user.name() + ' knabbert an Gras.';
      break;

    case 'SPROUT BUNNY FEED': //SPROUT BUNNY FEED
      text = user.name() + ' verspeist ' + target.name() + '.\r\n';
      text += `${user.name()} regeneriert ${Math.abs(hpDam)} HERZ!`
      break;

    //CELERY//
    case 'CELERY ATTACK': //CELERY ATTACK
      text = user.name() + ' rammt sich in ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'CELERY NOTHING': //CELERY NOTHING
      text = user.name() + ' fällt hin.';
      break;

    //CILANTRO//
    case 'CILANTRO ATTACK': //CILANTRO ATTACK
      text = user.name() + ' haut ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'CILANTRO NOTHING': //CILANTRO DO NOTHING
      text = user.name() + ' denkt über sein Leben nach.';
      break;

    case 'GARNISH': //CILANTRO GARNISH
      text = user.name() + ' opfert sich, um\r\n';
      text += target.name() + ' zu verbessern.';
      break;

    //GINGER//
    case 'GINGER ATTACK': //GINGER ATTACK
      text = user.name() + ' dreht durch und greift ' + target.name() + ' an.\r\n';
      text += hpDamageText;
      break;

    case 'GINGER NOTHING': //GINGER NOTHING
      text = user.name() + ' findet inneren Frieden.';
      break;

    case 'GINGER SOOTHE': //GINGER SOOTHE
      text = user.name() + ' beruhigt ' + target.name() + '.\r\n';
      break;

    //YE OLD MOLE//
    case 'YE OLD ROLL OVER': //MEGA SPROUT MOLE ROLL OVER
      text = user.name() + ' wälzt sich über alle!';
      text += hpDamageText;
      break;

    //KITE KID//
    case 'KITE KID ATTACK':  // KITE KID ATTACK
      text = user.name() + ' wirft STECKNADELN\r\nauf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'KITE KID BRAG':  // KITE KID BRAG
      text = user.name() + ' prahlt mit dem KINDESDRACHEN!\r\n';
      if(!target._noEffectMessage) {
        text += target.name() + ' wird FROH!';
      }
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;

    case 'REPAIR':  // REPAIR
      text = user.name() + ' verbindet den KINDESDRACHEN!\r\n';
      text += 'KINDESDRACHEN fühlt sich wie neu!';
      break;

    //KID'S KITE//
    case 'KIDS KITE ATTACK': // KIDS KITE ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'KITE NOTHING': // KITE NOTHING
      text = user.name() + ' ist übermütig!';
      break;

    case 'FLY 1':  // FLY 1
      text = user.name() + ' fliegt weit hoch!';
      break;

    case 'FLY 2':  // FLY 2
      text = user.name() + ' schießt herab!!';
      break;

    //PLUTO//
    case 'PLUTO NOTHING':  // PLUTO NOTHING
      text = user.name() + ' posiert!\r\n';
      break;

    case 'PLUTO HEADBUTT':  // PLUTO HEADBUTT
      text = user.name() + ' springt auf ' + target.name() + ' zu!\r\n';
      text += hpDamageText;
      break;

    case 'PLUTO BRAG':  // PLUTO BRAG
      text = user.name() + ' prahlt mit seinen Muskeln!\r\n';
      if(!user._noEffectMessage) {
        text += user.name() + ' wird FROH!';
      }
      else {text += parseNoEffectEmotion(user.name(), "FROHER!")}
      break;

    case 'PLUTO EXPAND':  // PLUTO EXPAND
      text = user.name() + ' kräftigt sich!!\r\n';
      if(!target._noStateMessage) {
        text += user.name() + 's ANGRIFF and VERTEIDIGUNG steigt!!\r\n';
        text += user.name() + 's INITIATIVE sinkt.';
      }
      else {
        text += parseNoStateChange(user.name(), "ATTACK", "höher!\r\n")
        text += parseNoStateChange(user.name(), "VERTEIDIGUNG", "höher!\r\n")
        text += parseNoStateChange(user.name(), "INITIATIVE", "tiefer!")
      }
      break;

    case 'EXPAND NOTHING':  // PLUTO NOTHING
      text = user.name() + 's Muskeln\r\n';
      text += 'schüchtern dich ein.';
      break;

    //RIGHT ARM//
    case 'R ARM ATTACK':  // R ARM ATTACK
      text = user.name() + ' schlägt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'GRAB':  // GRAB
      text = user.name() + ' packt ' + target.name() + '!\r\n';
      text += target.name() + 's INITIATIVE sinkt.\r\n';
      text += hpDamageText;
      break;

    //LEFT ARM//
    case 'L ARM ATTACK':  // L ARM ATTACK
      text = user.name() + ' haut ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'POKE':  // POKE
      text = user.name() + ' stupst ' + target.name() + ' an!\r\n';
      if(!target._noEffectMessage) {
        text += target.name() + ' wird WÜTEND!\r\n';
      }
      else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!\r\n")}
      text += hpDamageText;
      break;

    //DOWNLOAD WINDOW//
    case 'DL DO NOTHING':  // DL DO NOTHING
      text = user.name() + ' ist bei 99%.';
      break;

    case 'DL DO NOTHING 2':  // DL DO NOTHING 2
      text = user.name() + ' ist immernoch bei 99%...';
      break;

    case 'DOWNLOAD ATTACK':  // DOWNLOAD ATTACK
      text = user.name() + ' stürzt ab und brennt!';
      break;

    //SPACE EX-BOYFRIEND//
    case 'SXBF ATTACK':  // SXBF ATTACK
      text = user.name() + ' kickt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'SXBF NOTHING':  // SXBF NOTHING
      text = user.name() + ' schaut wehmütig\r\n';
      text += 'into the distance.';
      break;

    case 'ANGRY SONG':  // ANGRY SONG
      text = user.name() + ' jammert ungemein!';
      break;

    case 'ANGSTY SONG':  // ANGSTY SONG
      text = user.name() + ' singt betrübt...\r\n';
      if(target.isStateAffected(10)) {text += target.name() + ' wird TRAURIG.';}
      else if(target.isStateAffected(11)) {text += target.name() + ' wird DEPRIMIERT..';}
      else if(target.isStateAffected(12)) {text += target.name() + ' wird VERZWEIFELT...';}
      break;

    case 'BIG LASER':  // BIG LASER
      text = user.name() + ' schießt seinen Laser!\r\n';
      text += hpDamageText;
      break;

    case 'BULLET HELL':  // BULLET HELL
      text = user.name() + ' schießt aus\r\n';
      text += 'Verzweiflung wild herum!';
      break;

    case 'SXBF DESPERATE':  // SXBF NOTHING
      text = user.name() + '\r\n';
      text += 'knirscht mit seinen Zähnen!';
      break;

    //THE EARTH//
    case 'EARTH ATTACK':  // EARTH ATTACK
      text = user.name() + ' greift ' + target.name() + ' an!\r\n';
      text += hpDamageText
      break;

    case 'EARTH NOTHING':  // EARTH NOTHING
      text = user.name() + ' dreht sich langsam.';
      break;

    case 'EARTH CRUEL':  // EARTH CRUEL
      text = user.name() + ' ist gemein zu ' + target.name() + '!\r\n';
      if(target.isStateAffected(10)) {text += target.name() + ' wird TRAURIG.';}
      else if(target.isStateAffected(11)) {text += target.name() + ' wird DEPRIMIERT..';}
      else if(target.isStateAffected(12)) {text += target.name() + ' wird VERZWEIFELT...';}
      break;

    case 'CRUEL EPILOGUE':  // EARTH CRUEL
      if(target.index() <= unitLowestIndex) {
        text = user.name() + " ist gemein zu allen...\r\n";
        text += "Alle werden TRAURIG."
      }
      break;

    case 'PROTECT THE EARTH':  // PROTECT THE EARTH
      text = user.name() + ' entfacht ihren stärksten Angriff!';
      break;

    //SPACE BOYFRIEND//
    case 'SBF ATTACK': //SPACE BOYFRIEND ATTACK
      text = user.name() + ' kickt ' + target.name() + ' geschwind!\r\n';
      text += hpDamageText;
      break;

    case 'SBF LASER': //SPACE BOYFRIEND LASER
      text = user.name() + ' schießt seinen Laser!\r\n';
      text += hpDamageText;
      break;

    case 'SBF CALM DOWN': //SPACE BOYFRIEND CALM DOWN
      text = user.name() + ' bekommt seinen Kopf\r\n';
      text += 'frei und entfernt alle EMOTIONEN.';
      break;

    case 'SBF ANGRY SONG': //SPACE BOYFRIEND ANGRY SONG
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' jammert voller Wut!\r\n';
        text += "Alle werden WÜTEND!\r\n";
      }
      text += hpDamageText;
      break;

    case 'SBF ANGSTY SONG': //SPACE BOYFRIEND ANGSTY SONG
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' singt mit all der\r\n';
        text += 'Finsternis in seiner Seele!\r\n';
        text += "Alle werden TRAURIG.\r\n";
      }
      text += mpDamageText;
      break;

    case 'SBF JOYFUL SONG': //SPACE BOYFRIEND JOYFUL SONG
      if(target.index() <= unitLowestIndex) {
        text = user.name() + ' singt mit all der\r\n';
        text += "Freude in seinem Herzen!\r\n"
        text += "Alle werden FROH!\r\n";
      }
      text += hpDamageText;
      break;

    //NEFARIOUS CHIP//
    case 'EVIL CHIP ATTACK': //NEFARIOUS CHIP ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'EVIL CHIP NOTHING': //NEFARIOUS CHIP NOTHING
      text = user.name() + ' streicht seinen\r\n';
      text += 'bösen Bart!';
      break;


    case 'EVIL LAUGH': //NEFARIOUS LAUGH
      text = user.name() + ' lacht mit all\r\n';
      text += 'seiner Zwietracht!\r\n';
      if(!target._noEffectMessage) {text += target.name() + " wird FROH!"}
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;

    case 'EVIL COOKIES': //NEFARIOUS COOKIES
      text = user.name() + ' bewirft alle mit HAFERKEKSEN!\r\n';
      text += 'Wie gemein!';
      break;

    //BISCUIT AND DOUGHIE//
    case 'BD ATTACK': //BISCUIT AND DOUGHIE ATTACK
      text = user.name() + ' greifen gemeinsam an!\r\n';
      text += hpDamageText;
      break;

    case 'BD NOTHING': //BISCUIT AND DOUGHIE NOTHING
      text = user.name() + ' haben etwas\r\n';
      text += 'im Ofen vergessen!';
      break;

    case 'BD BAKE BREAD': //BISCUIT AND DOUGHIE BAKE BREAD
      text = user.name() + ' holen BROT\r\n';
      text += 'aus dem Ofen!';
      break;

    case 'BD COOK': //BISCUIT AND DOUGHIE CHEER UP
      text = user.name() + ' macht einen Keks!\r\n';
      text += `${target.name()} regeneriert ${Math.abs(hpDam)}\r\nHERZ!`
      break;

    case 'BD CHEER UP': //BISCUIT AND DOUGHIE CHEER UP
      text = user.name() + ' versuchen ihr\r\n';
      text += 'Bestes, nicht TRAURIG zu sein.';
      break;

    //KING CRAWLER//
    case 'KC ATTACK': //KING CRAWLER ATTACK
      text = user.name() + ' stürzt sich auf ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'KC NOTHING': //KING CRAWLER NOTHING
      text = user.name() + ' gibt einen ohren-\r\n';
      text += 'betäubenden Schrei von sich!\r\n';
      if(!target._noEffectMessage) {
        text += target.name() + " wird WÜTEND!";
      }
      else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
      break;

    case 'KC CONSUME': //KING CRAWLER CONSUME
      text = user.name() + ' frisst einen\r\n';
      text += "VERIRRTEN SPROSSWURF!\r\n"
      text += `${target.name()} regeneriert ${Math.abs(hpDam)} HERZ!\r\n`;
      break;

    case 'KC RECOVER': //KING CRAWLER CONSUME
      text = `${target.name()} regeneriert ${Math.abs(hpDam)} HERZ!\r\n`;
      if(!target._noEffectMessage) {text += target.name() + " wird FROH!"}
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
      break;

    case 'KC CRUNCH': //KING CRAWLER CRUNCH
      text = user.name() + ' beißt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'KC RAM': //KING CRAWLER RAM
      text = user.name() + ' rennt durch die Gruppe!\r\n';
      text += hpDamageText;
      break;

    //KING CARNIVORE//

    case "SWEET GAS":
      if(target.index() <= unitLowestIndex) {
        text = user.name() + " setzt Gas frei!\r\n";
        text += "Es riecht süßlich!\r\n";
        text += "Alle werden FROH!";
      }
      target._noEffectMessage = undefined;
      break;

    //SPROUTMOLE LADDER//
    case 'SML NOTHING': //SPROUT MOLE LADDER NOTHING
      text = user.name() + ' steht felsenfest herum. ';
      break;

    case 'SML SUMMON MOLE': //SPROUT MOLE LADDER SUMMON SPROUT MOLE
      text = 'Ein SPROSSWURF klettert ' + user.name() + ' hoch!';
      break;

    case 'SML REPAIR': //SPROUT MOLE LADDER REPAIR
      text = user.name() + ' wurde repariert.';
      break;

    //UGLY PLANT CREATURE//
    case 'UPC ATTACK': //UGLY PLANT CREATURE ATTACK
      text = user.name() + ' verwickelt\r\n';
      text += target.name() + ' in Ranken!\r\n';
      text += hpDamageText;
      break;

    case 'UPC NOTHING': //UGLY PLANT CRATURE NOTHING
      text = user.name() + ' brüllt!';
      break;

    //ROOTS//
    case 'ROOTS NOTHING': //ROOTS NOTHING
      text = user.name() + ' wackelt herum.';
      break;

    case 'ROOTS HEAL': //ROOTS HEAL
      text = user.name() + ' versorgt\r\n';
      text += target.name() + ' mit Nährstoffen.';
      break;

    //BANDITO MOLE//
    case 'BANDITO ATTACK': //BANDITO ATTACK
      text = user.name() + ' schlitzt ' + target.name() + '!\r\n';
      text += hpDamageText;
      break;

    case 'BANDITO STEAL': //BANDITO STEAL
      text = user.name() + ' klaut geschwind ein\r\n';
      text += 'Item von der Gruppe!'
      break;

    case 'B.E.D.': //B.E.D.
      text = user.name() + ' zuckt das B.E.D.!\r\n';
      text += hpDamageText;
      break;

    //SIR MAXIMUS//
    case 'MAX ATTACK': //SIR MAXIMUS ATTACK
      text = user.name() + ' schwingt sein Schwert!\r\n';
      text += hpDamageText;
      break;

    case 'MAX NOTHING': //SIR MAXIMUS NOTHING
      text = user.name() + ' zieht sich zurück...\r\n';
      if(!target._noEffectMessage) {
        text += target.name() + ' wird TRAURIG.'
      }
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!")}
      break;

    case 'MAX STRIKE': //SIR MAXIMUS SWIFT STRIKE
      text = user.name() + ' greift zweimal an!';
      break;

    case 'MAX ULTIMATE ATTACK': //SIR MAXIMUS ULTIMATE ATTACK
      text = '"ZEIT FÜR MEINEN ULTIMATIVEN ANGRIFF!"';
      text += hpDamageText;
      break;

    case 'MAX SPIN': //SIR MAXIMUS SPIN
        break;

    //SIR MAXIMUS II//
    case 'MAX 2 NOTHING': //SIR MAXIMUS II NOTHING
      text = user.name() + ' erinnert sich an\r\n';
      text += 'die letzten Worte seines Vaters.\r\n';
      if(!target._noEffectMessage) {
        text += target.name() + ' wird TRAURIG.'
      }
      else {text += parseNoEffectEmotion(target.name(), "TRAURIGER!")}
      break;

    //SIR MAXIMUS III//
    case 'MAX 3 NOTHING': //SIR MAXIMUS III NOTHING
      text = user.name() + ' erinnert sich an\r\n';
      text += 'die letzten Worte seines Großvaters.\r\n';
      text += target.name() + ' wird TRAURIG.'
      break;

    //SWEETHEART//
    case 'SH ATTACK': //SWEET HEART ATTACK
      text = user.name() + ' schlägt ' + target.name() + '.\r\n';
      text += hpDamageText;
      break;

    case 'SH INSULT': //SWEET HEART INSULT
      if(target.index() <= unitLowestIndex) {
        text = user.name() + " beleidigt alle!\r\n"
        text += "Alle werden WÜTEND!\r\n";
      }
      text += hpDamageText;
      target._noEffectMessage = undefined;
      break;

    case 'SH SNACK': //SWEET HEART SNACK
      text = user.name() + ' fordert von ihren\r\n';
      text += 'Dienern einen SNACK.\r\n';
      text += hpDamageText;
      break;

    case 'SH SWING MACE': //SWEET HEART SWING MACE
      text = user.name() + ' schwingt eifrig ihren Morgenstern!\r\n';
      text += hpDamageText;
      break;

    case 'SH BRAG': //SWEET HEART BRAG
      text = user.name() + ' prahlt über\r\n';
      text += 'eines ihrer vielen, vielen Talente!\r\n';
      if(!target._noEffectMessage) {
        if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!';}
        else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!';}
        else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!';}
      }
      else {text += parseNoEffectEmotion(target.name(), "FROHER!")}

      break;

      //MR. JAWSUM //
      case 'DESK SUMMON MINION': //MR. JAWSUM DESK SUMMON MINION
        text = user.name() + ' geht ans Telefon und\r\n';
        text += 'ruft einen KROKO-KERL!';
        break;

      case 'JAWSUM ANGRIFF ORDER': //MR. JAWSUM DESK ANGRIFF ORDER
        if(target.index() <= unitLowestIndex) {
          text = user.name() + ' gibt ein Kommando!\r\n';
          text += "Alle werden WÜTEND!";
        }
        break;

      case 'DESK NOTHING': //MR. JAWSUM DESK DO NOTHING
        text = user.name() + ' fängt an,\r\nMUSCHELN zu zählen.';
        break;

      //PLUTO EXPANDED//
      case 'EXPANDED ATTACK': //PLUTO EXPANDED ATTACK
        text = user.name() + ' wirft den Mond auf\r\n';
        text += target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'EXPANDED SUBMISSION HOLD': //PLUTO EXPANDED SUBMISSION HOLD
        text = user.name() + ' nimmt ' + target.name() + '\r\n';
        text += 'in einen Würgegriff!\r\n';
        text += target.name() + 's INITIATIVE sinkt.\r\n';
        text += hpDamageText;
        break;

      case 'EXPANDED HEADBUTT': //PLUTO EXPANDED HEADBUTT
        text = user.name() + ' verpasst\r\n';
        text += target.name() + ' einen Kopfstoß!\r\n';
        text += hpDamageText;
        break;

      case 'EXPANDED FLEX COUNTER': //PLUTO EXPANDED FLEX COUNTER
        text = user.name() + ' spannt seine Muskeln\r\n'
        text += 'an und bereitet sich vor!';
        break;

      case 'EXPANDED EXPAND FURTHER': //PLUTO EXPANDED EXPAND FURTHER
        text = user.name() + ' expandiert noch weiter!\r\n';
        if(!target._noStateMessage) {
          text += target.name() + 's ANGRIFF steigt!\r\n';
          text += target.name() + 's VERTEIDIGUNG steigt!\r\n';
          text += target.name() + 's INITIATIVE sinkt.';
        }
        else {
          text += parseNoStateChange(user.name(), "ATTACK", "höher!\r\n")
          text += parseNoStateChange(user.name(), "VERTEIDIGUNG", "höher!\r\n")
          text += parseNoStateChange(user.name(), "INITIATIVE", "tiefer!")
        }
        break;

      case 'EXPANDED EARTH SLAM': //PLUTO EXPANDED EARTH SLAM
        text = user.name() + ' ergreift die Erde\r\n';
        text += 'und rammt sie in alle hinein!';
        break;

      case 'EXPANDED ADMIRATION': //PLUTO EXPANDED ADMIRATION
        text = user.name() + ' bewundert KELs Fortschritt!\r\n';
        if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!';}
        else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!';}
        else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!';}
        break;

      //ABBI TENTACLE//
      case 'TENTACLE ATTACK': //ABBI TENTACLE ATTACK
        text = user.name() + ' knallt auf ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'TENTACLE TICKLE': //ABBI TENTACLE TICKLE
        text = user.name() + " schwächt " + target.name() + "!\r\n";
        text += `${target.name()} wird unachtsam!`
        break;

      case 'TENTACLE GRAB': //ABBI TENTACLE GRAB
        text = user.name() + ' wickelt sich um ' + target.name() + '!\r\n';
        if(result.isHit()) {
          if(target.name() !== "OMORI" && !target._noEffectMessage) {text += target.name() + " wird ÄNGSTLICH.\r\n";}
          else {text += parseNoEffectEmotion(target.name(), "AFRAID")}
        }
        text += hpDamageText;
        break;

      case 'TENTACLE GOOP': //ABBI TENTACLE GOOP
        text = target.name() + ' ist voller dunkler Flüssigkeit!\r\n';
        text += target.name() + ' fühlt sich schwächer...\r\n';
        text += target.name() + 's ANGRIFF sinkt.\r\n';
        text += target.name() + 's VERTEIDIGUNG sinkt.\r\n';
        text += target.name() + 's INITIATIVE sinkt.';
        break;

      //ABBI//
      case 'ABBI ATTACK': //ABBI ATTACK
        text = user.name() + ' greift ' + target.name() + ' an!\r\n';
        text += hpDamageText;
        break;

      case 'ABBI REVIVE TENTACLE': //ABBI REVIVE TENTACLE
        text = user.name() + ' fokussiert ihr HERZ.';
        break;

      case 'ABBI VANISH': //ABBI VANISH
        text = user.name() + ' verschwindet im Schatten...';
        break;

      case 'ABBI ANGRIFF ORDER': //ABBI ANGRIFF ORDER
        if(target.index() <= unitLowestIndex) {
          text = user.name() + ' streckt ihre Tentakel.\r\n';
          text += "ANGRIFF von allen steigt!!\r\n"
          text += "Alle werden WÜTEND!"
        }
        break;

      case 'ABBI COUNTER TENTACLE': //ABBI COUNTER TENTACLES
        text = user.name() + ' bewegt sich durch die Schatten...';
        break;

      //ROBO HEART//
      case 'ROBO HEART ATTACK': //ROBO HEART ATTACK
        text = user.name() + ' schießt Raketenhände!\r\n';
        text += hpDamageText;
        break;

      case 'ROBO HEART NOTHING': //ROBO HEART NOTHING
        text = user.name() + ' lädt...';
        break;

      case 'ROBO HEART LASER': //ROBO HEART LASER
        text = user.name() + ' öffnet ihren Mund und\r\n';
        text += 'schießt einen Laser!\r\n';
        text += hpDamageText;
        break;

      case 'ROBO HEART EXPLOSION': //ROBO HEART EXPLOSION
        text = user.name() + ' vergießt eine einzelne Roboterträne.\r\n';
        text += user.name() + ' explodiert!';
        break;

      case 'ROBO HEART SNACK': //ROBO HEART SNACK
        text = user.name() + ' öffnet ihren Mund.\r\n';
        text += 'Ein nährreicher SNACK erscheint!\r\n';
        text += hpDamageText;
        break;

      //MUTANT HEART//
      case 'MUTANT HEART ATTACK': //MUTANT HEART ATTACK
        text = user.name() + ' singt ' + target.name() + ' ein Lied!\r\n';
        text += 'Es war nicht sehr gut...\r\n';
        text += hpDamageText;
        break;

      case 'MUTANT HEART NOTHING': //MUTANT HEART NOTHING
        text = user.name() + ' posiert!';
        break;

      case 'MUTANT HEART HEAL': //MUTANT HEART HEAL
        text = user.name() + ' stellt ihr Kleid zurecht!';
        text += hpDamageText;
        break;

      case 'MUTANT HEART WINK': //MUTANT HEART WINK
        text = user.name() + ' zwinkert ' + target.name() + ' an!\r\n';
        text += 'Irgendwie süß...\r\n';
        if(!target._noEffectMessage){text += target.name() + ' wird FROH!';}
        else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
        break;

      case 'MUTANT HEART INSULT': //MUTANT HEART INSULT
        text = user.name() + ' sagt aus Versehen\r\n';
        text += 'etwas Gemeines.\r\n';
        if(!target._noEffectMessage){text += target.name() + ' wird WÜTEND!';}
        else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
        break;

      case 'MUTANT HEART KILL': //MUTANT HEART KILL
        text = 'MUTANTHEART schlägt ' + user.name() +'!\r\n';
        text += hpDamageText;
        break;

        //PERFECT HEART//
        case 'PERFECT STEAL HEART': //PERFECT HEART STEAL HEART
          text = user.name() + ' stielt ' + target.name() + 's\r\n';
          text += 'HERZ.\r\n';
          text += hpDamageText + "\r\n";
          if(user.result().hpDamage < 0) {text += `${user.name()} regeneriert ${Math.abs(user.result().hpDamage)} HERZ!\r\n`}
          break;

        case 'PERFECT STEAL BREATH': //PERFECT HEART STEAL BREATH
          text = user.name() + ' raubt ' + target.name() + 's\r\n';
          text += 'den Atem.\r\n';
          text += mpDamageText + "\r\n";
          if(user.result().mpDamage < 0) {text += `${user.name()} regeneriert ${Math.abs(user.result().mpDamage)} SAFT...\r\n`}
          break;

        case 'PERFECT EXPLOIT EMOTION': //PERFECT HEART EXPLOIT EMOTION
          text = user.name() + ' nutzt ' + target.name() + 's\r\n';
          text += 'EMOTIONEN aus!\r\n';
          text += hpDamageText;
          break;

        case 'PERFECT SPARE': //PERFECT SPARE
          text = user.name() + ' entscheidet sich,\r\n';
          text += target.name() + ' am Leben zu lassen.\r\n';
          text += hpDamageText;
          break;

        case 'PERFECT ANGELIC VOICE': //UPLIFTING HYMN
          if(target.index() <= unitLowestIndex) {
            text = user.name() + ' singt ein gefühlsvolles Lied...\r\n';
            if(!user._noEffectMessage) {text += user.name() + " wird TRAURIG.\r\n"}
            else {text += parseNoEffectEmotion(user.name(), "TRAURIGER!\r\n")}
            text += 'Alle werden FROH!';
          }
          break;

        case "PERFECT ANGELIC WRATH":
          if(target.index() <= unitLowestIndex) {text = user.name() + " entfacht ihren Zorn.\r\n";}
          if(!target._noEffectMessage) {
              if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!\r\n';}
              else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!\r\n';}
              else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!\r\n';}
              else if(target.isStateAffected(12)) {text += target.name() + ' wird VERZWEIFELT...\r\n';}
              else if(target.isStateAffected(11)) {text += target.name() + ' wird DEPRIMIERT..\r\n';}
              else if(target.isStateAffected(10)) {text += target.name() + ' wird TRAURIG.\r\n';}
              else if(target.isStateAffected(12)) {text += target.name() + ' wird ZORNIG!!!\r\n';}
              else if(target.isStateAffected(11)) {text += target.name() + ' wird EMPÖRT!!\r\n';}
              else if(target.isStateAffected(10)) {text += target.name() + ' wird WÜTEND!\r\n';}
          }
          else {
            if(target.isEmotionAffected("happy")) {text += parseNoEffectEmotion(target.name(), "FROHER!\r\n")}
            else if(target.isEmotionAffected("sad")) {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
            else if(target.isEmotionAffected("angry")) {text += parseNoEffectEmotion(target.name(), "WÜTENDER!\r\n")}
          }
          text += hpDamageText;
          break;

        //SLIME GIRLS//
        case 'SLIME GIRLS COMBO ATTACK': //SLIME GIRLS COMBO ATTACK
          text = 'The ' + user.name() + ' greifen gleichzeitig an!\r\n';
          text += hpDamageText;
          break;

        case 'SLIME GIRLS DO NOTHING': //SLIME GIRLS DO NOTHING
          text = 'MEDUSA wirft eine Flasche...\r\n';
          text += 'Aber nichts geschieht...';
          break;

        case 'SLIME GIRLS STRANGE GAS': //SLIME GIRLS STRANGE GAS
            if(!target._noEffectMessage) {
              if(target.isStateAffected(8)) {text += target.name() + ' wird WAHNSINNIG!!!\r\n';}
              else if(target.isStateAffected(7)) {text += target.name() + ' wird BEGEISTERT!!\r\n';}
              else if(target.isStateAffected(6)) {text += target.name() + ' wird FROH!\r\n';}
              else if(target.isStateAffected(12)) {text += target.name() + ' wird VERZWEIFELT...\r\n';}
              else if(target.isStateAffected(11)) {text += target.name() + ' wird DEPRIMIERT..\r\n';}
              else if(target.isStateAffected(10)) {text += target.name() + ' wird TRAURIG.\r\n';}
              else if(target.isStateAffected(16)) {text += target.name() + ' wird ZORNIG!!!\r\n';}
              else if(target.isStateAffected(15)) {text += target.name() + ' wird EMPÖRT!!\r\n';}
              else if(target.isStateAffected(14)) {text += target.name() + ' wird WÜTEND!\r\n';}
          }
          else {
            if(target.isEmotionAffected("happy")) {text += parseNoEffectEmotion(target.name(), "FROHER!\r\n")}
            else if(target.isEmotionAffected("sad")) {text += parseNoEffectEmotion(target.name(), "TRAURIGER!\r\n")}
            else if(target.isEmotionAffected("angry")) {text += parseNoEffectEmotion(target.name(), "WÜTENDER!\r\n")}
          }
          break;

        case 'SLIME GIRLS DYNAMITE': //SLIME GIRLS DYNAMITE
          //text = 'MEDUSA threw a bottle...\r\n';
          //text += 'And it explodiert!\r\n';
          text += hpDamageText;
          break;

        case 'SLIME GIRLS STING RAY': //SLIME GIRLS STING RAY
          text = 'MOLLY schießt ihre Stacheln!\r\n';
          text += target.name() + ' wird getroffen!\r\n';
          text += hpDamageText;
          break;

        case 'SLIME GIRLS SWAP': //SLIME GIRLS SWAP
          text = 'MEDUSA macht ihr Ding!\r\n';
          text += 'Dein HERZ und SAFT wurde vertauscht!';
          break;

        case 'SLIME GIRLS CHAIN SAW': //SLIME GIRLS CHAIN SAW
          text = 'MARINA zückt eine Kettensäge!\r\n';
          text += hpDamageText;
          break;

      //HUMPHREY SWARM//
      case 'H SWARM ATTACK': //HUMPHREY SWARM ATTACK
        var pronumn = target.name() === "AUBREY" ? "sie" : "ihn";
        text = 'HUMPHREY umzingelt ' + target.name() + ' und greift ' + pronumn + 'an!\r\n';
        text += hpDamageText;
        break;

      //HUMPHREY LARGE//
      case 'H LARGE ATTACK': //HUMPHREY LARGE ATTACK
        text = 'HUMPHREY rammt sich in ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      //HUMPHREY FACE//
      case 'H FACE CHOMP': //HUMPHREY FACE CHOMP
        text = 'HUMPHREY beißt sich in ' + target.name() + ' ein!\r\n';
        text += hpDamageText;
        break;

      case 'H FACE DO NOTHING': //HUMPHREY FACE DO NOTHING
        text = 'HUMPHREY starrt ' + target.name() + ' an!\r\n';
        text += 'HUMPHREYs läuft das Wasser im Mund zusammen.';
        break;

      case 'H FACE HEAL': //HUMPHREY FACE HEAL
        text = 'HUMPHREY verschlingt einen Gegner!\r\n';
        text += `HUMPHREY regeneriert ${Math.abs(hpDam)} HERZ!`
        break;

      //HUMPHREY UVULA//
      case 'UVULA DO NOTHING 1': //HUMPHREY UVULA DO NOTHING
        text = user.name() + ' grinst ' + target.name() + ' an.\r\n';
      break;

      case 'UVULA DO NOTHING 2': //HUMPHREY UVULA DO NOTHING
      text = user.name() + ' zwinkert ' + target.name() + ' an.\r\n';
      break;

      case 'UVULA DO NOTHING 3': //HUMPHREY UVULA DO NOTHING
      text = user.name() + ' spuckt auf ' + target.name() + '.\r\n';
      break;

      case 'UVULA DO NOTHING 4': //HUMPHREY UVULA DO NOTHING
      text = user.name() + ' starrt ' + target.name() + ' an.\r\n';
      break;

      case 'UVULA DO NOTHING 5': //HUMPHREY UVULA DO NOTHING
      text = user.name() + ' blinzelt ' + target.name() + ' an.\r\n';
      break;

      //FEAR OF FALLING//
      case 'DARK NOTHING': //SOMETHING IN THE DARK NOTHING
        text = user.name() + ' verhöhnt ' + target.name() + '\r\n';
        text += 'während er fällt.';
        break;

      case 'DARK ATTACK': //SOMETHING IN THE DARK ATTACK
        text = user.name() + ' schubst ' + target.name() + '.\r\n';
        text += hpDamageText;
        break;

      //FEAR OF BUGS//
      case 'BUGS ATTACK': //FEAR OF BUGS ATTACK
        text = user.name() + ' beißt ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'BUGS NOTHING': //FEAR OF BUGS NOTHING
        text = user.name() + ' versucht, mit dir zu reden...';
        break;

      case 'SUMMON BABY SPIDER': //SUMMON BABY SPIDER
        text = 'Ein Spinnen-Ei schlüpft\r\n';
        text += 'Eine BABY-SPINNE erscheint.';
        break;

      case 'BUGS SPIDER WEBS': //FEAR OF BUGS SPIDER WEBS
        text = user.name() + ' verwickelt ' + target.name() + '\r\n';
        text += 'in klebrigen Netzen.\r\n';
        text += target.name() + 's INITIATIVE sinkt!\r\n';
        break;

      //BABY SPIDER//
      case 'BABY SPIDER ATTACK': //BABY SPIDER ATTACK
        text = user.name() + ' beißt ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'BABY SPIDER NOTHING': //BABY SPIDER NOTHING
        text = user.name() + ' macht ein komisches Geräusch.';
        break;

      //FEAR OF DROWNING//
      case 'DROWNING ATTACK': //FEAR OF DROWNING ATTACK
        text = 'Wasser zieht ' + target.name() + ' in verschiedene\r\n';
        text += 'Richtungen.\r\n';
        text += hpDamageText;
        break;

      case 'DROWNING NOTHING': //FEAR OF DROWNING NOTHING
        text = user.name() + ' hört ' + target.name() + "s Qualen zu.";
        break;

      case 'DROWNING DRAG DOWN': //FEAR OF DROWNING DRAG DOWN
        // text = user.name() + ' grabs\r\n';
        // text += target.name() + '\s leg and drags him down!\r\n';
        text = hpDamageText;
        break;

      //OMORI'S SOMETHING//
      case 'O SOMETHING ATTACK': //OMORI SOMETHING ATTACK
        text = user.name() + ' greift durch ' + target.name() + '.\r\n';
        text += hpDamageText;
        break;

      case 'O SOMETHING NOTHING': //OMORI SOMETHING NOTHING
        text = user.name() + ' sieht durch ' + target.name() + '.\r\n';
        break;

      case 'O SOMETHING BLACK SPACE': //OMORI SOMETHING BLACK SPACE
        //text = user.name() + ' drags ' + target.name() + ' into\r\n';
        //text += 'the shadows.';
        text = hpDamageText;
        break;

      case 'O SOMETHING SUMMON': //OMORI SOMETHING SUMMON SOMETHING
        text = user.name() + ' ruft etwas aus\r\n';
        text += 'der Finsternis.';
        break;

      case 'O SOMETHING RANDOM EMOTION': //OMORI SOMETHING RANDOM EMOTION
        text = user.name() + ' spielt mit ' + target.name() +'s EMOTIONEN.';
        break;

      //BLURRY IMAGE//
      case 'BLURRY NOTHING': //BLURRY IMAGE NOTHING
        text = 'ETWAS flattert im Wind.';
        break;

      //HANGING BODY//
      case 'HANG WARNING':
          text = 'Du spürst, wie ein Schauer über den Rücken läuft.';
          break;

      case 'HANG NOTHING 1':
          text = 'Dir wird schwindlig.';
          break;

      case 'HANG NOTHING 2':
          text = 'Du spürst, wie sich deine Lungen\r\nzusammenziehen.';
          break;

      case 'HANG NOTHING 3':
          text = 'Du spürst etwas in deinen Magen\r\n';
          text += 'versinken.';
          break;

      case 'HANG NOTHING 4':
          text = 'Du spürst, wie dein Herz rast.';
          break;

      case 'HANG NOTHING 5':
          text = 'Du spürst, wie du zitterst.';
          break;

      case 'HANG NOTHING 6':
          text = 'Du spürst, wie deine Knie\r\nnachlassen.';
          break;

      case 'HANG NOTHING 7':
          text = 'Du spürst, wie Schweiß von deiner\r\n';
          text += 'Stirn tropft.';
          break;

      case 'HANG NOTHING 8':
          text = 'Du spürst, wie sich deine Faust\r\nvon selber ballt.';
          break;

      case 'HANG NOTHING 9':
          text = 'Du hörst dein Herz schlagen.';
          break;

      case 'HANG NOTHING 10':
          text = 'Du hörst, wie sich dein Herz\r\nstabilisiert.';
          break;

      case 'HANG NOTHING 11':
          text = 'Du hörst, wie sich dein Atem\r\nstabilisiert.';
          break;

      case 'HANG NOTHING 12':
          text = 'Du fokussierst dich darauf,\r\n';
          text += 'was vor dir ist.';
          break;

      //AUBREY//
      case 'AUBREY NOTHING': //AUBREY NOTHING
        text = user.name() + ' spuckt auf deinen Schuh.';
        break;

      case 'AUBREY TAUNT': //AUBREY TAUNT
        text = user.name() + ' nennt ' + target.name() + ' schwach!\r\n';
        text += target.name() + " wird WÜTEND!";
        break;

      //THE HOOLIGANS//
      case 'CHARLIE ATTACK': //HOOLIGANS CHARLIE ATTACK
        text = 'CHARLIE gibt alles!\r\n';
        text += hpDamageText;
        break;

      case 'ANGEL ATTACK': //HOOLIGANS ANGEL ATTACK
        text = 'ANGEL schlägt ' + target.name() + ' geschwind!\r\n';
        text += hpDamageText;
        break;

      case 'MAVERICK CHARM': //HOOLIGANS MAVERICK CHARM
        text = 'DER EINZELGÄNGER zwinkert ' + target.name() + ' an!\r\n';
        text += target.name() + 's ANGRIFF sinkt.'
        break;

      case 'KIM HEADBUTT': //HOOLIGANS KIM HEADBUTT
        text = 'KIM rammt ihren Kopf in ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'VANCE CANDY': //HOOLIGANS VANCE CANDY
        text = 'VANCE wirft Bonbon!\r\n';
        text += hpDamageText;
        break;

      case 'HOOLIGANS GROUP ATTACK': //THE HOOLIGANS GROUP ATTACK
        text = user.name() + ' gehen aufs Ganze!\r\n';
        text += hpDamageText;
        break;

      //BASIL//
      case 'BASIL ATTACK': //BASIL ATTACK
        text = user.name() + ' greift in ' + target.name() + ' hinein.\r\n';
        text += hpDamageText;
        break;

      case 'BASIL NOTHING': //BASIL NOTHING
        text = user.name() + 's Augen sind rot vom Weinen.';
        break;

      case 'BASIL PREMPTIVE STRIKE': //BASIL PREMPTIVE STRIKE
        text = user.name() + ' schlitzt ' + target.name() +'s Arm.\r\n';
        text += hpDamageText;
        break;

      //BASIL'S SOMETHING//
      case 'B SOMETHING ATTACK': //BASIL'S SOMETHING ATTACK
        text = user.name() + ' würgt ' + target.name() + '.\r\n';
        text += hpDamageText;
        break;

      case 'B SOMETHING TAUNT': //BASIL'S SOMETHING TAUNT BASIL
        text = user.name() + ' greift in ' + target.name() + ' hinein.\r\n';
        break;

      //PLAYER SOMETHING BASIL FIGHT//
      case 'B PLAYER SOMETHING STRESS': //B PLAYER SOMETHING STRESS
        text = user.name() + ' tut ' + target.name() + ' etwas.\r\n';
        text += hpDamageText;
        break;

      case 'B PLAYER SOMETHING HEAL': //B PLAYER SOMETHING HEAL
        text = user.name() + ' sickert durch ' + target.name() + 's Wunden.\r\n';
        text += hpDamageText;
        break;

      case 'B OMORI SOMETHING CONSUME EMOTION': //B OMORI SOMETHING CONSUME EMOTION
        text = user.name() + ' verzehrt ' + target.name() + 's EMOTIONEN.';
        break;

      //CHARLIE//
      case 'CHARLIE RELUCTANT ATTACK': //CHARLIE RELUCTANT ATTACK
        text = user.name() + ' haut ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'CHARLIE NOTHING': //CHARLIE NOTHING
        text = user.name() + ' steht rum.';
        break;

      case 'CHARLIE LEAVE': //CHARLIE LEAVE
        text = user.name() + ' hört auf, zu kämpfen.';
        break;

      //ANGEL//
      case 'ANGEL ATTACK': //ANGEL ATTACK
        text = user.name() + ' kickt ' + target.name() + ' geschwind!\r\n';
        text += hpDamageText;
        break;

      case 'ANGEL NOTHING': //ANGEL NOTHING
        text = user.name() + ' macht einen Salto und posiert!';
        break;

      case 'ANGEL QUICK ATTACK': //ANGEL QUICK ATTACK
        text = user.name() + ' teleportiert sich hinter ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'ANGEL TEASE': //ANGEL TEASE
        text = user.name() + ' sagt böse Dinge über ' + target.name() + '!';
        break;

      //THE MAVERICK//
      case 'MAVERICK ATTACK': //THE MAVERICK ATTACK
        text = user.name() + ' schlägt ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'MAVERICK NOTHING': //THE MAVERICK NOTHING
        text = user.name() + ' prahlt vor seinen\r\n';
        text += 'verehrenden Fans!';
        break;

      case 'MAVERICK SMILE': //THE MAVERICK SMILE
        text = user.name() + ' lächelt verführerisch!\r\n';
        text += target.name() + 's ANGRIFF sinkt.';
        break;

      case 'MAVERICK TAUNT': //THE MAVERICK TAUNT
        text = user.name() + ' macht sich über\r\n';
        text += target.name() + ' lustig!\r\n';
        text += target.name() + " wird WÜTEND!"
        break;

      //KIM//
      case 'KIM ATTACK': //KIM ATTACK
        text = user.name() + ' haut ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'KIM NOTHING': //KIM DO NOTHING
        text = user.name() + 's Telefon klingelt...\r\n';
        text += 'Verwählt.';
        break;

      case 'KIM SMASH': //KIM SMASH
        text = user.name() + ' ergreift ' + target.name() + 's Shirt und\r\n';
        text += 'haut ihm ins Gesicht!\r\n';
        text += hpDamageText;
        break;

      case 'KIM TAUNT': //KIM TAUNT
        text = user.name() + ' macht sich über ' + target.name() + ' lustig!\r\n';
        text += target.name() + " wird TRAURIG.";
        break;

      //VANCE//
      case 'VANCE ATTACK': //VANCE ATTACK
        text = user.name() + ' haut ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'VANCE NOTHING': //VANCE NOTHING
        text = user.name() + ' kratzt seinen Bauch.';
        break;

      case 'VANCE CANDY': //VANCE CANDY
        text = user.name() + ' wirft altes Bonbon auf ' + target.name() + '!\r\n';
        text += 'Igitt... Es ist klebrig...\r\n';
        text += hpDamageText;
        break;

      case 'VANCE TEASE': //VANCE TEASE
        text = user.name() + ' sagt böse Dinge über ' + target.name() + '!\r\n';
        text += target.name() + " wird TRAURIG."
        break;

      //JACKSON//
      case 'JACKSON WALK SLOWLY': //JACKSON WALK SLOWLY
        text = user.name() + ' kommt langsam näher...\r\n';
        text += 'Du spürst dich auswegslos!';
        break;

      case 'JACKSON KILL': //JACKSON AUTO KILL
        text = user.name() + ' HAT DICH GEFANGEN!!!\r\n';
        text += 'Du siehst dein Leben vor\r\ndeinen Augen aufblitzen!';
        break;

      //RECYCLEPATH//
      case 'R PATH ATTACK': //RECYCLEPATH ATTACK
        text = user.name() + ' schlägt ' + target.name() + ' mit einem Sack!\r\n';
        text += hpDamageText;
        break;

      case 'R PATH SUMMON MINION': //RECYCLEPATH SUMMON MINION
        text = user.name() + ' ruft einen Anhänger!\r\n';
        text += 'Ein RECYCULTIST erscheint!';
        break;

      case 'R PATH FLING TRASH': //RECYCLEPATH FLING TRASH
        text = user.name() + ' schleudert all seinen\r\n';
        text += 'MÜLL auf ' + target.name() + '!\r\n'
        text += hpDamageText;
        break;

      case 'R PATH GATHER TRASH': //RECYCLEPATH GATHER TRASH
        text = user.name() + ' hebt MÜLL auf.';
        break;

    //SOMETHING IN THE CLOSET//
      case 'CLOSET ATTACK': //SOMETHING IN THE CLOSET ATTACK
        text = user.name() + ' zieht ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      case 'CLOSET NOTHING': //SOMETHING IN THE CLOSET DO NOTHING
        text = user.name() + ' murmelt unheimlich.';
        break;

      case 'CLOSET MAKE AFRAID': //SOMETHING IN THE CLOSET MAKE AFRAID
        text = user.name() + ' knows your secret!';
        break;

      case 'CLOSET MAKE WEAK': //SOMETHING IN THE CLOSET MAKE WEAK
        text = user.name() + ' saps ' + target.name() + 's will to live!';
        break;

    //BIG STRONG TREE//
      case 'BST SWAY': //BIG STRONG TREE NOTHING 1
        text = 'Eine leichte Brise weht durch die Blätter.';
        break;

      case 'BST NOTHING': //BIG STRONG TREE NOTHING 2
        text = user.name() + ' steht still, weil\r\n';
        text += 'er ein Baum ist.';
        break;

    //DREAMWORLD FEAR EXTRA BATTLES//
    //HEIGHTS//
    case 'DREAM HEIGHTS ATTACK': //DREAM FEAR OF HEIGHTS ATTACK
      text = user.name() + ' greift ' + target.name() + ' an.\r\n';
      text += hpDamageText;
      break;

    case 'DREAM HEIGHTS GRAB': //DREAM FEAR OF HEIGHTS GRAB
      if(target.index() <= unitLowestIndex) {
        text = 'Hände erscheinen und greifen alle!\r\n';
        text += 'ANGRIFF von allen sinkt...';
      }

      break;

    case 'DREAM HEIGHTS HANDS': //DREAM FEAR OF HEIGHTS HANDS
      text = 'Mehr Hände erscheinen und\r\n';
      text += 'umzingeln ' + user.name() + '.\r\n';
      if(!target._noStateMessage) {text += user.name() + 's VERTEIDIGUNG steigt!';}
      else {text += parseNoStateChange(user.name(), "VERTEIDIGUNG", "höher!")}
      break;

    case 'DREAM HEIGHTS SHOVE': //DREAM FEAR OF HEIGHTS SHOVE
      text = user.name() + ' schubst ' + target.name() + '.\r\n';
      text += hpDamageText + '\r\n';
      if(!target._noEffectMessage && target.name() !== "OMORI"){text += target.name() + ' wird ÄNGSTLICH.';}
      else {text += parseNoEffectEmotion(target.name(), "AFRAID")}
      break;

    case 'DREAM HEIGHTS RELEASE ANGER': //DREAM FEAR OF HEIGHTS RELEASE ANGER
      text = user.name() + ' lässt seine WUT raus!';
      break;

    //SPIDERS//
    case 'DREAM SPIDERS CONSUME': //DREAM FEAR OF SPIDERS CONSUME
     var pronumn = target.name() === "AUBREY" ? "sie" : "ihn";
      text = user.name() + ' wickelt ' + target.name() + ' ein und frisst ' + pronumn + '.\r\n';
      text += hpDamageText;
      break;

    //DROWNING//
    case 'DREAM DROWNING SMALL': //DREAM FEAR OF DROWNING SMALL
      text = 'Alle tun sich schwer, zu atmen.';
      break;

    case 'DREAM DROWNING BIG': //DREAM FEAR OF DROWNING BIG
      text = 'Alle fühlen sich, als würden sie\r\nbewusstlos werden.';
      break;

    // BLACK SPACE EXTRA //
    case 'BS LIAR': // BLACK SPACE LIAR
      text = 'Lügner.';
      break;

    //BACKGROUND ACTORS//
    //BERLY//
      case 'BERLY ATTACK': //BERLY ATTACK
        text = 'BERLY verpasst ' + target.name() + ' eine Kopfnuss!\r\n';
        text += hpDamageText;
        break;

      case 'BERLY NOTHING 1': //BERLY NOTHING 1
        text = 'BERLY versteckt sich mutig.';
        break;

      case 'BERLY NOTHING 2': //BERLY NOTHING 2
        text = 'BERLY justiert ihre Brille.';
        break;

      //TOYS//
      case 'CAN':  // CAN
        text = user.name() + ' kickt die DOSE.';
        break;

      case 'DANDELION':  // DANDELION
        text = user.name() + ' pustet auf die PUSTEBLUME.\r\n';
        text += user.name() + ' fühlt sich wieder wie sich selbst.';
        break;

      case 'DYNAMITE':  // DYNAMITE
        text = user.name() + ' wirft DYNAMIT!';
        break;

      case 'LIFE JAM':  // LIFE JAM
        text = user.name() + ' benutzt MARMELEBEN auf TOAST!\r\n';
        text += 'TOAST wurde zu ' + target.name() + '!';
        break;

      case 'PRESENT':  // PRESENT
        text = target.name() + ' öffnet das GESCHENK\r\n';
        text += 'Es ist nicht, was ' + target.name() + ' wollte...\r\n';
        if(!target._noEffectMessage){text += target.name() + ' wird WÜTEND! ';}
        else {text += parseNoEffectEmotion(target.name(), "WÜTENDER!")}
        break;

      case 'SILLY STRING':  // DYNAMITE
        if(target.index() <= unitLowestIndex) {
          text = user.name() + ' uses SILLY STRING!\r\n';
          text += 'WOOOOO!! Party!\r\n';
          text += 'Alle werden FROH! ';
        }
        break;

      case 'SPARKLER':  // SPARKLER
        text = user.name() + ' zündet die WUNDERKERZE an!\r\n';
        text += 'WOOOOO!! Party!\r\n';
        if(!target._noEffectMessage){text += target.name() + ' wird FROH!';}
        else {text += parseNoEffectEmotion(target.name(), "FROHER!")}
        break;

      case 'COFFEE': // COFFEE
        text = user.name() + ' trinkt den KAFFEE...\r\n';
        text += user.name() + ' fühlt sich großartig!';
        break;

      case 'RUBBERBAND': // RUBBERBAND
        text = user.name() + ' schleudert auf ' + target.name() + '!\r\n';
        text += hpDamageText;
        break;

      //OMORI BATTLE//

      case "OMORI ERASES":
        text = user.name() + " löscht den Gegner aus.\r\n";
        text += hpDamageText;
        break;

      case "MARI ATTACK":
        text = user.name() + " löscht den Gegner aus.\r\n";
        text += target.name() + " wird ÄNGSTLICH.\r\n";
        text += hpDamageText;
        break;

      //STATES//
      case 'HAPPY':
        if(!target._noEffectMessage){text = target.name() + ' wird FROH!';}
        else {text = parseNoEffectEmotion(target.name(), "FROHER!")}
        break;

      case 'ECSTATIC':
        if(!target._noEffectMessage){text = target.name() + ' wird BEGEISTERT!!';}
        else {text = parseNoEffectEmotion(target.name(), "FROHER!")}
        break;

      case 'MANIC':
        if(!target._noEffectMessage){text = target.name() + ' wird WAHNSINNIG!!!';}
        else {text = parseNoEffectEmotion(target.name(), "FROHER!")}
        break;

      case 'SAD':
        if(!target._noEffectMessage){text = target.name() + ' wird TRAURIG.';}
        else {text = parseNoEffectEmotion(target.name(), "TRAURIGER!")}
        break;

      case 'DEPRESSED':
        if(!target._noEffectMessage){text = target.name() + ' wird DEPRIMIERT..';}
        else {text = parseNoEffectEmotion(target.name(), "TRAURIGER!")}
        break;

      case 'MISERABLE':
        if(!target._noEffectMessage){text = target.name() + ' wird VERZWEIFELT...';}
        else {text = parseNoEffectEmotion(target.name(), "TRAURIGER!")}
        break;

      case 'ANGRY':
        if(!target._noEffectMessage){text = target.name() + ' wird WÜTEND!';}
        else {text = parseNoEffectEmotion(target.name(), "WÜTENDER!")}
        break;

      case 'ENRAGED':
        if(!target._noEffectMessage){text = target.name() + ' wird EMPÖRT!!';}
        else {text = parseNoEffectEmotion(target.name(), "WÜTENDER!")}
        break;

      case 'FURIOUS':
        if(!target._noEffectMessage){text = target.name() + ' wird ZORNIG!!!'}
        else {text = parseNoEffectEmotion(target.name(), "WÜTENDER!")}
        break;

      case 'AFRAID':
        if(!target._noEffectMessage){text = target.name() + ' wird ÄNGSTLICH!';}
        else {text = parseNoEffectEmotion(target.name(), "AFRAID")}
        break;

      case 'CANNOT MOVE':
        text = target.name() + ' ist bewegungsunfähig! ';
        break;

      case 'INFATUATION':
        text = target.name() + ' erstarrt vor Liebe! ';
        break;

    //SNALEY//
    case 'SNALEY MEGAPHONE': // SNALEY MEGAPHONE
      if(target.index() <= unitLowestIndex) {text = user.name() + ' benutzt ein AIR HORN!\r\n';}
      if(target.isStateAffected(16)) {text += target.name() + ' wird ZORNIG!!!\r\n'}
      else if(target.isStateAffected(15)) {text += target.name() + ' wird EMPÖRT!!\r\n'}
      else if(target.isStateAffected(14)) {text += target.name() + ' wird WÜTEND!\r\n'}
      break;

  }
  // Return Text
  return text;
};
//=============================================================================
// * Display Custom Action Text
//=============================================================================
Window_BattleLog.prototype.displayCustomActionText = function(subject, target, item) {
  // Make Custom Action Text
  var text = this.makeCustomActionText(subject, target, item);
  // If Text Length is more than 0
  if (text.length > 0) {
    if(!!this._multiHitFlag && !!item.isRepeatingSkill) {return;}
    // Get Get
    text = text.split(/\r\n/);
    for (var i = 0; i < text.length; i++) { this.push('addText', text[i]); }
    // Add Wait
    this.push('wait', 15);

  }
  if(!!item.isRepeatingSkill) {this._multiHitFlag = true;}
};
//=============================================================================
// * Display Action
//=============================================================================
Window_BattleLog.prototype.displayAction = function(subject, item) {
  // Return if Item has Custom Battle Log Type
  if (item.meta.BattleLogType) { return; }
  // Run Original Function
  _TDS_.CustomBattleActionText.Window_BattleLog_displayAction.call(this, subject, item);
};
//=============================================================================
// * Display Action Results
//=============================================================================
Window_BattleLog.prototype.displayActionResults = function(subject, target) {
  // Get Item Object
  var item = BattleManager._action._item.object();
  // If Item has custom battle log type
  if (item && item.meta.BattleLogType) {
    // Display Custom Action Text
    this.displayCustomActionText(subject, target, item);
    // Return
  }
  // Run Original Function
  else {
    _TDS_.CustomBattleActionText.Window_BattleLog_displayActionResults.call(this, subject, target);
  }
};

const _old_window_battleLog_displayHpDamage = Window_BattleLog.prototype.displayHpDamage
Window_BattleLog.prototype.displayHpDamage = function(target) {
  let result = target.result();
  if(result.isHit() && result.hpDamage > 0) {
    if(!!result.elementStrong) {
      this.push("addText","...Es war ein bewegender Angriff!");
      this.push("waitForNewLine");
    }
    else if(!!result.elementWeak) {
      this.push("addText", "...Es war ein dumpfer Angriff!");
      this.push("waitForNewLine")
    }
  }
  return _old_window_battleLog_displayHpDamage.call(this, target)
};

//=============================================================================
// * CLEAR
//=============================================================================
_TDS_.CustomBattleActionText.Window_BattleLog_endAction= Window_BattleLog.prototype.endAction;
Window_BattleLog.prototype.endAction = function() {
  _TDS_.CustomBattleActionText.Window_BattleLog_endAction.call(this);
  this._multiHitFlag = false;
};

//=============================================================================
// * DISPLAY ADDED STATES
//=============================================================================
