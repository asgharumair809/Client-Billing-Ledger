import { formatRs } from "@/lib/money"
import { displayInvoiceNo, formatInvoiceDate } from "@/lib/utils"

type InvoiceDoc = {
  globalNumber: string
  clientNumber: string
  date: Date | string
  dueDate: Date | string | null
  poNumber: string
  vehicleNo: string
  notes: string
  taxPercent: number
  discount: number
  subtotal: number
  taxAmount: number
  total: number
  client: {
    name: string
    address: string
    city: string
    phone: string
    ntn: string
  }
  items: Array<{
    description: string
    quantity: number
    unit: string
    rate: number
    amount: number
  }>
}

type CompanyDoc = {
  name: string
  tagline: string
  address: string
  city: string
  phone: string
  email: string
  ntn: string
  strn: string
  bankName: string
  bankAccount: string
  bankIban: string
  invoiceNotes: string
}

const CYAN = "#00aeef"
const CORNER_OUTER = "#1074bc"
const INK = "#123047"
const MUTED = "#3d5668"
const LINE = "#c5e8f6"
const ROW_ALT = "#f3fbfe"

function leftoverPath(radius: number, box = 200) {
  const t = Math.sqrt(radius * radius - box * box)
  return `M${box} ${t}V${box}H${t}A${radius} ${radius} 0 0 0 ${box} ${t}Z`
}

function leftoverEllipse(rx: number, ry: number, box = 200) {
  const y = ry * Math.sqrt(1 - (box * box) / (rx * rx))
  const x = rx * Math.sqrt(1 - (box * box) / (ry * ry))
  return `M${box} ${y}V${box}H${x}A${rx} ${ry} 0 0 0 ${box} ${y}Z`
}

function CornerAccent({ corner }: { corner: "top-left" | "bottom-right" }) {
  const isTop = corner === "top-left"
  return (
    <svg
      className={`pointer-events-none absolute ${isTop ? "left-0 top-0 -scale-100" : "bottom-0 right-0"} h-[196px] w-[196px]`}
      viewBox="0 0 200 200"
      aria-hidden
    >
      <path fill={CYAN} d={leftoverEllipse(200, 210)} />
      <path fill="#fff" d={leftoverPath(210)} />
      <path fill={CORNER_OUTER} d={leftoverPath(216)} />
    </svg>
  )
}

export function InvoiceDocument({
  invoice,
  paid = 0,
}: {
  invoice: InvoiceDoc
  company: CompanyDoc
  paid?: number
}) {
  const balanceDue = Math.max(0, invoice.total - paid)
  const invoiceNo = displayInvoiceNo(invoice.globalNumber)

  return (
    <article
      className="invoice-sheet print-sheet relative mx-auto flex min-h-[297mm] w-[210mm] max-w-[210mm] shrink-0 flex-col overflow-hidden bg-white shadow-sm print:shadow-none"
      style={{
        color: INK,
        fontFamily: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
        fontWeight: 600,
      }}
    >
      <CornerAccent corner="top-left" />
      <CornerAccent corner="bottom-right" />

      <div className="relative z-10 flex min-h-[297mm] flex-1 flex-col px-10 pb-10 pt-8">
        <header className="flex w-full items-start justify-between gap-10 pt-5">
          <div className="shrink-0">
            <img
              src="/aac-logo.png"
              alt="Asghar Ali Chemicals"
              width={124}
              height={120}
              decoding="sync"
              className="h-[120px] w-[124px] object-contain object-left"
            />
          </div>

          <div className="ml-auto w-[290px] shrink-0">
            <p
              className="text-[32px] leading-tight"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700 }}
            >
              {invoice.client.name}
            </p>

            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[16px] font-semibold tabular-nums">
              <dt style={{ color: MUTED }}>Invoice #</dt>
              <dd className="text-right font-bold">{invoiceNo}</dd>
              <dt style={{ color: MUTED }}>Client #</dt>
              <dd className="text-right font-bold">{invoice.clientNumber}</dd>
              <dt style={{ color: MUTED }}>Date</dt>
              <dd className="text-right font-bold">{formatInvoiceDate(invoice.date)}</dd>
              {invoice.dueDate ? (
                <>
                  <dt style={{ color: MUTED }}>Due date</dt>
                  <dd className="text-right font-bold">{formatInvoiceDate(invoice.dueDate)}</dd>
                </>
              ) : null}
            </dl>
          </div>
        </header>

        <div className="mt-6 h-px w-full" style={{ background: CYAN }} />

        <table className="mt-6 w-full border-collapse text-[18px] font-semibold tabular-nums">
          <thead>
            <tr className="text-white" style={{ background: CYAN }}>
              <th className="px-3 py-3 text-left text-[14px] font-bold uppercase tracking-[0.12em]">
                Description
              </th>
              <th className="w-[80px] px-3 py-3 text-center text-[14px] font-bold uppercase tracking-[0.12em]">
                Qty
              </th>
              <th className="w-[120px] px-3 py-3 text-right text-[14px] font-bold uppercase tracking-[0.12em]">
                Price
              </th>
              <th className="w-[130px] px-3 py-3 text-right text-[14px] font-bold uppercase tracking-[0.12em]">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={`${item.description}-${index}`}
                style={{ background: index % 2 === 1 ? ROW_ALT : "#ffffff" }}
              >
                <td className="px-3 py-3 font-semibold" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {item.description.split("\n").map((part, lineIndex) => (
                    <span key={`${item.description}-${index}-${lineIndex}`} className={lineIndex === 0 ? "block" : "mt-1 block font-medium"} style={lineIndex === 0 ? undefined : { color: MUTED, fontSize: 15 }}>
                      {part}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-3 text-center font-semibold" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {item.quantity}
                </td>
                <td className="px-3 py-3 text-right font-semibold" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {formatRs(item.rate)}
                </td>
                <td className="px-3 py-3 text-right font-bold" style={{ borderBottom: `1px solid ${LINE}` }}>
                  {formatRs(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-[280px] text-[18px] font-semibold tabular-nums">
            <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span style={{ color: MUTED }}>Subtotal</span>
              <span className="font-bold">{formatRs(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 ? (
              <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span style={{ color: MUTED }}>Discount</span>
                <span className="font-bold">{formatRs(invoice.discount)}</span>
              </div>
            ) : null}
            {invoice.taxPercent > 0 ? (
              <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span style={{ color: MUTED }}>Sales tax {invoice.taxPercent}%</span>
                <span className="font-bold">{formatRs(invoice.taxAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span style={{ color: MUTED }}>Total</span>
              <span className="font-bold">{formatRs(invoice.total)}</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span style={{ color: MUTED }}>Paid</span>
              <span className="font-bold">{formatRs(paid)}</span>
            </div>
            <div
              className="mt-1 flex justify-between px-3 py-2.5 font-bold text-white"
              style={{ background: CYAN }}
            >
              <span>Balance due</span>
              <span>{formatRs(balanceDue)}</span>
            </div>
          </div>
        </div>

        <p className="mt-auto pt-12 text-[16px] font-semibold" style={{ color: MUTED }}>
          {invoice.notes || "Thanks for your business."}
        </p>
      </div>
    </article>
  )
}
