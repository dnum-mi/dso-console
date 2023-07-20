import type { AddEnvironmentClusterExecArgs, DeleteEnvironmentExecArgs, InitializeEnvironmentExecArgs, RemoveEnvironmentClusterExecArgs } from '@/plugins/hooks/environment.js'
import { addDestinationToApplicationProject, createApplicationProject, deleteApplicationProject, removeDestinationFromApplicationProject } from './app-project.js'
import { createApplication, deleteApplication } from './applications.js'
import { HookPayload, PluginResult } from '@/plugins/hooks/hook.js'
import { CreateRepositoryExecArgs, DeleteRepositoryExecArgs } from '@/plugins/hooks/repository.js'

export const newEnv = async (payload: HookPayload<InitializeEnvironmentExecArgs>): Promise<PluginResult> => {
  try {
    const { project, organization, environment, repositories } = payload.args
    // @ts-ignore keycloak is generated by keycloak plugin
    const { roGroup, rwGroup } = payload.keycloak
    const namespace = `${organization}-${project}-${environment}`

    const appProjectName = `${organization}-${project}-${environment}-project`
    await createApplicationProject({ appProjectName, roGroup, rwGroup, repositories })

    for (const repo of repositories) {
      const applicationName = `${organization}-${project}-${repo.internalRepoName}-${environment}`
      await createApplication({ applicationName, appProjectName, namespace, repo })
    }
    return {
      status: {
        result: 'OK',
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}

export const deleteEnv = async (payload: HookPayload<DeleteEnvironmentExecArgs>): Promise<PluginResult> => {
  try {
    const { project, organization, environment, repositories } = payload.args

    const appProjectName = `${organization}-${project}-${environment}-project`
    // const destNamespace = `${organization}-${project}-${environment}`
    // await deleteApplicationProject({ appProjectName, destNamespace })
    await deleteApplicationProject({ appProjectName })
    for (const repo of repositories) {
      const applicationName = `${organization}-${project}-${repo.internalRepoName}-${environment}`
      await deleteApplication({ applicationName, repoUrl: repo.url })
    }
    return {
      status: {
        result: 'OK',
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}

const nothingStatus: PluginResult = {
  status: {
    result: 'OK',
    message: 'Not an infra repository',
  },
}

export const newRepo = async (payload: HookPayload<CreateRepositoryExecArgs>): Promise<PluginResult> => {
  try {
    if (!payload.args.isInfra) return nothingStatus
    const repo = { internalRepoName: payload.args.internalRepoName, url: payload.args.internalUrl }
    const { project, organization, environments } = payload.args

    for (const env of environments) {
      const roGroup = `/${organization}-${project}/${env}/RO`
      const rwGroup = `/${organization}-${project}/${env}/RW`
      const namespace = `${organization}-${project}-${env}`
      const appProjectName = `${organization}-${project}-${env}-project`
      const applicationName = `${organization}-${project}-${repo.internalRepoName}-${env}`
      await createApplicationProject({ appProjectName, roGroup, rwGroup, repositories: [] })
      await createApplication({ applicationName, appProjectName, namespace, repo })
    }
    return {
      status: {
        result: 'OK',
        message: 'Created',
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}

export const deleteRepo = async (payload: HookPayload<DeleteRepositoryExecArgs>): Promise<PluginResult> => {
  if (!payload.args.isInfra) return nothingStatus

  try {
    const { project, organization, environments, internalRepoName, internalUrl } = payload.args

    for (const env of environments) {
      // const oldAppProjectName = `${organization}-${project}-${internalRepoName}-${env}-project` // Support Old appproject method
      const appProjectName = `${organization}-${project}-${env}-project`
      const applicationName = `${organization}-${project}-${internalRepoName}-${env}`
      // TODO: Fix type
      // @ts-ignore See TODO
      // await deleteApplicationProject(oldAppProjectName) // Support Old appproject method
      await deleteApplication({ applicationName, repoUrl: internalUrl })
      await deleteApplicationProject({ appProjectName })
    }
    return {
      status: {
        result: 'OK',
        message: 'Deleted',
      },
    }
  } catch (error) {
    console.log({ error })
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}

export const addCluster = async (payload: HookPayload<AddEnvironmentClusterExecArgs>): Promise<PluginResult> => {
  try {
    const { project, organization, environment, cluster } = payload.args

    const appProjectName = `${organization}-${project}-${environment}-project`
    const namespace = `${organization}-${project}-${environment}`
    await addDestinationToApplicationProject(appProjectName, { namespace, name: cluster.label, server: cluster.cluster.server })
    return {
      status: {
        result: 'OK',
        message: 'Added',
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}

export const removeCluster = async (payload: HookPayload<RemoveEnvironmentClusterExecArgs>): Promise<PluginResult> => {
  try {
    const { project, organization, environment, cluster } = payload.args

    const appProjectName = `${organization}-${project}-${environment}-project`
    await removeDestinationFromApplicationProject(appProjectName, cluster.label)
    return {
      status: {
        result: 'OK',
        message: 'Deleted',
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: 'Failed',
      },
      error,
    }
  }
}
