import {
  getEnvironmentPermissions,
  setPermission,
  deletePermission,
} from '../models/queries/permission-queries.js'
import { getRoleByUserIdAndProjectId } from '../models/queries/users-projects-queries.js'
import { getLogInfos } from '../utils/logger.js'
import { send200, send201, send500 } from '../utils/response.js'

// GET

export const getEnvironmentPermissionsController = async (req, res) => {
  const userId = req.session?.user?.id
  const environmentId = req.params?.environmentId
  const projectId = req.params?.projectId

  try {
    const role = await getRoleByUserIdAndProjectId(userId, projectId)
    if (!role) throw new Error('Requestor is not member of project')

    const permissions = await getEnvironmentPermissions(environmentId)
    req.log.info({
      ...getLogInfos(),
      description: 'Permissions successfully retreived',
    })
    await send200(res, permissions)
  } catch (error) {
    const message = `Cannot retrieve permissions: ${error.message}`
    req.log.error({
      ...getLogInfos(),
      description: message,
      error: error.message,
    })
    send500(res, message)
  }
}

// POST

export const setPermissionController = async (req, res) => {
  const userId = req.session?.user?.id
  const environmentId = req.params?.environmentId
  const projectId = req.params?.projectId
  const data = req.body

  try {
    const role = await getRoleByUserIdAndProjectId(userId, projectId)
    if (!role) throw new Error('Requestor is not member of project')

    const permission = await setPermission({ userId: data.userId, environmentId, level: data.level })
    // TODO chercher le noms de l'environnement associé et dériver les noms keycloak
    // if (data.level === 0) await removeMembers([data.userId], [permission.Environment.name])
    // if (data.level === 10) await removeMembers([data.userId], [permission.Environment.name]) && await addMembers([data.userId], [permission.Environment.name])
    // if (data.level === 20) await addMembers([data.userId], [permission.Environment.name])
    req.log.info({
      ...getLogInfos(),
      description: 'Permission successfully created',
    })
    await send201(res, permission)
  } catch (error) {
    const message = `Cannot create permissions: ${error.message}`
    req.log.error({
      ...getLogInfos(),
      description: message,
      error: error.message,
    })
    send500(res, message)
  }
}

// PUT

export const updatePermissionController = async (req, res) => {
  const userId = req.session?.user?.id
  const environmentId = req.params?.environmentId
  const projectId = req.params?.projectId
  const data = req.body

  try {
    const role = await getRoleByUserIdAndProjectId(userId, projectId)
    if (!role) throw new Error('Requestor is not member of project')

    const permission = await setPermission({ userId: data.userId, environmentId, level: data.level })
    req.log.info({
      ...getLogInfos(),
      description: 'Permission successfully updated',
    })
    await send201(res, permission)
  } catch (error) {
    const message = `Cannot update permissions ${error.message}`
    req.log.error({
      ...getLogInfos(),
      description: message,
      error: error.message,
    })
    send500(res, message)
  }
}

// DELETE

export const deletePermissionController = async (req, res) => {
  const userId = req.session?.user?.id
  const environmentId = req.params?.environmentId
  const projectId = req.params?.projectId
  const data = req.body

  try {
    const role = await getRoleByUserIdAndProjectId(userId, projectId)
    if (!role) throw new Error('Requestor is not member of project')

    const permission = await deletePermission(data.userId, environmentId)

    const message = 'Permission successfully deleted in database'
    req.log.info({
      ...getLogInfos({ permission }),
      description: message,
    })
  } catch (error) {
    req.log.error({
      ...getLogInfos(),
      description: 'Cannot delete permission',
      error: error.message,
    })
  }
}
