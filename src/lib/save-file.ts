function isIOS() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

export function dataUrlToBlob(dataUrl: string) {
  const [meta, data] = dataUrl.split(",")
  const mime = meta.match(/data:(.*?);/)?.[1] || "application/octet-stream"
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function canShareFile(file: File) {
  try {
    return (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    )
  } catch {
    return false
  }
}

export async function saveBlob(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type || "application/octet-stream" })

  if (canShareFile(file)) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.rel = "noopener"
    if (isIOS()) link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 4_000)
  }
}

export async function saveDataUrl(dataUrl: string, filename: string) {
  await saveBlob(dataUrlToBlob(dataUrl), filename)
}
