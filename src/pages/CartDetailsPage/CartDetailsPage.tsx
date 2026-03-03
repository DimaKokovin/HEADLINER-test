import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styled from '@emotion/styled'
import { getCartById, updateCart } from '@/entities/cart/api'
import type { Cart, UpdateCartProduct } from '@/entities/cart/types'

export const CartDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const cartId = Number(id)

    const { data, isLoading, isError } = useQuery<Cart>({
        queryKey: ['cart', cartId],
        queryFn: () => getCartById(cartId),
        enabled: !!cartId,
    })

    const mutation = useMutation({
        mutationFn: (products: UpdateCartProduct[]) =>
            updateCart(cartId, products),

        onMutate: async (newProducts) => {
            await queryClient.cancelQueries({ queryKey: ['cart', cartId] })

            const previousCart = queryClient.getQueryData<Cart>([
                'cart',
                cartId,
            ])

            queryClient.setQueryData<Cart>(['cart', cartId], (old) => {
                if (!old) return old

                const updatedProducts = old.products
                    .map((p) => {
                        const updated = newProducts.find(
                            (np) => np.id === p.id
                        )
                        if (!updated) return null

                        const newTotal = p.price * updated.quantity

                        return {
                            ...p,
                            quantity: updated.quantity,
                            total: newTotal,
                        }
                    })
                    .filter(Boolean) as Cart['products']

                const total = updatedProducts.reduce(
                    (sum, p) => sum + p.total,
                    0
                )

                const totalQuantity = updatedProducts.reduce(
                    (sum, p) => sum + p.quantity,
                    0
                )

                return {
                    ...old,
                    products: updatedProducts,
                    total,
                    totalProducts: updatedProducts.length,
                    totalQuantity,
                }
            })

            return { previousCart }
        },

        onError: (_err, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(
                    ['cart', cartId],
                    context.previousCart
                )
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
            queryClient.invalidateQueries({ queryKey: ['carts'] })
        },
    })

    if (isLoading) return <Centered>Loading...</Centered>
    if (isError || !data) return <Centered>Error loading cart</Centered>

    const handleQuantityChange = (productId: number, quantity: number) => {
        if (quantity < 1) return

        const updatedProducts: UpdateCartProduct[] = data.products.map((p) =>
            p.id === productId
                ? { id: p.id, quantity }
                : { id: p.id, quantity: p.quantity }
        )

        mutation.mutate(updatedProducts)
    }

    const handleRemove = (productId: number) => {
        if (!window.confirm('Are you sure you want to remove this product?'))
            // в данном случае это сделано вместо модального окна
            return

        const updatedProducts: UpdateCartProduct[] = data.products
            .filter((p) => p.id !== productId)
            .map((p) => ({
                id: p.id,
                quantity: p.quantity,
            }))

        mutation.mutate(updatedProducts)
    }

    return (
        <Container>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>

            <Title>Cart #{data.id}</Title>
            <SubTitle>User ID: {data.userId}</SubTitle>

            {mutation.isPending && (
                <Updating>Updating cart...</Updating>
            )}

            <Table>
                <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {data.products.map((product) => (
                    <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>${product.price}</td>
                        <td>
                            <QuantityInput
                                type="number"
                                min="1"
                                value={product.quantity}
                                disabled={mutation.isPending}
                                onChange={(e) =>
                                    handleQuantityChange(
                                        product.id,
                                        Number(e.target.value)
                                    )
                                }
                            />
                        </td>
                        <td>${product.total}</td>
                        <td>
                            <DeleteButton
                                disabled={mutation.isPending}
                                onClick={() =>
                                    handleRemove(product.id)
                                }
                            >
                                {mutation.isPending
                                    ? 'Updating...'
                                    : 'Remove'}
                            </DeleteButton>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Total>Total Cart Sum: ${data.total}</Total>
        </Container>
    )
}

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
`

const Title = styled.h1`
  text-align: center;
`

const SubTitle = styled.h3`
  text-align: center;
  margin-bottom: 20px;
`

const Updating = styled.div`
  text-align: center;
  margin-bottom: 10px;
  color: #4f46e5;
  font-weight: 500;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: center;
  }

  th {
    background: #f3f4f6;
  }

  tr:hover {
    background: #f9fafb;
  }
`

const QuantityInput = styled.input`
  width: 60px;
  padding: 6px;
`

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const BackButton = styled.button`
  margin-bottom: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
`

const Total = styled.h2`
  margin-top: 30px;
  text-align: right;
`

const Centered = styled.div`
  margin-top: 100px;
  text-align: center;
`