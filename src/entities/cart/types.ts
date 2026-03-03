export interface Product {
    id: number
    title: string
    price: number
    quantity: number
    total: number
}

export interface UpdateCartProduct {
    id: number
    quantity: number
}

export interface Cart {
    id: number
    userId: number
    total: number
    discountedTotal: number
    totalProducts: number
    totalQuantity: number
    products: Product[]
}

export interface CartsResponse {
    carts: Cart[]
    total: number
    limit: number
    skip: number
}