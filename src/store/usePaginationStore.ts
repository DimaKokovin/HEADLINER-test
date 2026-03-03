import { create } from 'zustand'

interface PaginationState {
    page: number
    limit: number
    setPage: (page: number) => void
    setLimit: (limit: number) => void
}

export const usePaginationStore = create<PaginationState>((set) => ({
    page: 0,
    limit: 10,
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit }),
}))