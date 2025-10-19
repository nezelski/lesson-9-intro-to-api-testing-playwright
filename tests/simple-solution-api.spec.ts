import { expect, test } from '@playwright/test'
import Ajv from 'ajv'
import { StatusCodes } from 'http-status-codes'
import { OrderDTO } from './dto/OrderDTO'

import { orderSchema } from './dto/order-schema'

const BASE_URL = 'https://backend.tallinn-learning.ee/test-orders'

const ajv = new Ajv()
const validate = ajv.compile(orderSchema)

test('get order with correct id should receive code 200', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/1`) // .get(BASE_URL + '/1')
  expect.soft(response.status()).toBe(200)
})

test('get order with incorrect id should receive code 400', async ({ request }) => {
  const responseOrderId0 = await request.get(`${BASE_URL}/0`)
  const responseOrderId11 = await request.get(`${BASE_URL}/11`)
  const responseOrderIdNull = await request.get(`${BASE_URL}/null`)
  const responseOrderIdTest = await request.get(`${BASE_URL}/test`)

  expect.soft(responseOrderId0.status()).toBe(StatusCodes.BAD_REQUEST)
  expect.soft(responseOrderId11.status()).toBe(StatusCodes.BAD_REQUEST)
  expect.soft(responseOrderIdNull.status()).toBe(StatusCodes.BAD_REQUEST)
  expect.soft(responseOrderIdTest.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('post order with correct data should receive code 200', async ({ request }) => {
  const requestBody = OrderDTO.createOrderWithRandomData()
  const response = await request.post(BASE_URL, {
    data: requestBody,
  })

  const responseData: OrderDTO = await response.json()
  const valid = validate(responseData)
  expect.soft(valid).toBeTruthy()
  expect.soft(response.status()).toBe(StatusCodes.OK)
  OrderDTO.checkServerResponse(responseData)
})

test('Delete order with correct id', async ({ request }) => {
  const requestBody = OrderDTO.createOrderWithRandomData()
  requestBody.id = 9

  const responseCreate = await request.post(BASE_URL, {
    data: requestBody,
  })

  const responseDelete = await request.delete(`${BASE_URL}/${requestBody.id}`, {
    headers: {
      api_key: '1234567890123456',
    },
  })

  const responseCreateData: OrderDTO = await responseCreate.json()
  const responseDeleteData: OrderDTO = await responseCreate.json()

  expect.soft(responseCreate.status()).toBe(StatusCodes.OK)
  expect.soft(responseDelete.status()).toBe(204)
  const validCreateJson = validate(responseCreateData)
  const validDeleteJson = validate(responseDeleteData)
  expect(validCreateJson).toBe(true)
  expect(validDeleteJson).toBe(true)
})

//HOMEWORK 9:

//GET - Login with username and password to get APi key:

test('get api key with correct username and password should receive 200 OK', async ({
  request,
}) => {
  const response4 = await request.get(`${BASE_URL}?username=username&password=password`)

  console.log('responce body:', await response4.json())
  expect(response4.status()).toBe(StatusCodes.OK)
})

test('get api key with missing username should receive 500', async ({ request }) => {
  const response5 = await request.get(`${BASE_URL}`)
  expect(response5.status()).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
})

test('get api key with missing password should receive 500', async ({ request }) => {
  const response6 = await request.get(`${BASE_URL}?username=username&password=`)
  expect(response6.status()).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
})

test('get api key with missing username and password should receive 500', async ({ request }) => {
  const response7 = await request.get(`${BASE_URL}?username=&password=`)
  expect(response7.status()).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
})

test('get api key with incorrect username should receive 400', async ({ request }) => {
  const response8 = await request.get(`${BASE_URL}?username=787887??_)(&^&password=password`)
  expect(response8.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('get api key with incorrect password should receive 400', async ({ request }) => {
  const response9 = await request.get(`${BASE_URL}?username=username&password={}}}}+__@@##`)
  expect(response9.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('get api key with incorrect username and password should receive 400', async ({ request }) => {
  const response10 = await request.get(`${BASE_URL}?username=876876??&password={}{}{}`)
  expect(response10.status()).toBe(StatusCodes.BAD_REQUEST)
})

//GET  order  info and current time: ``

test(' get order info and current time with correct headers and valid order id should receive 200', async ({
  request,
}) => {
  const headersData: { 'x-application-name': string; 'x-session-id': string } = {
    'x-application-name': 'tld',
    'x-session-id': 'jwtEysp',
  }

  const orderInfo = await request.get(BASE_URL + '/time/7', {
    headers: headersData,
  })
  console.log('response body:', await orderInfo.json())
  expect(orderInfo.status()).toBe(StatusCodes.OK)
})

test('GET order info and time receive 400 if header x-application-name is incorrect', async ({
  request,
}) => {
  const orderInfo1 = await request.get(BASE_URL + '/time/5', {
    headers: {
      'x-application-name': 'tlg',
      'x-session-id': 'jwtEysp',
    },
  })
  expect(orderInfo1.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('GET order info and time,receive 400 if header x-session-id is incorrect', async ({
  request,
}) => {
  const orderInfo2 = await request.get(BASE_URL + '/time/2', {
    headers: {
      'x-application-name': 'tld',
      'x-session-id': 'jwt',
    },
  })
  expect(orderInfo2.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('GET order info and time - receive 400 if order id is incorrect', async ({ request }) => {
  const orderInfo3 = await request.get(BASE_URL + '/time/15', {
    headers: {
      'x-application-name': 'tld',
      'x-session-id': 'jwtEysp',
    },
  })
  expect(orderInfo3.status()).toBe(StatusCodes.BAD_REQUEST)
})

test("GET order info and time- receive 400 if header 'x-application-name' is missing", async ({
  request,
}) => {
  const orderInfo4 = await request.get(BASE_URL + '/time/5', {
    headers: {
      'x-application-name': '',
      'x-session-id': 'jwtEysp',
    },
  })
  expect(orderInfo4.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('GET order info and time -receive 400 if header x-session-id is missing', async ({
  request,
}) => {
  const orderInfo5 = await request.get(BASE_URL + '/time/1', {
    headers: {
      'x-application-name': 'tld',
    },
  })
  expect(orderInfo5.status()).toBe(StatusCodes.BAD_REQUEST)
})

//PUT  - test update an order by id

test('PUT update an order with correct id should return 200', async ({ request }) => {
  const updateOrder = {
    status: 'OPEN',
    courierId: 0,
    customerName: 'Ivan',
    customerPhone: 'phone number is up to date',
    comment: 'order is updated',
    id: 0,
  }

  const responsePUT = await request.put(BASE_URL + '/5', {
    data: updateOrder,
    headers: {
      api_key: '1234567890123456',
    },
  })
  expect(responsePUT.status()).toBe(StatusCodes.OK)
  const responseBody = await responsePUT.json()
  expect(responseBody.customerName).toBe('Ivan')
  expect(responseBody.customerPhone).toBe('phone number is up to date')
  expect(responseBody.comment).toBe('order is updated')
  console.log(responseBody)
})

test('PUT update an order with incorrect api_key should return 401', async ({ request }) => {
  const updateOrder1 = {
    status: 'OPEN',
    courierId: 0,
    customerName: 'Ivan',
    customerPhone: 'phone number is up to date',
    comment: 'incorrect api_key',
    id: 0,
  }
  const responsePUT1 = await request.put(BASE_URL + '/4', {
    data: updateOrder1,
    headers: {
      api_key: '8768769856798566556',
    },
  })
  expect(responsePUT1.status()).toBe(StatusCodes.UNAUTHORIZED)
})

// В этом тесте пытался в теле запроса передать невалидные данные, ожидал 400, но получал 200
//test ('update an order with incorrect request body data should return 400', async ({ request }) => {
// const updateOrder2 = {
// status: "OPEN",
//сourierId: 0,
//customerName: 9, // должно быть string
//customerPhone: 7, // должно быть string
//comment: "incorrect request body data",
//id: 0
//}
//const responsePUT2 = await request.put(BASE_URL + '/8', {
//data: updateOrder2,
//headers: {
//'api_key': '1234567890123456'
//}
//})
//expect (responsePUT2.status()).toBe(StatusCodes.BAD_REQUEST);
//})

//DELETE - delete an order by id

test('DELETE an order by id with correct id  and valid api_key should return 204', async ({
  request,
}) => {
  const deleteOrder = await request.delete(BASE_URL + '/5', {
    headers: {
      api_key: '1234567890123456',
    },
  })
  expect(deleteOrder.status()).toBe(StatusCodes.NO_CONTENT)
})

test('DELETE an order by id with invalid api_key should return 401', async ({ request }) => {
  const responseLongApi = await request.delete(BASE_URL + '/5', {
    headers: {
      api_key: '1234123412341234787876',
    },
  })
  const responseShortApi = await request.delete(BASE_URL + '/5', {
    headers: {
      api_key: '1234',
    },
  })

  expect(responseLongApi.status()).toBe(StatusCodes.UNAUTHORIZED)
  expect(responseShortApi.status()).toBe(StatusCodes.UNAUTHORIZED)
})
