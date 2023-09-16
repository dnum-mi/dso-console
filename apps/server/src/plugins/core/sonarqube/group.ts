import type { CreateProjectExecArgs } from '@/plugins/hooks/index.js'
import type { StepCall } from '@/plugins/hooks/hook.js'
import { axiosInstance } from './index.js'
import { SonarGroup } from './lib/types.js'

export const createDsoProjectGroup: StepCall<CreateProjectExecArgs> = async (payload) => {
  const { project, organization } = payload.args
  const groupName = `/${organization}-${project}`

  try {
    const group = await findGroupByName(groupName)
    if (!group) {
      await createGroup(groupName)
    }
    return {
      ...payload.sonarqube,
      status: {
        result: 'OK',
        message: `User ${group ? '' : 're'}created`,
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: error.message,
      },
      error: JSON.stringify(error),
    }
  }
}

export const createGroup = (groupName: string) => axiosInstance({
  url: 'user_groups/create',
  method: 'post',
  params: {
    name: groupName,
  },
})

export const deleteteDsoProjectGroup: StepCall<CreateProjectExecArgs> = async (payload) => {
  const { project, organization } = payload.args
  const groupName = `/${organization}-${project}`
  let message: string
  try {
    const groupsSearch = (await axiosInstance({
      url: 'user_groups/search',
      params: {
        q: groupName,
      },
    }))?.data
    const group = groupsSearch.groups.find(g => g.name === groupName)
    if (group) {
      await axiosInstance({
        url: 'user_groups/delete',
        method: 'post',
        params: {
          name: groupName,
        },
      })
      message = 'Group deleted'
    } else message = 'Group already missing'
    return {
      ...payload.sonarqube,
      status: {
        result: 'OK',
        message,
      },
    }
  } catch (error) {
    return {
      status: {
        result: 'KO',
        message: error.message,
      },
      error: JSON.stringify(error),
    }
  }
}

export const findGroupByName = async (name: string): Promise<void | SonarGroup> => {
  const groupsSearch = (await axiosInstance({
    url: 'user_groups/search',
    params: {
      q: name,
    },
  }))?.data
  return groupsSearch.groups.find(g => g.name === name)
}
