import { defineStore } from 'pinia'
import type { CreateRepositoryBody, UpdateRepositoryBody, RepositoryParams, Repo } from '@cpn-console/shared'
import { useProjectStore } from '@/stores/project.js'
import { projectMissing } from '@/utils/const.js'
import { apiClient, extractData } from '@/api/xhr-client.js'

export const useProjectRepositoryStore = defineStore('project-repository', () => {
  const projectStore = useProjectStore()
  const repositories = ref<Repo[]>([])

  const getProjectRepositories = async (projectId: string) => {
    repositories.value = await apiClient.Repositories.listRepositories({ params: { projectId } })
      .then(response => extractData(response, 200))
  }

  const syncRepository = async (repositoryId: string, branchName: string) => {
    if (!projectStore.selectedProject) throw new Error(projectMissing)
    await apiClient.Repositories.syncRepository({
      params: { projectId: projectStore.selectedProject.id, repositoryId },
      body: { branchName },
    })
      .then(response => extractData(response, 204))
  }

  const addRepoToProject = async (body: CreateRepositoryBody) => {
    if (!projectStore.selectedProject) throw new Error(projectMissing)
    await apiClient.Repositories.createRepository({ body, params: { projectId: projectStore.selectedProject.id } })
      .then(response => extractData(response, 201))
    await getProjectRepositories(projectStore.selectedProject.id)
  }

  const updateRepo = async (body: UpdateRepositoryBody & { id: RepositoryParams['repositoryId'] }) => {
    if (!projectStore.selectedProject) throw new Error(projectMissing)
    await apiClient.Repositories.updateRepository({ body, params: { projectId: projectStore.selectedProject.id, repositoryId: body.id } })
      .then(response => extractData(response, 200))
    await getProjectRepositories(projectStore.selectedProject.id)
  }

  const deleteRepo = async (repositoryId: string) => {
    if (!projectStore.selectedProject) throw new Error(projectMissing)
    await apiClient.Repositories.deleteRepository({ params: { projectId: projectStore.selectedProject.id, repositoryId } })
      .then(response => extractData(response, 204))
    await getProjectRepositories(projectStore.selectedProject.id)
  }

  return {
    repositories,
    getProjectRepositories,
    addRepoToProject,
    updateRepo,
    deleteRepo,
    syncRepository,
  }
})
