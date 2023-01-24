import { sequelize } from '../../connect.js'
import { getPermissionModel } from '../permission.js'
import { getEnvironmentModel } from '../environment.js'
import { getUserModel } from '../user.js'

// GET
export const getEnvPermissions = async (envId) => {
  return getPermissionModel().findAll({
    environmentId: envId,
  })
}

export const getUserPermissions = async (userId) => {
  return getPermissionModel().findAll({
    userId,
  })
}

// CREATE
export const setPermission = async ({ userId, envId, level }) => {
  return getPermissionModel().upsert({ userId, environmentId: envId, level },
    {
      includes: [
        { model: getUserModel() },
        { model: getEnvironmentModel() },
      ],
    })
}

// DELETE
export const deletePermission = async (id) => {
  return await getPermissionModel().destroy({
    where: {
      id,
    },
  })
}

// TECH
export const _dropPermissionsTable = async () => {
  await sequelize.drop({
    tableName: getPermissionModel().tableName,
    force: true,
    cascade: true,
  })
}
