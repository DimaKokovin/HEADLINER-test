import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styled from '@emotion/styled'
import { getCartById, updateCart } from '@/entities/cart/api'
import type { Cart } from '@/entities/cart/types'

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
        mutationFn: (products: Cart['products']) =>
            updateCart(cartId, products),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['cart', cartId],
            })

            await queryClient.invalidateQueries({
                queryKey: ['carts'],
            })
        },
    })

    if (isLoading) return <Centered>Loading...</Centered>
    if (isError || !data) return <Centered>Error loading cart</Centered>

    const handleQuantityChange = (productId: number, quantity: number) => {
        const updatedProducts = data.products.map((p) =>
            p.id === productId ? { ...p, quantity } : p
        )
        mutation.mutate(updatedProducts)
    }

    const handleRemove = (productId: number) => {
        const updatedProducts = data.products.filter(
            (p) => p.id !== productId
        )
        mutation.mutate(updatedProducts)
    }

    return (
        <Container>
            <BackButton onClick={() => navigate(-1)}>← Back</BackButton>

            <Title>Cart #{data.id}</Title>
            <SubTitle>User ID: {data.userId}</SubTitle>

            {data.products.map((product) => (
                <Card key={product.id}>
                    <Info>
                        <strong>{product.title}</strong>
                        <div>Price: ${product.price}</div>
                        <div>Total: ${product.total}</div>
                    </Info>

                    <Controls>
                        <QuantityInput
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                                handleQuantityChange(product.id, Number(e.target.value))
                            }
                        />

                        <DeleteButton onClick={() => handleRemove(product.id)}>
                            Remove
                        </DeleteButton>
                    </Controls>
                </Card>
            ))}

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
  margin-bottom: 30px;
`

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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