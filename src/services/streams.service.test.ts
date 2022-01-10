import { afterAll, afterEach, beforeAll, describe, expect, JestMockCompat, spyOn, test } from 'vitest'

import ApiClient from './api.service'
import { getStreamsWithIncidents } from './streams.service'

let spy: JestMockCompat

beforeAll(() => {
  spy = spyOn(ApiClient, 'request').mockImplementation(async () => { return await Promise.resolve({ data: {}, headers: {} }) })
})

afterEach(() => {
  spy.mockClear()
})

afterAll(() => {
  spy.mockRestore()
})

describe('Test getStreamsWithIncidents endpoint: Compare query parameters with api arguments', () => {
  test('Test closed incidents', async () => {
    const queryParams = {
      incidents_min_events: undefined,
      sort: undefined,
      keyword: undefined,
      projects: ['zw6iggfxfqz6'],
      incidents_closed: true,
      limit: 1,
      offset: 0
    }
    try {
      await getStreamsWithIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.incidents_min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.incidents_closed).toBe(queryParams.incidents_closed)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test open incidents', async () => {
    const queryParams = {
      incidents_min_events: undefined,
      sort: undefined,
      keyword: undefined,
      projects: ['zw6iggfxfqz6'],
      incidents_closed: false,
      limit: 1,
      offset: 0
    }
    try {
      await getStreamsWithIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.incidents_min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.incidents_closed).toBe(queryParams.incidents_closed)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test hot incidents', async () => {
    const queryParams = {
      incidents_min_events: 11,
      sort: undefined,
      keyword: undefined,
      projects: ['zw6iggfxfqz6'],
      incidents_closed: undefined,
      limit: 1,
      offset: 0
    }
    try {
      await getStreamsWithIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.incidents_min_events).toBe(queryParams.incidents_min_events)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.incidents_closed).toBe(undefined)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test recent incidents', async () => {
    const queryParams = {
      incidents_min_events: undefined,
      sort: undefined,
      keyword: undefined,
      projects: ['zw6iggfxfqz6'],
      incidents_closed: undefined,
      limit: 1,
      offset: 0
    }
    try {
      await getStreamsWithIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.incidents_min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.incidents_closed).toBe(undefined)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
})
