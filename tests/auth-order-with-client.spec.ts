import { test, expect } from '@playwright/test'
import { ApiClient } from '../src/ApiClient'

test('Login and create order with APIClient', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const orderID = await apiClient.createOrderAndReturnOrderId()
  console.log('orderID', orderID)
  expect(orderID).toBeGreaterThan(0)
})

test('login and get orders with client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const ordersBefore = await apiClient.getOrders()
  await apiClient.createOrderAndReturnOrderId()
  const ordersAfter = await apiClient.getOrders()
  expect(ordersAfter.length).toBeGreaterThan(ordersBefore.length)
})

test('Login-create-get order by Id with client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const createOrder = await apiClient.createOrderAndReturnOrderId()
  const getOrder = await apiClient.getOrderById(createOrder)
  expect(createOrder).toBe(getOrder)
})

test('login-create order-delete order by id with client', async ({ request }) => {
  const apiClient = await ApiClient.create(request)
  const createOrderId = await apiClient.createOrderAndReturnOrderId()
  const deleteOrder = await apiClient.deleteOrderById(createOrderId)
  expect(deleteOrder).toBe(true)
})
