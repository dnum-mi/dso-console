import type { Cluster, Environment, Project, Quota, Role, Stage, User } from '@prisma/client'
import { XOR, adminGroupPath } from '@cpn-console/shared'
import { getProjectInfosAndClusters } from '@/resources/project/business.js'
import {
  addLogs,
  deleteEnvironment as deleteEnvironmentQuery,
  getClusterById,
  getEnvironmentById,
  getEnvironmentInfos as getEnvironmentInfosQuery,
  getProjectInfos,
  getProjectInfosOrThrow,
  getPublicClusters,
  getQuotaById,
  getStageById,
  getUserById,
  initializeEnvironment,
  updateEnvironment as updateEnvironmentQuery,
  getEnvironmentsByProjectId,
} from '@/resources/queries-index.js'
import type { UserDetails } from '@/types/index.js'
import {
  checkClusterUnavailable,
  checkInsufficientRoleInProject,
  checkRoleAndLocked,
  filterOwners,
} from '@/utils/controller.js'
import { BadRequestError, DsoError, ForbiddenError, NotFoundError, UnprocessableContentError } from '@/utils/errors.js'
import { hook } from '@/utils/hook-wrapper.js'
import { getProjectAndcheckRole } from '../repository/business.js'

// Fetch infos
export const getEnvironmentInfosAndClusters = async (environmentId: string) => {
  const env = await getEnvironmentInfosQuery(environmentId)
  if (!env) throw new NotFoundError('Environnement introuvable', undefined)

  const authorizedClusters = [...await getPublicClusters(), ...env.project.clusters]
  return { env, authorizedClusters }
}

export const getEnvironmentInfos = async (environmentId: string) => {
  const env = await getEnvironmentInfosQuery(environmentId)
  if (!env) throw new NotFoundError('Environnement introuvable', undefined)
  return env
}

export const getProjectEnvironments = async (
  userId: User['id'],
  isAdmin: boolean,
  projectId: Project['id'],
) => {
  return isAdmin ? await getEnvironmentsByProjectId(projectId) : (await getProjectAndcheckRole(userId, projectId)).environments
}

type GetInitializeEnvironmentInfosParam = {
  userId: User['id'],
  projectId: Project['id'],
  stageId: Stage['id'],
  quotaId: Quota['id'],
}

export const getInitializeEnvironmentInfos = async ({
  userId,
  projectId,
  quotaId,
  stageId,
}: GetInitializeEnvironmentInfosParam) => {
  try {
    const user = await getUserById(userId)
    const { project, projectClusters } = await getProjectInfosAndClusters(projectId)
    const quota = await getQuotaById(quotaId)
    const stage = await getStageById(stageId)
    if (!stage) throw new BadRequestError('Stage introuvable')
    const authorizedClusters = projectClusters
      ?.filter(projectCluster => stage.clusters
        ?.find(stageCluster => stageCluster.id === projectCluster.id))
    return { user, project, quota, stage, authorizedClusters }
  } catch (error) {
    throw new Error(error?.message)
  }
}

// Check logic
type CheckEnvironmentParam = {
  project: { locked: boolean, roles: Role[], id: string, environments: Environment[] },
  userId: User['id'],
  name: Environment['name'],
  authorizedClusterIds: Cluster['id'][],
  clusterId: Cluster['id'],
  quotaId: Quota['id'],
  stage: Stage & { quotas: Quota[] },
}

export const checkCreateEnvironment = ({
  project,
  userId,
  name,
  authorizedClusterIds,
  clusterId,
  stage,
  quotaId,
}: CheckEnvironmentParam) => {
  const errorMessage = checkRoleAndLocked(project, userId, 'owner') ||
    checkExistingEnvironment(clusterId, name, project.environments) ||
    checkClusterUnavailable(clusterId, authorizedClusterIds) ||
    checkQuotaStageStatus(stage, quotaId)
  if (errorMessage) throw new ForbiddenError(errorMessage, undefined)
}

type CheckUpdateEnvironmentParam = {
  project: { locked: boolean, roles: Role[], id: string, environments: Environment[] },
  userId: User['id'],
  quotaId: Quota['id'],
  stage: Stage & { quotas: Quota[] },
}

export const checkUpdateEnvironment = ({
  project,
  userId,
  quotaId,
  stage,
}: CheckUpdateEnvironmentParam) => {
  const errorMessage = checkRoleAndLocked(project, userId, 'owner') ||
    checkQuotaStageStatus(stage, quotaId)
  if (errorMessage) throw new ForbiddenError(errorMessage, undefined)
}

type CheckDeleteEnvironmentParam = {
  project: { locked: boolean, roles: Role[], id: string },
  userId: string,
}

export const checkDeleteEnvironment = ({
  project,
  userId,
}: CheckDeleteEnvironmentParam) => {
  const errorMessage = checkInsufficientRoleInProject(userId, { minRole: 'owner', roles: project.roles })
  if (errorMessage) throw new ForbiddenError(errorMessage, { description: '', extras: { userId, projectId: project.id } })
}

export const checkExistingEnvironment = (clusterId: Cluster['id'], name: Environment['name'], environments: Environment[]) => {
  if (environments?.find(env => env.clusterId === clusterId && env.name === name)) {
    return 'Un environnement avec le même nom et déployé sur le même cluster existe déjà pour ce projet.'
  }
}

