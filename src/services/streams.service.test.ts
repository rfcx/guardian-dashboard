import { afterAll, afterEach, beforeAll, describe, expect, JestMockCompat, spyOn, test } from 'vitest'

import ApiClient from './api.service'
import { getStreams } from './streams.service'

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

describe('Test getStreams endpoint: Compare query parameters with api arguments', () => {
  test('Test closed incidents', async () => {
    const queryParams = {
      projects: ['zw6iggfxfqz6'],
      include_closed_incidents: true,
      limit: 1,
      offset: 0
    }
    try {
      await getStreams(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.has_hot_incident).toBe(undefined)
    expect(arg.config.params.has_new_events).toBe(undefined)
    expect(arg.config.params.keyword).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.limit_incidents).toBe(undefined)
    expect(arg.config.params.include_closed_incidents).toBe(queryParams.include_closed_incidents)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test open incidents', async () => {
    const queryParams = {
      projects: ['zw6iggfxfqz6'],
      include_closed_incidents: false,
      limit: 1,
      offset: 0
    }
    try {
      await getStreams(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.has_hot_incident).toBe(undefined)
    expect(arg.config.params.has_new_events).toBe(undefined)
    expect(arg.config.params.keyword).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.limit_incidents).toBe(undefined)
    expect(arg.config.params.include_closed_incidents).toBe(queryParams.include_closed_incidents)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test hot incidents', async () => {
    const queryParams = {
      has_hot_incident: true,
      projects: ['zw6iggfxfqz6'],
      limit: 1,
      offset: 0
    }
    try {
      await getStreams(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.has_hot_incident).toBe(queryParams.has_hot_incident)
    expect(arg.config.params.has_new_events).toBe(undefined)
    expect(arg.config.params.keyword).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.limit_incidents).toBe(undefined)
    expect(arg.config.params.include_closed_incidents).toBe(undefined)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
  test('Test recent incidents', async () => {
    const queryParams = {
      projects: ['zw6iggfxfqz6'],
      limit: 1,
      offset: 0,
      has_new_events: true
    }
    try {
      await getStreams(queryParams)
    } catch (e) {
      console.error('failed', e)
    }
    const arg = spy.mock.calls[0][0]
    expect(spy.mock.calls).toHaveLength(1)
    expect(arg.config.params.has_hot_incident).toBe(undefined)
    expect(arg.config.params.has_new_events).toBe(queryParams.has_new_events)
    expect(arg.config.params.keyword).toBe(undefined)
    expect(arg.config.params.projects).toBe(queryParams.projects)
    expect(arg.config.params.limit_incidents).toBe(undefined)
    expect(arg.config.params.include_closed_incidents).toBe(undefined)
    expect(arg.config.params.limit).toBe(queryParams.limit)
    expect(arg.config.params.offset).toBe(queryParams.offset)
  })
})
