// import { Sequelize } from 'sequelize'
import { PrismaClient } from '@prisma/client'
import { setTimeout } from 'node:timers/promises'
import app from './app.js'
import {
  isTest,
  isCI,
  isDev,
  dbHost,
  dbPort,
  dbUser,
  dbName,
  dbPass,
} from './utils/env.js'
import { getOrganizationModel } from './models/organization.js'
import { getUserModel } from './models/user.js'
import { getProjectModel } from './models/project.js'
import { getEnvironmentModel } from './models/environment.js'
import { getPermissionModel } from './models/permission.js'
import { getRepositoryModel } from './models/repository.js'
import { getUsersProjectsModel } from './models/users-projects.js'
import { _dropPermissionsTable } from './models/queries/permission-queries.js'
import { _dropEnvironmentsTable } from './models/queries/environment-queries.js'
import { _dropRepositoriesTable } from './models/queries/repository-queries.js'
import { _dropProjectsTable } from './models/queries/project-queries.js'
import { _dropUsersTable } from './models/queries/user-queries.js'
import { _dropOrganizationsTable } from './models/queries/organization-queries.js'
import { _dropUsersProjectsTable } from './models/queries/users-projects-queries.js'
import { getLogModel } from './models/log.js'
import { _dropLogsTable } from './models/queries/log-queries.js'

const DELAY_BEFORE_RETRY = isTest || isCI ? 1000 : 10000
let closingConnections = false

// export let sequelize
export let prisma

export const getConnection = async (triesLeft = 5) => {
  if (closingConnections || triesLeft <= 0) {
    throw new Error('Unable to connect to Postgres server')
  }
  triesLeft--

  const postgresUri = `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`

  // if (isTest) {
  //   const { default: SequelizeMock } = await import('sequelize-mock')
  //   sequelize = new SequelizeMock()
  //   return
  // }
  try {
    if (isDev || isTest || isCI) {
      app.log.info(`Trying to connect to Postgres with: ${postgresUri}`)
    }

    prisma = new PrismaClient()
    await prisma.$connect()

    // sequelize = new Sequelize(postgresUri, { logging: false })
    // await sequelize.authenticate()
    app.log.info('Connected to Postgres!')
  } catch (error) {
    if (triesLeft > 0) {
      app.log.info(`Could not connect to Postgres: ${error.message}`)
      app.log.info(`Retrying (${triesLeft} tries left)`)
      await setTimeout(DELAY_BEFORE_RETRY)
      return getConnection(triesLeft)
    }

    app.log.info(`Could not connect to Postgres: ${error.message}`)
    app.log.info('Out of retries')
    error.message = `Out of retries, last error: ${error.message}`
    throw error
  }
}

export const closeConnections = async () => {
  closingConnections = true
  try {
    await prisma.$disconnect()

    // await sequelize.close()
  } catch (error) {
    app.log.error(error)
    await prisma.$disconnect()
  }
}

export const dropTables = async () => {
  try {
    await _dropLogsTable()
    await _dropRepositoriesTable()
    await _dropPermissionsTable()
    await _dropEnvironmentsTable()
    await _dropProjectsTable()
    await _dropUsersTable()
    await _dropUsersProjectsTable()
    await _dropOrganizationsTable()

    app.log.info('All tables were droped successfully.')
  } catch (error) {
    app.log.error('Drop database tables failed.')
  }
}

export const synchroniseModels = async () => {
  try {
    const logModel = await getLogModel()
    const organizationModel = await getOrganizationModel()
    const userModel = await getUserModel()
    const projectModel = await getProjectModel()
    const environmentModel = await getEnvironmentModel()
    const permissionModel = await getPermissionModel()
    const repositoryModel = await getRepositoryModel()
    const usersProjectsModel = await getUsersProjectsModel()

    logModel.belongsTo(userModel, { foreignKey: 'userId' })

    organizationModel.hasMany(projectModel, { foreignKey: 'organization' })
    projectModel.belongsTo(organizationModel, { foreignKey: 'organization' })

    userModel.belongsToMany(projectModel, { through: usersProjectsModel, uniqueKey: false })
    projectModel.belongsToMany(userModel, { through: usersProjectsModel })

    userModel.hasMany(permissionModel, { foreignKey: 'userId' })
    permissionModel.belongsTo(userModel, { foreignKey: 'userId' })

    projectModel.hasMany(repositoryModel, { foreignKey: 'projectId' })
    repositoryModel.belongsTo(projectModel, { foreignKey: 'projectId' })

    projectModel.hasMany(environmentModel, { foreignKey: 'projectId' })
    environmentModel.belongsTo(projectModel, { foreignKey: 'projectId' })

    environmentModel.hasMany(permissionModel, { foreignKey: 'environmentId' })
    permissionModel.belongsTo(environmentModel, { foreignKey: 'environmentId' })

    await organizationModel.sync({ alter: true, logging: false })
    await userModel.sync({ alter: true, logging: false })
    await projectModel.sync({ alter: true, logging: false })
    await usersProjectsModel.sync({ alter: true, logging: false })
    await environmentModel.sync({ alter: true, logging: false })
    await permissionModel.sync({ alter: true, logging: false })
    await repositoryModel.sync({ alter: true, logging: false })
    await logModel.sync({ alter: true })

    app.log.info('All models were synchronized successfully.')
  } catch (error) {
    app.log.error({
      message: 'Models synchronisation with database failed.',
      error: {
        message: error?.message,
        trace: error?.trace,
      },
    })
  }
}
