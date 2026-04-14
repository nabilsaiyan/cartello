import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin1234!", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@cartello.com" },
    update: {},
    create: { name: "Admin", email: "admin@cartello.com", password: adminPassword, role: "ADMIN" },
  })
  console.log("✓ Admin user:", admin.email)

  // ── Categories ────────────────────────────────────────────────────────────
  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: { name: "Men", slug: "men", image: "/cat-men.png" },
  })
  const outerwear = await prisma.category.upsert({
    where: { slug: "outerwear" },
    update: {},
    create: { name: "Outerwear", slug: "outerwear", image: "/cat-outerwear.png" },
  })
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", image: "/cat-accessories.png" },
  })
  const newArrivals = await prisma.category.upsert({
    where: { slug: "new-arrivals" },
    update: {},
    create: { name: "New Arrivals", slug: "new-arrivals", image: "/cat-new-arrivals.png" },
  })
  console.log("✓ Categories ready")

  // ── Wipe existing products ─────────────────────────────────────────────────
  await prisma.orderItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.review.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  console.log("✓ Cleared old products")

  // ── Size helpers ───────────────────────────────────────────────────────────
  const sizes = {
    apparel: ["XS", "S", "M", "L", "XL"],
    trouser: ["28", "30", "32", "34", "36"],
    shoes:   ["40", "41", "42", "43", "44", "45"],
    belt:    ['32"', '34"', '36"', '38"', '40"'],
    one:     ["One Size"],
  }

  function variants(
    colors: { name: string; hex: string }[],
    sizeList: string[],
    stock = 8,
    price?: number
  ) {
    return colors.flatMap((c) =>
      sizeList.map((s) => ({
        size: s,
        color: c.name,
        colorHex: c.hex,
        stock,
        price,
      }))
    )
  }

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [

    // ── MEN ──────────────────────────────────────────────────────────────────

    {
      name: "Slim-Fit Oxford Shirt",
      slug: "slim-fit-oxford-shirt",
      description: "A timeless Oxford button-down in two-ply cotton poplin. Slim fit, spread collar, and mother-of-pearl buttons. The cornerstone of any wardrobe — equally at home under a blazer or worn alone.",
      price: 149,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/shirt-white.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/shirt-blue.png"],
      categoryId: men.id,
      tags: ["shirt", "oxford", "cotton", "classic"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "White",      hex: "#FFFFFF" },
          { name: "Sky Blue",   hex: "#A8C4D4" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Tailored Wool Blazer",
      slug: "tailored-wool-blazer",
      description: "A single-breasted blazer in a medium-weight Italian wool. Clean notch lapels, a welt chest pocket, and flap hip pockets. Structured shoulders with a clean, contemporary silhouette.",
      price: 449,
      comparePrice: 549,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/blazer-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/blazer-charcoal.png"],
      categoryId: men.id,
      tags: ["blazer", "wool", "tailoring", "italian"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Navy",     hex: "#1B2A4A" },
          { name: "Charcoal", hex: "#36454F" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Slim-Fit Tailored Trousers",
      slug: "slim-fit-tailored-trousers",
      description: "Slim-cut trousers in a medium-weight wool-blend. Flat front with a single sharp crease, side pockets, and a zip fly. Finished with a clean hem — pairs perfectly with the Tailored Blazer.",
      price: 199,
      comparePrice: 249,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/trousers-black.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/trousers-grey.png"],
      categoryId: men.id,
      tags: ["trousers", "wool", "tailoring", "slim-fit"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Black",       hex: "#0A0A0A" },
          { name: "Heather Grey", hex: "#808080" },
        ],
        sizes.trouser
      ),
    },

    // ── OUTERWEAR ─────────────────────────────────────────────────────────────

    {
      name: "Double-Breasted Wool Overcoat",
      slug: "double-breasted-wool-overcoat",
      description: "A full-length overcoat in a heavyweight Italian wool blend. Wide notch lapels, self-tie belt, and deep side pockets. The definitive cold-weather statement — built to last decades.",
      price: 649,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/coat-camel.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/coat-navy.png"],
      categoryId: outerwear.id,
      tags: ["coat", "wool", "overcoat", "tailoring", "italian"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Camel", hex: "#C19A6B" },
          { name: "Navy",  hex: "#1B2A4A" },
        ],
        sizes.apparel
      ),
    },

    // ── NEW ARRIVALS ──────────────────────────────────────────────────────────

    {
      name: "Cashmere Crewneck Sweater",
      slug: "cashmere-crewneck-sweater",
      description: "Knitted from Grade-A Mongolian cashmere. Incredibly soft with natural temperature-regulating properties. Ribbed collar, cuffs and hem with a slim, flattering silhouette. An investment piece.",
      price: 349,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/sweater-camel.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/sweater-green.png"],
      categoryId: newArrivals.id,
      tags: ["sweater", "cashmere", "knitwear", "luxury", "new"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Camel",        hex: "#C19A6B" },
          { name: "Forest Green", hex: "#2D4A2D" },
        ],
        sizes.apparel
      ),
    },

    // ── ACCESSORIES ───────────────────────────────────────────────────────────

    {
      name: "Cap-Toe Oxford Shoes",
      slug: "cap-toe-oxford-shoes",
      description: "Classic closed-lacing Oxfords in full-grain calfskin. Hand-stitched Goodyear welt construction with a leather outsole. The cap-toe detail adds a refined formality. Made in England.",
      price: 495,
      comparePrice: 595,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/shoes-brown.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/shoes-black.png"],
      categoryId: accessories.id,
      tags: ["shoes", "oxford", "leather", "goodyear-welt", "made in england"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Cognac Brown", hex: "#8B4513" },
          { name: "Black",        hex: "#0A0A0A" },
        ],
        sizes.shoes
      ),
    },

    {
      name: "Herringbone Wool Scarf",
      slug: "herringbone-wool-scarf",
      description: "A generous scarf woven from fine merino wool in a classic herringbone weave. 190cm length with hand-finished fringe ends. Warm, lightweight, and effortlessly elegant.",
      price: 129,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/scarf-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/scarf-burgundy.png"],
      categoryId: accessories.id,
      tags: ["scarf", "wool", "herringbone", "accessories"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Navy",     hex: "#1B2A4A" },
          { name: "Burgundy", hex: "#6B1A2A" },
        ],
        sizes.one
      ),
    },

    {
      name: "Slim Leather Dress Belt",
      slug: "slim-leather-dress-belt",
      description: "A 30mm dress belt in full-grain vegetable-tanned calfskin. Will develop a rich patina over years of wear. Solid brass or silver-tone pin buckle. Stitched edges, made to last a lifetime.",
      price: 149,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/belt-cognac.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/belt-black.png"],
      categoryId: accessories.id,
      tags: ["belt", "leather", "accessories", "made in italy"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Cognac / Gold",  hex: "#8B4513" },
          { name: "Black / Silver", hex: "#0A0A0A" },
        ],
        sizes.belt
      ),
    },

    // ── MEN (extended) ────────────────────────────────────────────────────────

    {
      name: "Slim-Fit Linen Shirt",
      slug: "slim-fit-linen-shirt",
      description: "A breezy slim-fit shirt in 100% European linen. Naturally breathable and effortlessly elegant — the definitive warm-weather staple. Single-button barrel cuffs and a clean spread collar.",
      price: 129,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/linen-white.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/linen-stone.png"],
      categoryId: men.id,
      tags: ["shirt", "linen", "summer", "classic"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "White",        hex: "#FFFFFF" },
          { name: "Stone",        hex: "#C2B59B" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Merino Polo Shirt",
      slug: "merino-polo-shirt",
      description: "A fine-knit polo in 100% extra-fine merino wool. Incredibly soft against the skin, naturally odour-resistant, and sharp enough to wear in lieu of a shirt. Ribbed collar and three-button placket.",
      price: 179,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/polo-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/polo-burgundy.png"],
      categoryId: men.id,
      tags: ["polo", "merino", "knitwear", "smart-casual"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Navy",     hex: "#1B2A4A" },
          { name: "Burgundy", hex: "#6B1A2A" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Slim-Fit Chino Trousers",
      slug: "slim-fit-chino-trousers",
      description: "A clean flat-front chino in a premium cotton-twill blend. Slim through the thigh and tapered to the ankle. Versatile enough to pair with a blazer or a simple tee.",
      price: 159,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/chinos-khaki.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/chinos-olive.png"],
      categoryId: men.id,
      tags: ["chinos", "cotton", "trousers", "casual"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Khaki",        hex: "#C3A882" },
          { name: "Olive",        hex: "#6B7C47" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Straight-Leg Denim Jeans",
      slug: "straight-leg-denim-jeans",
      description: "A straight-leg jean in a premium 12oz Japanese selvedge denim. Structured enough to hold its shape, with just enough give for all-day comfort. Five pockets, zip fly, and a clean minimal finish.",
      price: 219,
      comparePrice: 269,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/jeans-indigo.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/jeans-black.png"],
      categoryId: men.id,
      tags: ["jeans", "denim", "selvedge", "casual"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Indigo",       hex: "#3B5998" },
          { name: "Black",        hex: "#0A0A0A" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Ribbed Merino Cardigan",
      slug: "ribbed-merino-cardigan",
      description: "A full-rib cardigan knitted from extra-fine merino wool. Button-front with a V-neck and deep ribbing at the cuffs and hem. Layered over a shirt or worn alone — endlessly adaptable.",
      price: 259,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/cardigan-charcoal.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/cardigan-brown.png"],
      categoryId: newArrivals.id,
      tags: ["cardigan", "merino", "knitwear", "new"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Charcoal",     hex: "#36454F" },
          { name: "Chocolate",    hex: "#5C3317" },
        ],
        sizes.apparel
      ),
    },

    // ── OUTERWEAR (extended) ──────────────────────────────────────────────────

    {
      name: "Wool Peacoat",
      slug: "wool-peacoat",
      description: "A classic double-breasted peacoat in a heavyweight Italian wool blend. Wide peaked lapels, six anchor buttons, and a clean hip-length silhouette. Built for cold weather — as elegant as it is warm.",
      price: 549,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/peacoat-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/peacoat-camel.png"],
      categoryId: outerwear.id,
      tags: ["peacoat", "wool", "outerwear", "italian"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Navy",  hex: "#1B2A4A" },
          { name: "Camel", hex: "#C19A6B" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Slim Bomber Jacket",
      slug: "slim-bomber-jacket",
      description: "A refined take on the MA-1 silhouette. Crafted in a compact nylon shell with a satin lining and ribbed collar, cuffs, and hem. A modern essential for the transitional wardrobe.",
      price: 299,
      comparePrice: 369,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/bomber-olive.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/bomber-black.png"],
      categoryId: outerwear.id,
      tags: ["bomber", "jacket", "outerwear", "casual"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Olive", hex: "#6B7C47" },
          { name: "Black", hex: "#0A0A0A" },
        ],
        sizes.apparel
      ),
    },

    // ── MEN (extended 2) ─────────────────────────────────────────────────────

    {
      name: "Ribbed Turtleneck Sweater",
      slug: "ribbed-turtleneck-sweater",
      description: "A fine-knit ribbed turtleneck in extra-fine merino wool. The high roll neck traps warmth without bulk. Slim fit with a clean minimal finish — the backbone of a cold-weather capsule.",
      price: 229,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764895/cartello/products/turtle-oatmeal.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764896/cartello/products/turtle-black.png"],
      categoryId: men.id,
      tags: ["turtleneck", "merino", "knitwear", "winter"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Oatmeal", hex: "#D4C5A9" },
          { name: "Black",   hex: "#0A0A0A" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Tailored Wool Waistcoat",
      slug: "tailored-wool-waistcoat",
      description: "A five-button waistcoat cut from the same Italian wool as our blazer. Notch lapels, adjustable back strap, and welt pockets. Wear it as part of a three-piece or alone over a shirt.",
      price: 249,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764897/cartello/products/waistcoat-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764898/cartello/products/waistcoat-charcoal.png"],
      categoryId: men.id,
      tags: ["waistcoat", "wool", "tailoring", "suit"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Navy",     hex: "#1B2A4A" },
          { name: "Charcoal", hex: "#36454F" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Cotton Henley Shirt",
      slug: "cotton-henley-shirt",
      description: "A long-sleeve henley in a premium cotton-jersey. The three-button placket adds just enough detail to elevate it above a plain tee. Slim fit, soft, and incredibly versatile.",
      price: 99,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764900/cartello/products/henley-grey.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764901/cartello/products/henley-white.png"],
      categoryId: men.id,
      tags: ["henley", "cotton", "casual", "basics"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Heather Grey", hex: "#808080" },
          { name: "White",        hex: "#FFFFFF" },
        ],
        sizes.apparel
      ),
    },

    // ── OUTERWEAR (extended 2) ────────────────────────────────────────────────

    {
      name: "Leather Field Jacket",
      slug: "leather-field-jacket",
      description: "A slim-cut field jacket in full-grain calfskin. Zip front with a press-stud storm flap, chest and side pockets, and ribbed cuffs. Rugged enough for the elements, refined enough for the city.",
      price: 695,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764903/cartello/products/field-tan.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764905/cartello/products/field-olive.png"],
      categoryId: outerwear.id,
      tags: ["jacket", "leather", "outerwear", "field"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Tan",   hex: "#C19A6B" },
          { name: "Olive", hex: "#6B7C47" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Quilted Liner Gilet",
      slug: "quilted-liner-gilet",
      description: "A lightweight quilted vest in a compact nylon shell. Zip front with minimal external pockets. Worn over a shirt or under a coat — a versatile layer that punches well above its weight.",
      price: 189,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780763577/cartello/products/gilet-navy.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764907/cartello/products/gilet-black.png"],
      categoryId: outerwear.id,
      tags: ["gilet", "vest", "quilted", "outerwear"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Navy",  hex: "#1B2A4A" },
          { name: "Black", hex: "#0A0A0A" },
        ],
        sizes.apparel
      ),
    },

    // ── ACCESSORIES (extended) ────────────────────────────────────────────────

    {
      name: "Suede Chelsea Boots",
      slug: "suede-chelsea-boots",
      description: "A sleek Chelsea boot in premium suede calfskin. Elastic side panels for easy slip-on wear, stacked leather heel, and a slim almond toe. Pairs effortlessly with trousers or denim alike.",
      price: 425,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/chelsea-tan.png", "https://res.cloudinary.com/dvzs21utn/image/upload/cartello/products/chelsea-black.png"],
      categoryId: accessories.id,
      tags: ["boots", "chelsea", "suede", "leather"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Tan",   hex: "#C19A6B" },
          { name: "Black", hex: "#0A0A0A" },
        ],
        sizes.shoes
      ),
    },

    {
      name: "Suede Penny Loafers",
      slug: "suede-penny-loafers",
      description: "A slip-on penny loafer in premium suede calfskin. The clean saddle strap and low stacked heel keep it sharp. Equally at home with tailored trousers or slim-fit denim.",
      price: 365,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764908/cartello/products/loafer-cognac.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764909/cartello/products/loafer-navy.png"],
      categoryId: accessories.id,
      tags: ["loafers", "suede", "shoes", "smart-casual"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Cognac", hex: "#8B4513" },
          { name: "Navy",   hex: "#1B2A4A" },
        ],
        sizes.shoes
      ),
    },

    {
      name: "Full-Brogue Derby Shoes",
      slug: "full-brogue-derby-shoes",
      description: "Open-lacing Derbies with a wingtip cap toe and traditional brogue detailing throughout. Crafted in full-grain calfskin with Goodyear welt construction and a leather outsole. Character built in from day one.",
      price: 445,
      comparePrice: 525,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764910/cartello/products/brogue-tan.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764912/cartello/products/brogue-oxblood.png"],
      categoryId: accessories.id,
      tags: ["shoes", "brogue", "derby", "leather", "goodyear-welt"],
      featured: true,
      published: true,
      variants: variants(
        [
          { name: "Tan",      hex: "#C19A6B" },
          { name: "Oxblood",  hex: "#4A0E0E" },
        ],
        sizes.shoes
      ),
    },

    {
      name: "Leather Driving Gloves",
      slug: "leather-driving-gloves",
      description: "Unlined driving gloves in butter-soft nappa leather. Perforated knuckles for breathability and a snap-button wrist closure. A finishing touch that belongs in every man's winter wardrobe.",
      price: 119,
      comparePrice: null,
      images: ["https://res.cloudinary.com/dvzs21utn/image/upload/v1780764913/cartello/products/gloves-tan.png", "https://res.cloudinary.com/dvzs21utn/image/upload/v1780764914/cartello/products/gloves-black.png"],
      categoryId: accessories.id,
      tags: ["gloves", "leather", "accessories", "winter"],
      featured: false,
      published: true,
      variants: variants(
        [
          { name: "Tan",   hex: "#C19A6B" },
          { name: "Black", hex: "#0A0A0A" },
        ],
        ["S", "M", "L", "XL"]
      ),
    },
  ]

  for (const { variants: vars, ...product } of products) {
    const created = await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: vars.map((v) => ({
            size:     v.size ?? null,
            color:    v.color ?? null,
            colorHex: v.colorHex ?? null,
            price:    v.price ?? product.price,
            stock:    v.stock ?? 8,
          })),
        },
      },
    })
    console.log(`  ✓ ${created.name} (${vars.length} variants)`)
  }

  await prisma.category.deleteMany({ where: { slug: "women" } })

  console.log(`\n✅ Seed complete — ${products.length} products`)
  console.log("   Admin: admin@cartello.com / Admin1234!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
