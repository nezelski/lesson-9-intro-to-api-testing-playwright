import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { LoginDTO } from './dto/LoginDTO'

const BASE_URL = 'https://backend.tallinn-learning.ee'

test('TL-11-1 Login/student returns 200 and JWT', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  const jwtValue = await response.text()
  const jwtRegex = /^eyJhb[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  expect(response.status()).toBe(StatusCodes.OK)
  expect((await response.text()).length).toBeGreaterThan(0)
  expect(jwtValue).toMatch(jwtRegex)
})

test('TL-11-2 Login/student returns 401 if password is incorrect', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithIncorrectData(),
  })
  expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
})

test('TL-11-3 Login/student returns 401 if password is missing', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`, {
    data: {
      username: 'test',
    },
  })
  expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
})

test('TL-11-4 Login/student returns 401 if data is empty', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`, {
    data: {},
  })
  expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
})

test('TL-11-4 Login/student returns 400 if data is missing', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`)
  expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
})

test('TL-11-5 Login/student returns 401 if username is missing', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/login/student`, {
    data: {
      password: 'test',
    },
  })
  expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
})

test('TL-11-6 Login/student returns 405 if request method is incorrect', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/login/student`, {
    data: LoginDTO.createLoginWithCorrectData(),
  })
  expect(response.status()).toBe(StatusCodes.METHOD_NOT_ALLOWED)
})
