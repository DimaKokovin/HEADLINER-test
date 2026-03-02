import { createBrowserRouter } from 'react-router-dom'
import { CartsListPage } from '@/pages/CartsListPage'
import { CartDetailsPage } from '@/pages/CartDetailsPage'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <CartsListPage />,
    },
    {
        path: '/carts/:id',
        element: <CartDetailsPage />,
    },
])