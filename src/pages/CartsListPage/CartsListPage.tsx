import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { getCarts } from '@/entities/cart/api'
import { usePaginationStore } from '@/store/usePaginationStore'
import type { CartsResponse } from '@/entities/cart/types'

export const CartsListPage = () => {
    const navigate = useNavigate()
    const { page, limit, setPage } = usePaginationStore()

    const skip = page * limit

    const { data, isLoading, isError } = useQuery<CartsResponse>({
        queryKey: ['carts', page, limit],
        queryFn: () => getCarts(limit, skip),
        placeholderData: (previousData) => previousData,
    })

    if (isLoading) return <Centered>Loading...</Centered>
    if (isError) return <Centered>Error loading carts</Centered>
    if (!data) return null

    return (
        <Container>
            <Title>Carts List</Title>

            {data.carts.map((cart) => (
                <Card key={cart.id}>
                    <Info>
                        <div>ID: {cart.id}</div>
                        <div>User ID: {cart.userId}</div>
                        <div>Total Products: {cart.totalProducts}</div>
                        <div>Total: ${cart.total}</div>
                    </Info>

                    <Button onClick={() => navigate(`/carts/${cart.id}`)}>
                        View Details
                    </Button>
                </Card>
            ))}

            <Pagination>
                <Button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                >
                    Prev
                </Button>

                <PageInfo>Page: {page + 1}</PageInfo>

                <Button
                    disabled={skip + limit >= data.total}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </Pagination>
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
  margin-bottom: 30px;
`

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #4f46e5;
  color: white;
  transition: 0.2s;

  &:hover {
    background: #4338ca;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const Pagination = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`

const PageInfo = styled.span`
  font-weight: bold;
`

const Centered = styled.div`
  margin-top: 100px;
  text-align: center;
`