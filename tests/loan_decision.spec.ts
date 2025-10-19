
import { APIResponse, expect, test } from '@playwright/test'

import { StatusCodes } from 'http-status-codes'

import {ApplicationDTO} from './dto/ApplicationDTO'

const urlBasic = 'https://backend.tallinn-learning.ee/api/loan-calc/decision'

interface decisionResponse {
  riskScore: number;
  riskLevel: string;
  riskPeriods: number [];
  applicationId: string;
  riskDecision: string;
}

test ('positive loan decision with low risk and correct input data should return 200', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(8000,0,25,true, 400,12)
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })

  const decisionResponseData:decisionResponse = (await response.json())
  expect.soft(response.status()).toBe(StatusCodes.OK);
  expect.soft(decisionResponseData.riskDecision.toLowerCase()).toBe('positive');
  expect.soft(decisionResponseData.riskLevel.toLowerCase()).toBe('low risk');
  expect.soft(decisionResponseData.riskPeriods).toEqual([12,18,24,30,36]);
  expect.soft(decisionResponseData.riskScore).toBeGreaterThan(0);
  expect.soft(decisionResponseData.applicationId.length).toBeGreaterThan(0);
})

test ('positive loan decision with medium risk and correct input data should return 200', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(8000,4,18,true, 350,6);
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })
  const decisionResponseData:decisionResponse = (await response.json());
  expect.soft(response.status()).toBe(StatusCodes.OK);
  expect.soft(decisionResponseData.riskDecision.toLowerCase()).toBe('positive');
  expect.soft(decisionResponseData.riskLevel.toLowerCase()).toBe('medium risk');
  expect.soft(decisionResponseData.applicationId.length).toBeGreaterThan(0);
  expect.soft(decisionResponseData.riskPeriods).toEqual([6,9,12]);
  expect.soft(decisionResponseData.riskScore).toBeGreaterThan(0);
})

test ('positive loan decision with high risk and correct input data should return 200', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(500,300,18,false, 2600,6);
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })
  const decisionResponseData:decisionResponse = (await response.json());
  expect.soft(response.status()).toBe(StatusCodes.OK);
  expect.soft(decisionResponseData.riskDecision.toLowerCase()).toBe('positive');
  expect.soft(decisionResponseData.riskLevel.toLowerCase()).toBe('high risk');
  expect.soft(decisionResponseData.applicationId.length).toBeGreaterThan(0);
  expect.soft(decisionResponseData.riskPeriods).toEqual([3,6]);
  expect.soft(decisionResponseData.riskScore).toBeGreaterThan(0);
})

test ('negative loan decision with very high risk and correct input data should return 200', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(500,300,18,false, 3000,6);
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })
  const decisionResponseData:decisionResponse = (await response.json());
  expect.soft(response.status()).toBe(StatusCodes.OK);
  expect.soft(decisionResponseData.riskDecision.toLowerCase()).toBe('negative');
  expect.soft(decisionResponseData.riskLevel.toLowerCase()).toBe('very high risk');
  expect.soft(decisionResponseData.applicationId.length).toBeGreaterThan(0);
  expect.soft(decisionResponseData.riskPeriods.length).toBe(0);
  expect.soft(decisionResponseData.applicationId.length).toBeGreaterThan(0);
})

test ('if income = 0 should return 400', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(0,300,18,false, 3000,6);
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })
  expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST);
})
test ('if debt is negative should return 400', async ({request}) => {
  const requestBody:ApplicationDTO = new ApplicationDTO(1500,-300,18,true, 3000,6);
  const response:APIResponse = await request.post (urlBasic, {
    data: requestBody,
    headers: {'Content-Type': 'application/json'},
  })
  expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST);
})

