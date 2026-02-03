import type {
  User,
  Product,
  Variant,
  Category,
  Order,
  OrderItem,
  Review,
  CartItem,
  Address,
} from "@/generated/prisma/client"

export type ProductWithRelations = Product & {
  category: Category
  variants: Variant[]
  reviews: Review[]
  _count?: { reviews: number; wishlist: number }
}

export type CartItemWithProduct = CartItem & {
  product: Product
  variant: Variant | null
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
    variant: Variant | null
  })[]
  address: Address
  user: User | null
}

export type CartState = {
  items: LocalCartItem[]
  addItem: (item: LocalCartItem) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void
  clearCart: () => void
}

export type LocalCartItem = {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  colorHex?: string
  slug: string
}

export type WishlistState = {
  items: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
}

export type FilterParams = {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  sort?: "newest" | "price_asc" | "price_desc" | "rating"
  page?: number
  q?: string
}
