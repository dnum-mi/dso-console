import { type Hook, createHook } from './hook.js'
import type { Environment, Organization } from './index.js'
import type { RepositoryForEnv } from './repository.js'
import type { Project } from './project.js'
import { ClusterMix } from '@/types/index.js'
import { User } from '@prisma/client'

export type ResourceQuota = {
  memory: string
  cpu: number
}

export type EnvironmentBase = {
  organization: Organization
  project: Project
  environment: Environment
}

export type EnvironmentCreateArgs = {
  repositories: RepositoryForEnv[]
  quota: ResourceQuota
  owner: User
  cluster: ClusterMix
} & EnvironmentBase

export type EnvironmentQuotaUpdateArgs = {
  repositories: RepositoryForEnv[]
  quota: ResourceQuota
  cluster: ClusterMix
} & EnvironmentBase

export type EnvironmentDeleteArgs = {
  repositories: RepositoryForEnv[]
  cluster: ClusterMix
} & EnvironmentBase

export const initializeEnvironment: Hook<EnvironmentCreateArgs, void> = createHook()
export const deleteEnvironment: Hook<EnvironmentDeleteArgs, void> = createHook()
export const updateEnvironmentQuota: Hook<EnvironmentQuotaUpdateArgs, void> = createHook()
