import { getModel } from '../../support/func.js'

describe('Administration users', () => {
  const users = getModel('user').map(({ id, firstName, lastName, email }) => ({
    id,
    firstName,
    lastName,
    email,
    isAdmin: false,
  }))

  it('Should display admin users, loggedIn, is admin', () => {
    cy.intercept('GET', 'api/v1/admin/users').as('getAllUsers')

    cy.kcLogin('tcolin')
    cy.visit('/admin/users')
    cy.wait('@getAllUsers').its('response.statusCode').should('match', /^20\d$/)

    cy.getByDataTestid('tableAdministrationUsers').find('tbody').within(() => {
      users.forEach(user => {
        cy.get('tr > td')
          .contains(user.id)
          .click()
        cy.assertClipboard(user.id)
        cy.get('tr > td')
          .contains(user.firstName)
        cy.get('tr > td')
          .contains(user.lastName)
        cy.get('tr > td')
          .contains(user.email)
        cy.getByDataTestid(`${user.id}-is-admin`)
          .should(user.isAdmin ? 'be.checked' : 'not.be.checked')
      })
    })
  })
})
