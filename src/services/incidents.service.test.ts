import { afterAll, afterEach, beforeAll, describe, expect, JestMockCompat, spyOn, test } from 'vitest'

import ApiClient from './api.service'
import { getIncidents } from './incidents.service'

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

describe('Test getIncidents endpoint: Compare query parameters with api arguments', () => {
  test('Test closed incidents', async () => {
    const queryParams = {
      streams: ['e1or3yxzqu4p'],
      projects: ['zw6iggfxfqz6'],
      closed: true,
      limit: 1,
      offset: 0
    }
    try {
      await getIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.first_event_start).toBe(undefined)
    expect(arg.config.params.streams).toBe(queryParams.streams)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.closed).toBe(queryParams.closed)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test open incidents', async () => {
    const queryParams = {
      streams: ['e1or3yxzqu4p'],
      projects: ['zw6iggfxfqz6'],
      closed: false,
      limit: 1,
      offset: 0
    }
    try {
      await getIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.first_event_start).toBe(undefined)
    expect(arg.config.params.streams).toBe(queryParams.streams)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.closed).toBe(queryParams.closed)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test hot incidents', async () => {
    const queryParams = {
      streams: ['e1or3yxzqu4p'],
      projects: ['zw6iggfxfqz6'],
      min_events: 11,
      limit: 1,
      offset: 0
    }
    try {
      await getIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.closed).toBe(undefined)
    expect(arg.config.params.first_event_start).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.streams).toBe(queryParams.streams)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.min_events).toBe(queryParams.min_events)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test recent incidents', async () => {
    const queryParams = {
      streams: ['e1or3yxzqu4p'],
      projects: ['zw6iggfxfqz6'],
      first_event_start: '2022-01-01T00:00:00.000Z',
      limit: 1,
      offset: 0
    }
    try {
      await getIncidents(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.closed).toBe(undefined)
    expect(arg.config.params.min_events).toBe(undefined)
    expect(arg.config.params.sort).toBe(undefined)
    expect(arg.config.params.streams).toBe(queryParams.streams)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.first_event_start).toBe(queryParams.first_event_start)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
})
