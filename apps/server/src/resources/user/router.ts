import { userContract } from '@cpn-console/shared'
import {
  getMatchingUsers,
  getUsers,
  // patchUsers,
  logUser,
} from './business.js'
import '@/types/index.js'
import { serverInstance } from '@/app.js'
import { authUser, Forbidden403 } from '@/utils/controller.js'

// TODO tout revoir
export const userRouter = () => serverInstance.router(userContract, {
  getMatchingUsers: async ({ query }) => {
    const usersMatching = await getMatchingUsers(query)

    return {
      status: 200,
      body: usersMatching,
    }
  },

  auth: async ({ request }) => {
    const user = request.session.user
    const body = await logUser(user)

    return {
      status: 200,
      body,
    }
  },

  getAllUsers: async ({ request: req, query }) => {
    const user = req.session.user
    const perms = await authUser(user)
    if (!perms.adminPermissions) return new Forbidden403()

    const body = await getUsers(query)

    return {
      status: 200,
      body,
    }
  },

  // patchUsers: async ({ request: req, body }) => {
  //   const user = req.session.user
  //   const perms = await authUser(user)
  //   if (!AdminAuthorized.ManageRoles(perms.adminPermissions)) return new Forbidden403()

  //   const users = await patchUsers(body)

  //   return {
  //     status: 200,
  //     body: users,
  //   }
  // },
})
