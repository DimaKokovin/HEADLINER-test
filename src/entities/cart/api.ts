import axios from 'axios'
import type { CartsResponse, Cart } from './types'

const baseURL = 'https://dummyjson.com'

export const getCarts = async (limit: number, skip: number) => {
    const { data } = await axios.get<CartsResponse>(
        `${baseURL}/carts?limit=${limit}&skip=${skip}`
    )
    return data
}

export const getCartById = async (id: number) => {
    const { data } = await axios.get<Cart>(`${baseURL}/carts/${id}`)
    return data
}

export const updateCart = async (id: number, products: any[]) => {
    const { data } = await axios.put<Cart>(`${baseURL}/carts/${id}`, {
        merge: true,
        products,
    })
    return data
}