type ByStageOrQuota = XOR<Quota & { stages: Stage[] }, Stage & { quotas: Quota[] }>
export const checkQuotaStageStatus = (resource: ByStageOrQuota, matchingId: string) => {
  const associtation = resource.quotas
    ? resource.quotas.find(({ id }) => id === matchingId)
    : resource.stages.find(({ id }) => id === matchingId)
  if (!associtation) return 'Cette association quota / type d\'environnement n\'est plus disponible.'
}

// Routes logic
type CreateEnvironmentParam = {
  userId: User['id'],
  projectId: Project['id'],
  name: Environment['name'],
  clusterId: Environment['clusterId'],
  quotaId: Quota['id'],
  stageId: Stage['id'],
  requestId: string
}

export const createEnvironment = async (
  {
    userId,
    projectId,
    name,
    clusterId,
    quotaId,
    stageId,
    requestId,
  }: CreateEnvironmentParam) => {
  const { user, project, stage, quota, authorizedClusters } = await getInitializeEnvironmentInfos({
    userId,
    projectId,
    quotaId,
    stageId,
  })

  if (!project) throw new NotFoundError('Projet introuvable')
  if (!user) throw new NotFoundError('Utilisateur introuvable')
  if (!quota) throw new NotFoundError('Quota introuvable')

  checkCreateEnvironment({
    project,
    userId,
    name,
    authorizedClusterIds: authorizedClusters.map(authorizedCluster => authorizedCluster.id),
    clusterId,
    stage,
    quotaId: quota.id,
  })

  const projectOwners = filterOwners(project.roles)
  const environment = await initializeEnvironment({ projectId: project.id, name, projectOwners, clusterId, quotaId: quota.id, stageId: stage.id })

  try {
    const cluster = await getClusterById(clusterId)
    if (!cluster) throw new NotFoundError('Cluster introuvable')

    const { results } = await hook.project.upsert(project.id)

    await addLogs('Create Environment', results, userId, requestId)
    if (results.failed) {
      throw new UnprocessableContentError('Echec services à la création de l\'environnement')
    }

    return {
      ...environment,
      quotaId,
      stageId,
    }
  } catch (error) {
    if (error instanceof DsoError) {
      throw error
    }
    throw new Error(error?.message)
  }
}

type UpdateEnvironmentParam = {
  user: UserDetails,
  environmentId: Environment['id'],
  quotaId: Quota['id'],
  requestId: string,
}

export const updateEnvironment = async ({
  user,
  environmentId,
  requestId,
  quotaId,
}: UpdateEnvironmentParam) => {
  try {
    const dbEnvironment = await getEnvironmentById(environmentId)
    if (!dbEnvironment) throw new NotFoundError('Environment introuvable')
    const [stage, project, quota] = await Promise.all([
      getStageById(dbEnvironment.stageId),
      getProjectInfosOrThrow(dbEnvironment.projectId),
      getQuotaById(quotaId),
    ])

    const notGrantedMessage = checkRoleAndLocked(project, user.id, 'owner')
    if (notGrantedMessage) {
      throw new ForbiddenError(notGrantedMessage)
    }
    if (!project) throw new NotFoundError('Projet introuvable')
    if (!stage) throw new NotFoundError('Stage introuvable')
    if (!quota) throw new NotFoundError('Quota introuvable')

    if (!user.groups?.includes(adminGroupPath)) {
      checkUpdateEnvironment({
        project,
        userId: user.id,
        stage,
        quotaId: quota.id,
      })
    }
    if (!user.groups?.includes(adminGroupPath) && (quota.id !== quotaId && quota.isPrivate)) {
      throw new ForbiddenError('Ce quota est privé, accès restreint aux administrateurs')
    }
    // Modification du quota
    const env = await updateEnvironmentQuery({ id: environmentId, quotaId })
    if (quotaId) {
      const { results } = await hook.project.upsert(project.id)

      await addLogs('Update Environment Quotas', results, user.id, requestId)
      if (results.failed) {
        throw new UnprocessableContentError('Echec services à la mise à jour des quotas pour l\'environnement')
      }
    }

    return env
  } catch (error) {
    if (error instanceof DsoError) {
      throw error
    }
    throw new Error(error?.message)
  }
}

type DeleteEnvironmentParam = {
  userId: User['id'],
  projectId: Project['id'],
  environmentId: Environment['id'],
  requestId: string,
}

export const deleteEnvironment = async ({
  userId,
  projectId,
  environmentId,
  requestId,
}: DeleteEnvironmentParam) => {
  try {
    const environment = await getEnvironmentInfos(environmentId)
    const project = await getProjectInfos(projectId)
    if (!project) throw new NotFoundError('Projet introuvable')

    checkDeleteEnvironment({ project, userId })

    await deleteEnvironmentQuery(environment.id)

    // Suppression de l'environnement dans les services
    const cluster = await getClusterById(environment.clusterId)
    if (!cluster) throw new NotFoundError('Cluster introuvable')
    const { results } = await hook.project.upsert(project.id)

    await addLogs('Delete Environment', results, userId, requestId)
    if (results.failed) {
      throw new Error('Echec des services à la suppression de l\'environnement')
    }
  } catch (error) {
    if (error instanceof DsoError) {
      throw error
    }
    throw new Error(error?.message)
  }
}
