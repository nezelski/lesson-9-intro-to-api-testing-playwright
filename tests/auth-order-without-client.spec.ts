import { LoginDTO } from './dto/LoginDTO'
import { OrderDTO } from './dto/OrderDTO'
import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
const BASE_URL = 'https://backend.tallinn-learning.ee'
const JWT_REGEX = /^eyJhb[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/

test('create order without APIClient', async ({ request }) => {
  const responseLogin = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  const jwt = await responseLogin.text()
  const responseOrder = await request.post(BASE_URL + '/orders', {
    data: OrderDTO.createOrderWithRandomData(),
    headers: { Authorization: `Bearer ${jwt}` },
  })
  const responseDataOrder = await responseOrder.json()
  expect(responseOrder.status()).toBe(StatusCodes.OK)
  expect(responseDataOrder.status.length).toBeGreaterThan(3)
  expect(responseDataOrder.id).toBeGreaterThan(0)
})

test('authorization and get order by Id without client', async ({ request }) => {
  const responseLogin = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  const jwt = await responseLogin.text()
  expect(responseLogin.status()).toBe(StatusCodes.OK)
  expect(jwt).toMatch(JWT_REGEX)

  const createOrderId = await request.post(BASE_URL + '/orders', {
    data: OrderDTO.createOrderWithRandomData(),
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(createOrderId.status()).toBe(StatusCodes.OK)

  const orderId: number = (await createOrderId.json()).id

  const getOrder = await request.get(`${BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(getOrder.status()).toBe(StatusCodes.OK)
  const getOrderId: number = (await getOrder.json()).id
  expect(orderId).toBe(getOrderId)
  console.log(await getOrder.json())
  console.log(await createOrderId.json())
  expect(createOrderId.json).toBe(getOrder.json)
})

test('authorization and delete order by id without client', async ({ request }) => {
  const loginResponse = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  const jwt = await loginResponse.text()
  const responseOrder = await request.post(BASE_URL + '/orders', {
    data: OrderDTO.createOrderWithRandomData(),
    headers: { Authorization: `Bearer ${jwt}` },
  })
  const createOrderId = (await responseOrder.json()).id
  expect(responseOrder.status()).toBe(StatusCodes.OK)
  const deleteOrder = await request.delete(`${BASE_URL}/orders/${createOrderId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(deleteOrder.status()).toBe(StatusCodes.OK)
  const deleteOrderData = await deleteOrder.json()
  console.log(deleteOrderData)

  const checkDeleteOrder = await request.get(`${BASE_URL}/orders/${createOrderId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  })
  expect(checkDeleteOrder.status()).toBe(StatusCodes.OK)
})
