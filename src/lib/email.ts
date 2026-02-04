import { Resend } from "resend"
import { formatPrice } from "./utils"
import type { OrderWithItems } from "@/types"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? "Cartello <orders@cartello.com>"

export async function sendOrderConfirmation(order: OrderWithItems) {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f5f5f5">
        ${item.product.name}${item.variant ? ` (${[item.variant.size, item.variant.color].filter(Boolean).join(" · ")})` : ""}
        × ${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;text-align:right">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("")

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
        <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Your order is confirmed</h1>
        <p style="color:#737373;margin-top:0">Order #${order.id.slice(-8).toUpperCase()}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">${itemsHtml}</table>
        <div style="border-top:2px solid #0a0a0a;padding-top:12px">
          <div style="display:flex;justify-content:space-between">
            <strong>Total</strong>
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </div>
        <p style="margin-top:24px;color:#737373;font-size:13px">
          Shipping to ${order.address.address1}, ${order.address.city}, ${order.address.country}
        </p>
        <p style="color:#737373;font-size:13px">
          Questions? Reply to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#0a0a0a">cartello.com</a>
        </p>
      </div>
    `,
  })
}
