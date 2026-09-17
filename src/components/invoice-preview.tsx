"use client"

import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"
import { Spinner } from "@/components/ui"
import { elementToPng } from "@/lib/export-image"

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export function InvoicePreview({
  children,
  filename,
}: {
  children: React.ReactNode
  filename: string
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    function update() {
      const sheet = sheetRef.current
      if (!sheet) return
      const width = frame?.clientWidth
      const sheetWidth = sheet.offsetWidth
      if (!width || !sheetWidth) return
      const next = Math.min(1, width / sheetWidth)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  async function capture() {
    const node = sheetRef.current
    if (!node) throw new Error("Invoice preview is not ready.")
    return elementToPng(node, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    })
  }

  async function downloadPng() {
    setError("")
    setExporting("png")
    try {
      const dataUrl = await capture()
      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setError("Could not download PNG.")
    } finally {
      setExporting(null)
    }
  }

  async function downloadPdf() {
    setError("")
    setExporting("pdf")
    try {
      const dataUrl = await capture()
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      pdf.addImage(dataUrl, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM)
      pdf.save(`${filename}.pdf`)
    } catch {
      setError("Could not download PDF.")
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap gap-2">
        <button className="btn-primary" type="button" onClick={() => window.print()}>
          Print
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={downloadPng}
          disabled={Boolean(exporting)}
          aria-busy={exporting === "png"}
        >
          {exporting === "png" ? <Spinner /> : <Download size={16} />}
          {exporting === "png" ? "PNG…" : "PNG"}
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={downloadPdf}
          disabled={Boolean(exporting)}
          aria-busy={exporting === "pdf"}
        >
          {exporting === "pdf" ? <Spinner /> : <Download size={16} />}
          {exporting === "pdf" ? "PDF…" : "PDF"}
        </button>
      </div>
      {error ? <p className="no-print mb-3 text-sm text-bad">{error}</p> : null}
      <div
        ref={frameRef}
        className="invoice-fit-frame w-full overflow-hidden"
        style={{ height: `calc(${A4_HEIGHT_MM}mm * ${scale})` }}
      >
        <div className="invoice-fit-scale origin-top-left" style={{ transform: `scale(${scale})` }}>
          <div ref={sheetRef} className="w-[210mm]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
