export const fastText = () => {
  /**
   * makes text appear instantly instead of animating in
   * https://github.com/rphsoftware/omori-utils/blob/master/insta-show/rph.instashow.js
   * modified by function
   */
  Object.defineProperty(
    Window_Message.prototype,
    "_lineShowFast",
    {
      value: true
    }
  )
}

/**
 * @param {string} modId
 * @returns {boolean}
 */
export const hasMod = (modId) => {
  const hasOneLoader = window.$modLoader !== undefined

  if (!hasOneLoader) {
    return false
  }

  return $modLoader.knownMods.has(modId)
}

export const isDev = () => {
  const hasOneLoader = window.$modLoader !== undefined

  if (!hasOneLoader) {
    return false
  }

  const modJson = $modLoader.knownMods.get("omori-german").json
  return modJson.version === "dev"
}

export const addOmoriGermanSplash = () => {
  Galv.ASPLASH.splashImgs.push({
    image: "splash-omori-german",
    timer: 200,
    fade: 3,
    anim: 314
  })
}

export const skipSplashes = () => {
  Galv.ASPLASH.splashImgs = [
    {
      image: "splashGalv",
      timer: 1,
      fade: 50000000,
      anim: 314
    }
  ]
}
