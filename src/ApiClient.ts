import { APIRequestContext } from 'playwright-core'
import { LoginDTO } from '../tests/dto/LoginDTO'
import { OrderDTO } from '../tests/dto/OrderDTO'
import { StatusCodes } from 'http-status-codes'
import { APIResponse, expect } from '@playwright/test'

const serviceURL = 'https://backend.tallinn-learning.ee'
const loginPath = '/login/student'
const orderPath = '/orders'

export class ApiClient {
  request: APIRequestContext
  jwt: string

  private constructor(request: APIRequestContext, jwt: string) {
    this.request = request
    this.jwt = jwt
  }

  static async create(request: APIRequestContext): Promise<ApiClient> {
    console.log('Requesting jwt...')
    const authResponse = await request.post(`${serviceURL}${loginPath}`, {
      data: LoginDTO.createLoginWithCorrectData(),
    })

    if (authResponse.status() !== StatusCodes.OK) {
      console.log('Authentication failed')
      throw new Error(`request failed with status ${authResponse.status()}`)
    }

    const jwt = await authResponse.text()

    return new ApiClient(request, jwt)
  }

  async createOrderAndReturnOrderId(): Promise<number> {
    console.log('Creating order...')
    const response = await this.request.post(`${serviceURL}${orderPath}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      data: OrderDTO.createOrderWithRandomData(),
    })
    console.log(`Order response:${await response.body()}`)
    expect(response.status()).toBe(StatusCodes.OK)
    const json = await response.json()

    return json.id
  }

  async getOrders(): Promise<OrderDTO[]> {
    console.log('Getting orders...')
    const response: APIResponse = await this.request.get(`${serviceURL}${orderPath}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    })
    expect(response.status()).toBe(StatusCodes.OK)
    const json = await response.json()
    expect(json.length).toBeGreaterThan(0)

    return json
  }

  async getOrderById(id: number): Promise<OrderDTO> {
    console.log('Getting order by id...')
    const orderById = await this.request.get(`${serviceURL}${orderPath}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    })
    expect(orderById.status()).toBe(StatusCodes.OK)
    const orderData = await orderById.json()
    return orderData.id
  }

  async deleteOrderById(id: number): Promise<boolean> {
    console.log('Delete order by id...')
    const deleteOrder = await this.request.delete(`${serviceURL}${orderPath}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    })
    expect(deleteOrder.status()).toBe(StatusCodes.OK)
    return true
  }
}
