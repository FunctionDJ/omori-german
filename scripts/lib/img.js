import imagemin from "imagemin"
import imageminPngquant from "imagemin-pngquant"

export const loadAndCompressPng = async filepath => {
  const [result] = await imagemin([filepath], {
    plugins: [
      imageminPngquant({
        speed: 1,
        strip: true,
        dithering: 0,
        quality: [0.8, 1]
      })
    ]
  })

  return result.data
}