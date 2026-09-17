async function toDataUrl(src: string) {
  const url = /^https?:|^data:|^blob:/i.test(src) ? src : new URL(src, window.location.origin).href
  const response = await fetch(url, { cache: "force-cache", credentials: "same-origin" })
  if (!response.ok) throw new Error("Could not load image.")
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function inlineImages(node: HTMLElement) {
  const images = [...node.querySelectorAll("img")]
  await Promise.all(
    images.map(async (img) => {
      const src = img.currentSrc || img.getAttribute("src") || ""
      if (!src || src.startsWith("data:")) return
      try {
        const dataUrl = await toDataUrl(src)
        img.removeAttribute("srcset")
        img.src = dataUrl
        if (typeof img.decode === "function") await img.decode()
      } catch {
        // Keep the original src if inlining fails.
      }
    }),
  )
}

function needsSafariPasses() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (/Safari/i.test(ua) && !/Chrome|Chromium|Android/i.test(ua))
}

export async function elementToPng(
  node: HTMLElement,
  options?: { pixelRatio?: number; backgroundColor?: string },
) {
  await inlineImages(node)
  const { toPng } = await import("html-to-image")
  const captureOptions = {
    pixelRatio: options?.pixelRatio ?? 2,
    cacheBust: true,
    backgroundColor: options?.backgroundColor ?? "#ffffff",
  }
  const passes = needsSafariPasses() ? 4 : 1
  let dataUrl = ""
  for (let i = 0; i < passes; i += 1) {
    dataUrl = await toPng(node, captureOptions)
    if (i < passes - 1) await new Promise((resolve) => window.setTimeout(resolve, 250))
  }
  return dataUrl
}
