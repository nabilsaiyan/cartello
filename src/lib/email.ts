import { Resend } from "resend"
import { formatPrice } from "./utils"
import type { OrderWithItems } from "@/types"

const FROM = process.env.EMAIL_FROM ?? "Cartello <orders@cartello.com>"

export async function sendOrderConfirmation(order: OrderWithItems) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://cartello.com"
  const orderId = order.id.slice(-8).toUpperCase()

  const itemsHtml = order.items
    .map((item) => {
      const image = item.product.images?.[0] ?? ""
      const variant = item.variant
        ? [item.variant.size, item.variant.color].filter(Boolean).join(" · ")
        : ""
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f0f0f0;vertical-align:top">
            <table cellpadding="0" cellspacing="0" style="width:100%">
              <tr>
                ${image ? `
                <td style="width:64px;padding-right:16px;vertical-align:top">
                  <img
                    src="${image}"
                    alt="${item.product.name}"
                    width="64"
                    height="80"
                    style="display:block;width:64px;height:80px;object-fit:cover;border-radius:8px;background:#f5f5f5"
                  />
                </td>` : ""}
                <td style="vertical-align:top">
                  <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#0a0a0a">${item.product.name}</p>
                  ${variant ? `<p style="margin:0 0 4px 0;font-size:13px;color:#737373">${variant}</p>` : ""}
                  <p style="margin:0;font-size:13px;color:#737373">Qty: ${item.quantity}</p>
                </td>
                <td style="vertical-align:top;text-align:right;white-space:nowrap">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#0a0a0a">${formatPrice(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join("")

  const result = await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order confirmed — #${orderId}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9;padding:40px 16px">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 40px;text-align:center">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.15em;color:#ffffff;text-transform:uppercase">CARTELLO</p>
            </td>
          </tr>

          <!-- Hero message -->
          <tr>
            <td style="padding:40px 40px 0 40px;text-align:center">
              <p style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#0a0a0a">Order confirmed</p>
              <p style="margin:0;font-size:14px;color:#737373">Thank you for your purchase. We're preparing your order.</p>
              <p style="margin:16px 0 0 0;display:inline-block;background:#f5f5f5;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;color:#737373;letter-spacing:0.08em">ORDER #${orderId}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:32px 40px 0 40px"><hr style="border:none;border-top:1px solid #f0f0f0;margin:0" /></td></tr>

          <!-- Items -->
          <tr>
            <td style="padding:0 40px">
              <table cellpadding="0" cellspacing="0" style="width:100%">
                <tr>
                  <td style="padding:20px 0 4px 0">
                    <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373">Your items</p>
                  </td>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:0 40px 32px 40px">
              <table cellpadding="0" cellspacing="0" style="width:100%;border-top:2px solid #0a0a0a;padding-top:16px;margin-top:4px">
                <tr>
                  <td style="padding-top:16px">
                    <table cellpadding="0" cellspacing="0" style="width:100%">
                      <tr>
                        <td style="font-size:15px;font-weight:700;color:#0a0a0a">Total</td>
                        <td style="font-size:15px;font-weight:700;color:#0a0a0a;text-align:right">${formatPrice(order.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding:0 40px 32px 40px;background-color:#f9f9f9;border-top:1px solid #f0f0f0">
              <p style="margin:24px 0 8px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373">Shipping to</p>
              <p style="margin:0;font-size:14px;color:#0a0a0a;line-height:1.6">
                ${order.address.firstName} ${order.address.lastName}<br/>
                ${order.address.address1}${order.address.address2 ? "<br/>" + order.address.address2 : ""}<br/>
                ${order.address.city}${order.address.state ? ", " + order.address.state : ""} ${order.address.postalCode}<br/>
                ${order.address.country}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0">
              <p style="margin:0 0 8px 0;font-size:13px;color:#737373">Questions? Reply to this email or visit</p>
              <a href="${appUrl}" style="color:#0a0a0a;font-size:13px;font-weight:600;text-decoration:none">${appUrl.replace(/^https?:\/\//, "")}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
  if (result.error) {
    console.error("[email] Resend error:", JSON.stringify(result.error))
    throw new Error(result.error.message)
  }
  console.log("[email] Sent order confirmation to", order.email, "id:", result.data?.id)
}
