import { faker } from '@faker-js/faker'
import { achievedStatus, projectRoles, logActions } from 'shared'
import { repeatFn } from './func-utils.js'

export const getRandomProjectName = () => {
  return faker.lorem.word()
}

export const getRandomGitUrl = () => {
  const url = faker.internet.url().split('.')[0] + '.git'
  return !url.startsWith('https://') ? 'https://' + url.split('://')[1] : url
}

export const getRandomOrganization = (name = 'mi', label = 'Ministère de l\'Intérieur', source = 'dso-console') => {
  return {
    id: faker.string.uuid(),
    name,
    label,
    source,
    active: true,
  }
}

export const getRandomProject = (organization = faker.string.uuid()) => {
  return {
    id: faker.string.uuid(),
    name: getRandomProjectName(),
    organization,
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(achievedStatus),
    locked: false,
  }
}

export const getRandomCluster = (projectsId = repeatFn(2)(faker.string.uuid)) => {
  return {
    id: faker.string.uuid(),
    label: faker.lorem.word(),
    projectsId,
    user: {
      certData: 'userCAD',
      keyData: 'userCKD',
    },
    cluster: {
      caData: 'clusterCAD',
      server: 'https://coucou.com:5000',
      tlsServerName: 'coucou.com',
    },
    privacy: faker.helpers.arrayElement(['public', 'dedicated']),
    clusterResources: faker.datatype.boolean(),
    secretName: faker.internet.password({ length: 50 }),
  }
}

export const getRandomUser = () => {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }
}

export const getRandomUserProject = (userId = faker.string.uuid(), role = projectRoles[1]) => {
  return {
    id: userId,
    role,
  }
}

export const getRandomRepo = (projectId = faker.string.uuid()) => {
  const repo = {
    id: faker.string.uuid(),
    projectId,
    internalRepoName: faker.lorem.word(),
    externalRepoUrl: getRandomGitUrl(),
    isPrivate: faker.datatype.boolean(),
    isInfra: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(achievedStatus),
  }
  if (repo.isPrivate) {
    repo.externalUserName = faker.internet.userName()
    repo.externalToken = faker.internet.password({ length: 25 })
  }

  return repo
}

export const getRandomEnv = (name = 'dev', projectId = faker.string.uuid()) => {
  return {
    id: faker.string.uuid(),
    name,
    projectId,
    status: faker.helpers.arrayElement(achievedStatus),
  }
}

export const getRandomPerm = (environmentId = faker.string.uuid(), user = getRandomUser()) => {
  return {
    id: faker.string.uuid(),
    environmentId,
    userId: user.id,
    level: faker.number.int({ min: 0, max: 1 }),
    user,
  }
}

export const getRandomLog = (action = faker.helpers.arrayElement(logActions), userId = faker.string.uuid()) => {
  return {
    id: faker.string.uuid(),
    action,
    userId,
  }
}
