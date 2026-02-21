export interface ImageCropData {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export function cropImage(imageUrl: string, cropData: ImageCropData, maxSize = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Calcular dimensiones finales
      const scaledWidth = img.width * cropData.scale
      const scaledHeight = img.height * cropData.scale

      // Calcular crop en píxeles reales
      const cropX = cropData.x * (img.width / cropData.scale)
      const cropY = cropData.y * (img.height / cropData.scale)
      const cropWidth = cropData.width * (img.width / cropData.scale)
      const cropHeight = cropData.height * (img.height / cropData.scale)

      // Redimensionar si es necesario
      let finalWidth = cropWidth
      let finalHeight = cropHeight

      if (Math.max(cropWidth, cropHeight) > maxSize) {
        const ratio = cropWidth / cropHeight
        if (cropWidth > cropHeight) {
          finalWidth = maxSize
          finalHeight = maxSize / ratio
        } else {
          finalHeight = maxSize
          finalWidth = maxSize * ratio
        }
      }

      canvas.width = finalWidth
      canvas.height = finalHeight

      // Dibujar imagen recortada y redimensionada
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, finalWidth, finalHeight)

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error("Failed to create blob"))
          }
        },
        "image/jpeg",
        0.9,
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageUrl
  })
}
