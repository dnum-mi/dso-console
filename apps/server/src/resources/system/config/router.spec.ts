import { describe, expect, it, vi, beforeEach } from 'vitest'
import { systemPluginContract } from '@cpn-console/shared'
import app from '../../../app.js'
import * as business from './business.js'
import * as utilsController from '../../../utils/controller.js'
import { getUserMockInfos } from '../../../utils/mocks.js'

vi.mock('fastify-keycloak-adapter', (await import('../../../utils/mocks.js')).mockSessionPlugin)
const authUserMock = vi.spyOn(utilsController, 'authUser')
const businessGetPluginsConfigMock = vi.spyOn(business, 'getPluginsConfig')
const businessUpdatePluginConfigMock = vi.spyOn(business, 'updatePluginConfig')

describe('Test systemPluginContract', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getPluginsConfig', () => {
    it('Should return plugin configurations for authorized users', async () => {
      const user = getUserMockInfos(true)
      const pluginsConfig = []

      authUserMock.mockResolvedValueOnce(user)
      businessGetPluginsConfigMock.mockResolvedValueOnce(pluginsConfig)

      const response = await app.inject()
        .get(systemPluginContract.getPluginsConfig.path)
        .end()

      expect(businessGetPluginsConfigMock).toHaveBeenCalledTimes(1)
      expect(response.json()).toEqual(pluginsConfig)
      expect(response.statusCode).toEqual(200)
    })

    it('Should return 403 for unauthorized users', async () => {
      const user = getUserMockInfos(false)

      authUserMock.mockResolvedValueOnce(user)

      const response = await app.inject()
        .get(systemPluginContract.getPluginsConfig.path)
        .end()

      expect(businessGetPluginsConfigMock).toHaveBeenCalledTimes(0)
      expect(response.statusCode).toEqual(403)
    })
  })

  describe('updatePluginsConfig', () => {
    const newConfig = { plugin1: { keyId: 'value' } }
    it('Should update plugin configurations for authorized users', async () => {
      const user = getUserMockInfos(true)

      authUserMock.mockResolvedValueOnce(user)
      businessUpdatePluginConfigMock.mockResolvedValueOnce(newConfig)

      const response = await app.inject()
        .post(systemPluginContract.updatePluginsConfig.path)
        .body(newConfig)
        .end()

      expect(businessUpdatePluginConfigMock).toHaveBeenCalledWith(newConfig)
      expect(response.statusCode).toEqual(204)
    })

    it('Should return 403 for unauthorized users', async () => {
      const user = getUserMockInfos(false)

      authUserMock.mockResolvedValueOnce(user)

      const response = await app.inject()
        .post(systemPluginContract.updatePluginsConfig.path)
        .body(newConfig)
        .end()

      expect(businessUpdatePluginConfigMock).toHaveBeenCalledTimes(0)
      expect(response.statusCode).toEqual(403)
    })

    it('Should return error if business logic fails', async () => {
      const user = getUserMockInfos(true)

      authUserMock.mockResolvedValueOnce(user)
      businessUpdatePluginConfigMock.mockResolvedValueOnce(new utilsController.BadRequest400('une erreur'))

      const response = await app.inject()
        .post(systemPluginContract.updatePluginsConfig.path)
        .body(newConfig)
        .end()

      expect(businessUpdatePluginConfigMock).toHaveBeenCalledWith(newConfig)
      expect(response.statusCode).toEqual(400)
    })
  })
})
