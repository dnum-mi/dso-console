import { type FastifyInstance } from 'fastify'
import { quotaAdminRouter } from './quota/admin/router.js'
import { stageAdminRouter } from './stage/admin/router.js'
import { userAdminRouter } from './user/admin/router.js'
import { zoneAdminRouter } from './zone/admin/router.js'
import { serverInstance } from '@/app.js'
import { checkAdminGroup } from '@/utils/controller.js'

export const apiRouterAdmin = () => async (app: FastifyInstance) => {
  app.addHook('preHandler', checkAdminGroup)
  await app.register(serverInstance.plugin(quotaAdminRouter()))
  await app.register(serverInstance.plugin(stageAdminRouter()))
  await app.register(serverInstance.plugin(userAdminRouter()))
  await app.register(serverInstance.plugin(zoneAdminRouter()), { responseValidation: true })
}
