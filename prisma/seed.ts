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
    create: { name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600" },
  })
  const outerwear = await prisma.category.upsert({
    where: { slug: "outerwear" },
    update: {},
    create: { name: "Outerwear", slug: "outerwear", image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600" },
  })
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600" },
  })
  const newArrivals = await prisma.category.upsert({
    where: { slug: "new-arrivals" },
    update: {},
    create: { name: "New Arrivals", slug: "new-arrivals", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600" },
  })
  console.log("✓ Categories ready")

  // ── Wipe existing products cleanly so variants are always fresh ───────────
  await prisma.orderItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.review.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  console.log("✓ Cleared old products")

  // ── Helper ─────────────────────────────────────────────────────────────────
  const sizes = {
    apparel: ["XS", "S", "M", "L", "XL", "XXL"],
    core: ["S", "M", "L", "XL"],
    trouser: ["30/30", "30/32", "32/30", "32/32", "34/32", "36/32"],
    shoes: ["40", "41", "42", "43", "44", "45"],
    belt: ['32"', '34"', '36"', '38"', '40"'],
  }

  function colorVariants(
    colors: { name: string; hex: string }[],
    sizeList?: string[],
    baseStock = 8,
    basePrice?: number
  ) {
    if (!sizeList) {
      return colors.map((c) => ({ color: c.name, colorHex: c.hex, stock: baseStock, price: basePrice }))
    }
    return colors.flatMap((c) =>
      sizeList.map((s) => ({ size: s, color: c.name, colorHex: c.hex, stock: baseStock, price: basePrice }))
    )
  }

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [

    // ── MEN ──────────────────────────────────────────────────────────────────

    {
      name: "Linen Relaxed Blazer",
      slug: "linen-relaxed-blazer",
      description: "A relaxed-fit blazer crafted from premium breathable linen. Tailored yet comfortable, it transitions effortlessly from the office to evening events. Unlined for maximum breathability.",
      price: 189,
      comparePrice: 249,
      images: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
      ],
      categoryId: men.id,
      tags: ["blazer", "linen", "summer", "tailoring"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Ecru", hex: "#F5F0E8" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Stone", hex: "#9E9689" },
        ],
        sizes.core
      ),
    },

    {
      name: "Merino Crew Sweater",
      slug: "merino-crew-sweater",
      description: "Knitted from 100% extra-fine merino wool. Incredibly soft against the skin with natural temperature-regulating properties. Ribbed collar, cuffs and hem.",
      price: 129,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=800",
      ],
      categoryId: men.id,
      tags: ["sweater", "merino", "knitwear"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Oatmeal", hex: "#D4C9B0" },
          { name: "Forest Green", hex: "#2D4A2D" },
          { name: "Burgundy", hex: "#6B1A2A" },
        ],
        sizes.core
      ),
    },

    {
      name: "Classic Oxford Shirt",
      slug: "classic-oxford-shirt",
      description: "A timeless Oxford button-down in two-ply cotton poplin. Slightly relaxed fit, single chest pocket, and mother-of-pearl buttons. The cornerstone of any wardrobe.",
      price: 95,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
      ],
      categoryId: men.id,
      tags: ["shirt", "oxford", "classic", "cotton"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "White", hex: "#FFFFFF" },
          { name: "Light Blue", hex: "#A8C4D4" },
          { name: "Pink", hex: "#E8B4B8" },
          { name: "Slate", hex: "#7A8B99" },
        ],
        sizes.core
      ),
    },

    {
      name: "Slim-Fit Chino Trousers",
      slug: "slim-fit-chino-trousers",
      description: "Slim-fit chinos in a stretch cotton twill. A versatile wardrobe staple that works from desk to weekend. Side and back pockets with zip fly closure.",
      price: 118,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
      ],
      categoryId: men.id,
      tags: ["trousers", "chinos", "slim-fit"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Khaki", hex: "#C3B091" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Stone", hex: "#9E9689" },
          { name: "Olive", hex: "#6B7C41" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Cashmere Roll-Neck",
      slug: "cashmere-roll-neck",
      description: "A relaxed-fit roll-neck in Grade-A Mongolian cashmere. Incredibly soft with natural stretch. An investment piece you will wear for years to come.",
      price: 310,
      comparePrice: 390,
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800",
      ],
      categoryId: men.id,
      tags: ["cashmere", "knitwear", "luxury"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Chocolate", hex: "#7B3F00" },
          { name: "Ivory", hex: "#FFFFF0" },
          { name: "Slate", hex: "#708090" },
          { name: "Camel", hex: "#C19A6B" },
        ],
        sizes.core
      ),
    },

    {
      name: "Tailored Wool Trousers",
      slug: "tailored-wool-trousers",
      description: "Slim-cut trousers in a medium-weight wool-blend cloth. Flat front with a single crease, side pockets and a zip fly. Finished with a turn-up hem.",
      price: 165,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      ],
      categoryId: men.id,
      tags: ["trousers", "wool", "tailoring"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Charcoal", hex: "#36454F" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Stone", hex: "#9E9689" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Relaxed Linen Shirt",
      slug: "relaxed-linen-shirt",
      description: "An easy-fitting shirt in washed, soft linen. The relaxed silhouette and natural texture make it perfect for warm days. Wear untucked for a laid-back look.",
      price: 89,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      ],
      categoryId: men.id,
      tags: ["shirt", "linen", "summer", "relaxed"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "White", hex: "#FFFFFF" },
          { name: "Sky Blue", hex: "#87CEEB" },
          { name: "Sand", hex: "#E8DCC8" },
          { name: "Sage", hex: "#B2C4A8" },
        ],
        sizes.core
      ),
    },

    {
      name: "Pique Polo Shirt",
      slug: "pique-polo-shirt",
      description: "A clean-lined polo in breathable cotton piqué. Two-button placket, ribbed collar and cuffs. A smart casual essential that pairs with everything.",
      price: 79,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800",
        "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800",
      ],
      categoryId: men.id,
      tags: ["polo", "cotton", "summer"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "White", hex: "#FFFFFF" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Forest Green", hex: "#2D4A2D" },
          { name: "Burgundy", hex: "#6B1A2A" },
          { name: "Stone", hex: "#9E9689" },
        ],
        sizes.core
      ),
    },

    {
      name: "French Terry Sweatshirt",
      slug: "french-terry-sweatshirt",
      description: "Crafted from midweight loopback cotton terry. A relaxed crew-neck silhouette with dropped shoulders. The understated essential for weekends and layering.",
      price: 98,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800",
      ],
      categoryId: men.id,
      tags: ["sweatshirt", "cotton", "casual"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Black", hex: "#0A0A0A" },
          { name: "Heather Grey", hex: "#A8A8A8" },
          { name: "Ecru", hex: "#F5F0E8" },
          { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Slim-Fit Dark Jeans",
      slug: "slim-fit-dark-jeans",
      description: "Five-pocket jeans in a stretch selvedge denim. Slim through the hip and thigh with a tapered leg. Made in Japan from premium ring-spun cotton.",
      price: 145,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800",
      ],
      categoryId: men.id,
      tags: ["jeans", "denim", "slim-fit"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Indigo", hex: "#3B3F8C" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Washed Grey", hex: "#808080" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Ribbed Cotton T-Shirt",
      slug: "ribbed-cotton-t-shirt",
      description: "A foundational tee in heavyweight 230gsm ribbed cotton. A slim fit with a slightly longer length to be worn tucked or untucked. Durable and gets better with every wash.",
      price: 45,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
      ],
      categoryId: men.id,
      tags: ["t-shirt", "cotton", "basic"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "White", hex: "#FFFFFF" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Slate", hex: "#708090" },
          { name: "Sand", hex: "#E8DCC8" },
        ],
        sizes.apparel
      ),
    },

    {
      name: "Loopback Hoodie",
      slug: "loopback-hoodie",
      description: "A midweight loopback fleece hoodie with a relaxed fit. Two side pockets, adjustable drawcord hood and ribbed hem. A wardrobe constant for colder days.",
      price: 115,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800",
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      ],
      categoryId: men.id,
      tags: ["hoodie", "fleece", "casual"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Black", hex: "#0A0A0A" },
          { name: "Heather Grey", hex: "#A8A8A8" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Slate", hex: "#708090" },
        ],
        sizes.apparel
      ),
    },

    // ── OUTERWEAR ─────────────────────────────────────────────────────────────

    {
      name: "Technical Bomber Jacket",
      slug: "technical-bomber-jacket",
      description: "A modern bomber in water-resistant ripstop nylon. Ribbed collar, cuffs and hem. Two zip pockets at chest and interior mesh lining. A versatile layering piece.",
      price: 220,
      comparePrice: 275,
      images: [
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["jacket", "bomber", "outerwear", "nylon"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Olive", hex: "#6B7C41" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes.core
      ),
    },

    {
      name: "Double-Breasted Wool Overcoat",
      slug: "double-breasted-wool-overcoat",
      description: "A full-length double-breasted overcoat in a heavyweight Italian wool-blend. Notch lapels, welt pockets, and a half-satin lining. The definitive cold-weather statement.",
      price: 495,
      comparePrice: 620,
      images: [
        "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800",
        "https://images.unsplash.com/photo-1520975954-b8079d6b3b39?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["coat", "wool", "overcoat", "tailoring"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Camel", hex: "#C19A6B" },
          { name: "Charcoal", hex: "#36454F" },
          { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes.core
      ),
    },

    {
      name: "Quilted Down Vest",
      slug: "quilted-down-vest",
      description: "A lightweight yet warm quilted vest filled with responsible-down. Channel quilting, two zip pockets and a stand-up collar. Ideal for layering in transitional weather.",
      price: 145,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1553754538-48b4df67c2f0?w=800",
        "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["vest", "down", "quilted", "outerwear"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Black", hex: "#0A0A0A" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Forest Green", hex: "#2D4A2D" },
        ],
        sizes.core
      ),
    },

    {
      name: "Waxed Cotton Field Jacket",
      slug: "waxed-cotton-field-jacket",
      description: "A four-pocket field jacket in waxed organic cotton canvas. Wind and water resistant with a corduroy collar. Inspired by British country traditions.",
      price: 285,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1551232864-3f0890e1de6a?w=800",
        "https://images.unsplash.com/photo-1600185365483-26d0a4ea9734?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["jacket", "waxed", "field", "cotton"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Olive", hex: "#6B7C41" },
          { name: "Dark Brown", hex: "#3B1F0A" },
          { name: "Black", hex: "#0A0A0A" },
        ],
        sizes.core
      ),
    },

    {
      name: "Lightweight Parka",
      slug: "lightweight-parka",
      description: "A slim-cut parka in a technical ripstop fabric with a DWR finish. Removable faux-fur hood trim, two hand pockets and one internal pocket. Warm without the bulk.",
      price: 195,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800",
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["parka", "jacket", "outerwear"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Black", hex: "#0A0A0A" },
          { name: "Olive", hex: "#6B7C41" },
          { name: "Stone", hex: "#9E9689" },
        ],
        sizes.core
      ),
    },

    {
      name: "Double-Breasted Peacoat",
      slug: "double-breasted-peacoat",
      description: "A classic double-breasted peacoat in a boiled Italian wool blend. Six-button closure, wide notch lapels, and a clean back. Built to last a lifetime.",
      price: 345,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1512036666432-2b8dabb9074c?w=800",
        "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800",
      ],
      categoryId: outerwear.id,
      tags: ["peacoat", "wool", "outerwear", "tailoring"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Charcoal", hex: "#36454F" },
          { name: "Camel", hex: "#C19A6B" },
        ],
        sizes.core
      ),
    },

    // ── ACCESSORIES ───────────────────────────────────────────────────────────

    {
      name: "Leather Tote Bag",
      slug: "leather-tote-bag",
      description: "A structured tote in full-grain vegetable-tanned leather. Spacious main compartment, interior zip pocket, and solid brass hardware. Made in Italy.",
      price: 295,
      comparePrice: 370,
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      ],
      categoryId: accessories.id,
      tags: ["bag", "leather", "tote", "made in italy"],
      featured: true,
      published: true,
      variants: colorVariants([
        { name: "Tan", hex: "#C4A882" },
        { name: "Black", hex: "#0A0A0A" },
        { name: "Dark Brown", hex: "#3B1F0A" },
      ]),
    },

    {
      name: "Minimalist Steel Watch",
      slug: "minimalist-steel-watch",
      description: "A clean minimalist timepiece with a brushed stainless steel case and sapphire crystal glass. Swiss movement, 5ATM water resistance, 40mm case diameter.",
      price: 345,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
        "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800",
      ],
      categoryId: accessories.id,
      tags: ["watch", "steel", "minimalist", "swiss"],
      featured: true,
      published: true,
      variants: colorVariants([
        { name: "Silver / Black", hex: "#C0C0C0" },
        { name: "Gold / Brown", hex: "#C5A028" },
        { name: "Silver / White", hex: "#E8E8E8" },
      ]),
    },

    {
      name: "Full-Grain Leather Belt",
      slug: "full-grain-leather-belt",
      description: "A 35mm dress belt in full-grain calf leather with a polished silver-tone pin buckle. Vegetable-tanned for longevity. Will develop a rich patina over time.",
      price: 85,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
      ],
      categoryId: accessories.id,
      tags: ["belt", "leather", "accessories"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Tan", hex: "#C4A882" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Dark Brown", hex: "#3B1F0A" },
        ],
        sizes.belt
      ),
    },

    {
      name: "Merino Wool Scarf",
      slug: "merino-wool-scarf",
      description: "A generous scarf woven from extra-fine merino wool. Soft, lightweight, and warm. The fringed ends and 190cm length give plenty of styling options.",
      price: 75,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
      ],
      categoryId: accessories.id,
      tags: ["scarf", "merino", "wool", "accessories"],
      featured: false,
      published: true,
      variants: colorVariants([
        { name: "Camel", hex: "#C19A6B" },
        { name: "Navy", hex: "#1B2A4A" },
        { name: "Charcoal", hex: "#36454F" },
        { name: "Burgundy", hex: "#6B1A2A" },
      ]),
    },

    {
      name: "Canvas Weekender Bag",
      slug: "canvas-weekender-bag",
      description: "A spacious weekender in washed canvas with full-grain leather trim and brass hardware. Interior shoe compartment, laptop sleeve, and exterior zip pocket.",
      price: 195,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800",
      ],
      categoryId: accessories.id,
      tags: ["bag", "canvas", "weekender", "travel"],
      featured: false,
      published: true,
      variants: colorVariants([
        { name: "Olive", hex: "#6B7C41" },
        { name: "Navy", hex: "#1B2A4A" },
        { name: "Black", hex: "#0A0A0A" },
      ]),
    },

    {
      name: "Leather Card Holder",
      slug: "leather-card-holder",
      description: "A slim bi-fold card holder in full-grain calf leather. Four card slots, one cash compartment. Fits in any pocket without adding bulk.",
      price: 55,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1612428985540-9bff82bde621?w=800",
        "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
      ],
      categoryId: accessories.id,
      tags: ["wallet", "leather", "accessories", "minimal"],
      featured: false,
      published: true,
      variants: colorVariants([
        { name: "Black", hex: "#0A0A0A" },
        { name: "Tan", hex: "#C4A882" },
        { name: "Dark Brown", hex: "#3B1F0A" },
      ]),
    },

    {
      name: "Leather Derby Shoes",
      slug: "leather-derby-shoes",
      description: "Classic open-lacing derby shoes in full-grain calfskin. Hand-stitched Goodyear welt construction, leather outsole and insole. Made in Portugal.",
      price: 265,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
      ],
      categoryId: accessories.id,
      tags: ["shoes", "leather", "derby", "made in portugal"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Black", hex: "#0A0A0A" },
          { name: "Dark Brown", hex: "#3B1F0A" },
          { name: "Tan", hex: "#C4A882" },
        ],
        sizes.shoes
      ),
    },

    // ── NEW ARRIVALS ──────────────────────────────────────────────────────────

    {
      name: "Merino Half-Zip",
      slug: "merino-half-zip",
      description: "A refined half-zip pullover in extra-fine merino wool. Ribbed hem and cuffs, mock neck with a metal zip. Polished enough for the office, casual enough for the weekend.",
      price: 155,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=800",
      ],
      categoryId: newArrivals.id,
      tags: ["knitwear", "merino", "half-zip", "new"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Burgundy", hex: "#6B1A2A" },
          { name: "Charcoal", hex: "#36454F" },
          { name: "Camel", hex: "#C19A6B" },
        ],
        sizes.core
      ),
    },

    {
      name: "Pleated Linen Trousers",
      slug: "pleated-linen-trousers",
      description: "Single-pleat trousers in a lightweight European linen. Relaxed through the hip with a tapered leg. Ideal for warm-weather dressing with a clean, elevated feel.",
      price: 135,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      ],
      categoryId: newArrivals.id,
      tags: ["trousers", "linen", "pleated", "summer", "new"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Ecru", hex: "#F5F0E8" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Sand", hex: "#E8DCC8" },
        ],
        sizes.trouser
      ),
    },

    {
      name: "Suede Chelsea Boots",
      slug: "suede-chelsea-boots",
      description: "A sleek Chelsea boot in premium suede with elasticated side gussets and a subtle stacked leather heel. Resoleable Goodyear welt. Made in Spain.",
      price: 295,
      comparePrice: 360,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
      ],
      categoryId: newArrivals.id,
      tags: ["boots", "chelsea", "suede", "new", "made in spain"],
      featured: true,
      published: true,
      variants: colorVariants(
        [
          { name: "Dark Brown", hex: "#3B1F0A" },
          { name: "Black", hex: "#0A0A0A" },
          { name: "Tan", hex: "#C4A882" },
        ],
        sizes.shoes
      ),
    },

    {
      name: "Lambswool Zip Cardigan",
      slug: "lambswool-zip-cardigan",
      description: "A full-zip cardigan in a textured lambswool blend. Rib-knit collar, hem and cuffs, two side pockets. A sophisticated alternative to the hoodie.",
      price: 145,
      comparePrice: null,
      images: [
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
      ],
      categoryId: newArrivals.id,
      tags: ["cardigan", "lambswool", "knitwear", "new"],
      featured: false,
      published: true,
      variants: colorVariants(
        [
          { name: "Oatmeal", hex: "#D4C9B0" },
          { name: "Navy", hex: "#1B2A4A" },
          { name: "Forest Green", hex: "#2D4A2D" },
        ],
        sizes.core
      ),
    },
  ]

  for (const { variants, ...product } of products) {
    const created = await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: variants.map((v) => ({
            size: v.size ?? null,
            color: v.color ?? null,
            colorHex: v.colorHex ?? null,
            price: v.price ?? product.price,
            stock: v.stock ?? 8,
          })),
        },
      },
    })
    console.log(`  ✓ ${created.name} (${variants.length} variants)`)
  }

  // Clean up old categories no longer used
  await prisma.category.deleteMany({ where: { slug: "women" } })

  console.log(`\n✅ Seed complete — ${products.length} products created`)
  console.log("   Admin: admin@cartello.com / Admin1234!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
