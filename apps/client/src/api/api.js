import { apiClient } from './xhr-client.js'

// CIFiles
export const generateCIFiles = async (data) => {
  const response = await apiClient.post('/ci-files', data)
  return response.data
}

// Organizations
export const getOrganizations = async () => {
  const response = await apiClient.get('/organizations')
  return response.data
}

// Project
export const createProject = async (data) => {
  const response = await apiClient.post('/projects', data)
  return response.data
}

export const getUserProjects = async () => {
  const response = await apiClient.get('/projects')
  return response.data
}

export const getUserProjectById = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}`)
  return response.data
}

export const getProjectOwner = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/owner`)
  return response.data
}

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(`/projects/${projectId}`)
  return response.data
}

// Repositories
export const addRepo = async (projectId, data) => {
  const response = await apiClient.post(`/projects/${projectId}/repositories`, data)
  return response.data
}

export const getRepos = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/repositories`)
  return response.data
}

export const updateRepo = async (projectId, data) => {
  const response = await apiClient.put(`/projects/${projectId}/repositories/:${data.id}`, data)
  return response.data
}

export const deleteRepo = async (projectId, repoId) => {
  const response = await apiClient.delete(`/projects/${projectId}/repositories/:${repoId}`)
  return response.data
}

// Users
export const addUser = async (projectId, data) => {
  const response = await apiClient.post(`/projects/${projectId}/users`, data)
  return response.data
}

export const updateUser = async (projectId, data) => {
  const response = await apiClient.put(`/projects/${projectId}/users/${data.id}`, data)
  return response.data
}

export const getUsers = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/users`)
  return response.data
}

export const removeUser = async (projectId, userId) => {
  const response = await apiClient.delete(`/projects/${projectId}/users/${userId}`)
  return response.data
}

// Environnements
export const addEnvironment = async (projectId, data) => {
  const response = await apiClient.post(`/projects/${projectId}/environments`, data)
  return response.data
}

export const deleteEnvironment = async (projectId, environmentId) => {
  const response = await apiClient.delete(`/projects/${projectId}/environments/${environmentId}`)
  return response.data
}

// Permissions
export const addPermission = async (projectId, environmentId, data) => {
  const response = await apiClient.post(`/projects/${projectId}/environments/${environmentId}/permissions`, data)
  return response.data
}

export const updatePermission = async (projectId, environmentId, data) => {
  const response = await apiClient.put(`/projects/${projectId}/environments/${environmentId}/permissions`, data)
  return response.data
}

export const getPermissions = async (projectId, environmentId) => {
  const response = await apiClient.get(`/projects/${projectId}/environments/${environmentId}/permissions`)
  return response.data
}

export const deletePermission = async (projectId, environmentId, userId) => {
  const response = await apiClient.delete(`/projects/${projectId}/environments/${environmentId}/permissions/${userId}`)
  return response.data
}
