import { serverInstance } from '@/app.js'

import { createZone, deleteZone, listZones, updateZone } from './business.js'
import { AdminAuthorized, zoneContract } from '@cpn-console/shared'
import { authUser, ErrorResType, Forbidden403 } from '@/utils/controller.js'

export const zoneRouter = () => serverInstance.router(zoneContract, {
  listZones: async () => {
    const zones = await listZones()

    return {
      status: 200,
      body: zones,
    }
  },

  createZone: async ({ request: req, body: data }) => {
    const user = req.session.user
    const perms = await authUser(user)
    if (!AdminAuthorized.isAdmin(perms.adminPermissions)) return new Forbidden403()

    const body = await createZone(data)
    if (body instanceof ErrorResType) return body

    return {
      status: 201,
      body,
    }
  },

  updateZone: async ({ request: req, params, body: data }) => {
    const user = req.session.user
    const perms = await authUser(user)
    if (!AdminAuthorized.isAdmin(perms.adminPermissions)) return new Forbidden403()

    const zoneId = params.zoneId

    const body = await updateZone(zoneId, data)
    return {
      status: 201,
      body,
    }
  },

  deleteZone: async ({ request: req, params }) => {
    const user = req.session.user
    const perms = await authUser(user)
    if (!AdminAuthorized.isAdmin(perms.adminPermissions)) return new Forbidden403()
    const zoneId = params.zoneId

    const body = await deleteZone(zoneId)
    if (body instanceof ErrorResType) return body

    return {
      status: 204,
      body,
    }
  },
})
