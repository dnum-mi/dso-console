import {
  initializeEnvironment,
  updateEnvironmentCreated,
  updateEnvironmentFailed,
  updateEnvironmentDeleting,
  deleteEnvironment,
  getEnvironmentInfos,
} from '../queries/environment-queries.js'
import { getProjectInfos, lockProject } from '../queries/project-queries.js'
import { addReqLogs } from '../utils/logger.js'
import { sendOk, sendCreated, sendNotFound, sendBadRequest, sendForbidden } from '../utils/response.js'
import { AsyncReturnType, filterOwners, hasPermissionInEnvironment, hasRoleInProject, unlockProjectIfNotFailed } from '../utils/controller.js'
import { hooks } from '../plugins/index.js'
import { addLogs } from '../queries/log-queries.js'
import { gitlabUrl, harborUrl, projectRootDir } from '../utils/env.js'
import { DeleteEnvironmentDto, InitializeEnvironmentDto, projectIsLockedInfo } from 'shared'
import { EnhancedFastifyRequest } from '@/types/index.js'
import { getUserById } from '@/queries/user-queries.js'

// GET
export const getEnvironmentByIdController = async (req, res) => {
  const environmentId = req.params?.environmentId
  const userId = req.session?.user?.id
  const projectId = req.params?.projectId

  try {
    // TODO : idée refacto : get env and includes permissions
    const env = await getEnvironmentInfos(environmentId)

    // bloc de contrôle
    const isProjectMember = await hasRoleInProject(userId, { roles: env.project.roles })
    if (!isProjectMember) throw new Error('Vous n\'êtes pas membre du projet')

    const isAllowed = await hasPermissionInEnvironment(userId, env.permissions, 3)
    if (!isAllowed) throw new Error('Vous n\'êtes pas souscripteur et n\'avez pas accès à cet environnement')
    delete env.project.roles

    addReqLogs({
      req,
      description: 'Environnement récupéré avec succès',
      extras: {
        environmentId,
        projectId,
      },
    })
    sendOk(res, env)
  } catch (error) {
    const description = 'Echec de la récupération de l\'environnement'
    addReqLogs({
      req,
      description,
      extras: {
        environmentId,
        projectId,
      },
      error,
    })
    return sendNotFound(res, description)
  }
}

// POST
export const initializeEnvironmentController = async (req: EnhancedFastifyRequest<InitializeEnvironmentDto>, res) => {
  const data = req.body
  const userId = req.session?.user?.id
  const projectId = req.params?.projectId

  let env: AsyncReturnType<typeof initializeEnvironment>
  let project: AsyncReturnType<typeof getProjectInfos>
  let owner: AsyncReturnType<typeof getUserById>
  try {
    owner = await getUserById(userId)
    project = await getProjectInfos(projectId)

    // bloc de contrôle
    // TODO Joi validation
    if (project.locked) return sendForbidden(res, projectIsLockedInfo)

    const isProjectOwner = await hasRoleInProject(userId, { roles: project.roles, minRole: 'owner' })
    if (!isProjectOwner) throw new Error('Vous n\'êtes pas souscripteur du projet')
    project.environments?.forEach(env => {
      if (env.name === data.name) return sendBadRequest(res, `L'environnement ${data.name} existe déjà pour ce projet`)
    })

    await lockProject(projectId)
    const projectOwners = filterOwners(project.roles)
    env = await initializeEnvironment({ projectId: project.id, name: data.name, projectOwners })

    addReqLogs({
      req,
      description: 'Environnement et permissions créés avec succès',
      extras: {
        environmentId: env.id,
        projectId,
      },
    })
    sendCreated(res, env)
  } catch (error) {
    const description = 'Echec de la création de l\'environnement'
    addReqLogs({
      req,
      description,
      extras: {
        projectId,
      },
      error,
    })
    return sendBadRequest(res, description)
  }

  // Process api call to external service
  try {
    const registryHost = harborUrl.split('//')[1].split('/')[0]
    const environmentName = env.name
    const projectName = project.name
    const organizationName = project.organization.name
    const gitlabBaseURL = `${gitlabUrl}/${projectRootDir}/${organizationName}/${projectName}`
    const repositories = env.project.repositories.map(({ internalRepoName }) => ({
      url: `${gitlabBaseURL}/${internalRepoName}.git`,
      internalRepoName,
    }))

    const envData = {
      environment: environmentName,
      project: projectName,
      organization: organizationName,
      repositories,
      registryHost,
      owner,
    }

    const results = await hooks.initializeEnvironment.execute(envData)
    // @ts-ignore TODO fix types HookPayload and Prisma.JsonObject
    await addLogs('Create Environment', results, userId)
    if (results.failed) throw new Error('Echec services à la création de l\'environnement')
    await updateEnvironmentCreated(env.id)
    await unlockProjectIfNotFailed(projectId)
    addReqLogs({
      req,
      description: 'Environnement créé avec succès par les plugins',
      extras: {
        environmentId: env.id,
        projectId,
      },
    })
  } catch (error) {
    await updateEnvironmentFailed(env.id)
    addReqLogs({
      req,
      description: 'Echec de création de l\'environnement par les plugins',
      extras: {
        environmentId: env.id,
        projectId,
      },
      error,
    })
  }
}

// DELETE
export const deleteEnvironmentController = async (req: EnhancedFastifyRequest<DeleteEnvironmentDto>, res) => {
  const environmentId = req.params?.environmentId
  const projectId = req.params?.projectId
  const userId = req.session?.user?.id

  let env: AsyncReturnType<typeof getEnvironmentInfos>
  try {
    env = await getEnvironmentInfos(environmentId)

    const isProjectOwner = await hasRoleInProject(userId, { roles: env.project.roles, minRole: 'owner' })
    if (!isProjectOwner) return sendForbidden(res, 'Vous n\'êtes pas souscripteur du projet')

    await updateEnvironmentDeleting(environmentId)
    await lockProject(projectId)

    addReqLogs({
      req,
      description: 'Statut de l\'environnement mis à jour avec succès, environnement en cours de suppression',
      extras: {
        environmentId,
        projectId,
      },
    })
  } catch (error) {
    const description = 'Echec de la suppression de l\'environnement'
    addReqLogs({
      req,
      description,
      extras: {
        environmentId,
        projectId,
      },
      error,
    })
    return sendBadRequest(res, description)
  }

  try {
    const environmentName = env.name
    const projectName = env.project.name
    const organizationName = env.project.organization.name
    const gitlabBaseURL = `${gitlabUrl}/${projectRootDir}/${organizationName}/${projectName}`
    const repositories = env.project.repositories.map(({ internalRepoName }) => ({
      url: `${gitlabBaseURL}/${internalRepoName}.git`,
      internalRepoName,
    }))

    const envData = {
      environment: environmentName,
      project: projectName,
      organization: organizationName,
      repositories,
    }
    // TODO: Fix type
    const results = await hooks.deleteEnvironment.execute(envData)
    // @ts-ignore TODO fix types HookPayload and Prisma.JsonObject
    // await addLogs('Delete Environment', results, userId)
    if (results.failed) throw new Error('Echec des services à la suppression de l\'environnement')
    await deleteEnvironment(environmentId)
    await unlockProjectIfNotFailed(projectId)
    addReqLogs({
      req,
      description: 'Environnement supprimé avec succès',
      extras: {
        environmentId,
        projectId,
      },
    })
  } catch (error) {
    await updateEnvironmentFailed(environmentId)
    addReqLogs({
      req,
      description: 'Erreur de la suppression de l\'environnement',
      extras: {
        environmentId,
        projectId,
      },
      error,
    })
  }
}
