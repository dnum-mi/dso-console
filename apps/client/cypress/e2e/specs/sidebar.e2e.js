import { getProjectbyId } from '../support/func.js'

const project = getProjectbyId('011e7860-04d7-461f-912d-334c622d38b3')

describe('Sidebar', () => {
  it('Should display Sidebar, not loggedIn', () => {
    cy.visit('/')
      .getByDataTestid('mainMenu').should('be.visible')
      .getByDataTestid('menuProjectsList').should('not.exist')
      .getByDataTestid('menuProjectsBtn').should('not.exist')
      .getByDataTestid('menuDoc').click()
      .getByDataTestid('menuProjectsBtn').should('not.exist')
      .url().should('contain', '/doc')
      .getByDataTestid('menuDoc').should('have.class', 'router-link-active')
      .getByDataTestid('menuAdministrationList').should('not.exist')
      .getByDataTestid('menuAdministrationBtn').should('not.exist')
  })
  it('Should display Sidebar, loggedIn, isNotAdmin', () => {
    cy.kcLogin('test')

    cy.visit('/')
      .getByDataTestid('mainMenu').should('be.visible')
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .getByDataTestid('menuProjectsBtn').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuMyProjects').click()
      .url().should('contain', '/projects')
      .getByDataTestid(`projectTile-${project.name}`).click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .url().should('contain', `/projects/${project.id}/services`)
      .getByDataTestid('menuDashboard').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .url().should('contain', `/projects/${project.id}/dashboard`)
      .getByDataTestid('menuTeam').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .url().should('contain', `/projects/${project.id}/team`)
      .getByDataTestid('menuRepos').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .url().should('contain', `/projects/${project.id}/repositories`)
      .getByDataTestid('menuEnvironments').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .url().should('contain', `/projects/${project.id}/environments`)
      .getByDataTestid('menuDoc').click()
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .url().should('contain', '/doc')
      .getByDataTestid('menuDoc').should('have.class', 'router-link-active')
  })

  it('Should display Sidebar, loggedIn, isAdmin', () => {
    cy.kcLogin('tcolin')

    cy.visit('/')
      .getByDataTestid('mainMenu').should('be.visible')
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')

      // Projects
      .getByDataTestid('menuProjectsBtn').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .getByDataTestid('menuMyProjects').click()
      .url().should('contain', '/projects')
      .getByDataTestid(`projectTile-${project.name}`).click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', `/projects/${project.id}/services`)
      .getByDataTestid('menuDashboard').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', `/projects/${project.id}/dashboard`)
      .getByDataTestid('menuTeam').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', `/projects/${project.id}/team`)
      .getByDataTestid('menuRepos').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', `/projects/${project.id}/repositories`)
      .getByDataTestid('menuEnvironments').click()
      .getByDataTestid('menuProjectsList').should('be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', `/projects/${project.id}/environments`)

      // Doc
      .getByDataTestid('menuDoc').click()
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')
      .url().should('contain', '/doc')
      .getByDataTestid('menuDoc').should('have.class', 'router-link-active')
      .getByDataTestid('menuAdministrationList').should('not.be.visible')

      // Admin
      .getByDataTestid('menuAdministrationBtn').click()
      .getByDataTestid('menuAdministrationList').should('be.visible')
      .getByDataTestid('menuAdministrationUsers').click()
      .getByDataTestid('menuAdministrationUsers').should('have.class', 'router-link-active')
      .getByDataTestid('menuAdministrationList').should('be.visible')
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .url().should('contain', '/admin/users')
      .getByDataTestid('menuAdministrationOrganizations').click()
      .getByDataTestid('menuAdministrationOrganizations').should('have.class', 'router-link-active')
      .getByDataTestid('menuAdministrationUsers').should('not.have.class', 'router-link-active')
      .getByDataTestid('menuAdministrationList').should('be.visible')
      .getByDataTestid('menuProjectsList').should('not.be.visible')
      .url().should('contain', '/admin/organizations')
  })
})
