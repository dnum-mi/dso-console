import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closeConnections } from './connect.js'
import { getPreparedApp } from './prepare-app.js'
import { exitGracefully, handleExit } from './server.js'

vi.mock('fastify-keycloak-adapter', (await import('./utils/mocks.js')).mockSessionPlugin)
vi.mock('./init/db/index.js', () => ({ initDb: vi.fn() }))
vi.mock('./connect.js')

process.exit = vi.fn()

vi.mock('./prepare-app.js', () => {
  const app = {
    listen: vi.fn(),
    log: {
      error: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
    },
    close: vi.fn(async () => {}),
  }
  return {
    getPreparedApp: () => Promise.resolve(app),
  }
})

describe('server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call closeConnections without parameter', async () => {
    await exitGracefully()
    const app = await getPreparedApp()

    expect(closeConnections).toHaveBeenCalledTimes(1)
    expect(closeConnections.mock.calls[0]).toHaveLength(0)
    expect(app.log.error).toHaveBeenCalledTimes(0)
  })

  it('should log an error', async () => {
    await exitGracefully(new Error('error'))

    const app = await getPreparedApp()

    expect(closeConnections).toHaveBeenCalledTimes(1)
    expect(closeConnections.mock.calls[0]).toHaveLength(0)
    expect(app.log.error).toHaveBeenCalledTimes(1)
    expect(app.log.error.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('should call process.on 4 times', () => {
    const processOn = vi.spyOn(process, 'on')

    handleExit()

    expect(processOn).toHaveBeenCalledTimes(5)
  })
})
