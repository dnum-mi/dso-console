import { getModel, getModelById } from '../../support/func.js'

describe('Administration quotas', () => {
  const project = getModelById('project', '22e7044f-8414-435d-9c4a-2df42a65034b')
  let quota1 = getModelById('quota', '08770663-3b76-4af6-8978-9f75eda4faa7')
  let quota2 = getModelById('quota', '5a57b62f-2465-4fb6-a853-5a751d099199')
  const allStages = getModel('stage')
  const publicQuota = {
    name: 'publicQuota',
    memory: '5Gi',
    cpu: '1',
    stages: [allStages.find(stage => stage.id === '38fa869d-6267-441d-af7f-e0548fd06b7e')],
  }
  const privateQuota = {
    name: 'privateQuota',
    memory: '20Gi',
    cpu: '5',
    stages: [allStages.find(stage => stage.id === '38fa869d-6267-441d-af7f-e0548fd06b7e')],
  }

  let allQuotas

  beforeEach(() => {
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', '/api/v1/stages').as('listStages')

    cy.kcLogin('tcolin')
    cy.visit('/admin/quotas')
    cy.url().should('contain', '/admin/quotas')
    cy.wait('@listQuotas', { timeout: 5_000 }).its('response').then((response) => {
      allQuotas = response?.body
      quota1 = allQuotas.find(quota => quota.id === quota1.id)
      quota2 = allQuotas.find(quota => quota.id === quota2.id)
    })
    cy.wait('@listStages', { timeout: 5_000 })
  })

  it('Should display quotas list', () => {
    allQuotas?.forEach((quota) => {
      cy.getByDataTestid(`quotaTile-${quota.name}`)
        .should('be.visible')
    })
  })

  it('Should create a public quota', () => {
    cy.intercept('POST', '/api/v1/quotas').as('createQuota')
    cy.intercept('GET', 'api/v1/clusters').as('getClusters')
    cy.intercept('GET', 'api/v1/stages').as('listStages')
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', '/api/v1/projects?filter=member&statusNotIn=archived').as('listProjects')
    cy.intercept('GET', '/api/v1/environments?*').as('listEnvironments')

    // Create quota
    cy.getByDataTestid('addQuotaLink')
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', 'Informations du quota')
    cy.getByDataTestid('addQuotaBtn').should('be.visible').and('be.disabled')
    cy.getByDataTestid('updateQuotaBtn').should('not.exist')
    cy.getByDataTestid('nameInput')
      .type(publicQuota.name)
    cy.getByDataTestid('memoryInput')
      .type(publicQuota.memory)
    cy.getByDataTestid('cpuInput')
      .clear()
      .type(publicQuota.cpu)
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('not.be.checked')
      .and('be.enabled')
    cy.getByDataTestid('addQuotaBtn').should('be.enabled')

    cy.get('#stages-select')
      .click()
    publicQuota.stages.forEach((stage) => {
      cy.getByDataTestid(`${stage.id}-stages-select-tag`)
        .click()
    })
    cy.get('#stages-select .fr-tag--dismiss')
      .should('have.length', publicQuota.stages.length)
    cy.getByDataTestid('addQuotaBtn')
      .click()
    cy.wait('@createQuota').its('response').then(($response) => {
      expect($response?.statusCode).to.match(/^20\d$/)
    })
    cy.getByDataTestid('nameInput')
      .should('not.exist')

    // Check quota creation
    cy.reload()
      .wait('@listStages')
    cy.getByDataTestid(`quotaTile-${publicQuota.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du quota ${publicQuota.name}`)
    cy.getByDataTestid('addQuotaBtn').should('not.exist')
    cy.getByDataTestid('updateQuotaBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', publicQuota.name)
      .and('be.disabled')
    cy.getByDataTestid('memoryInput')
      .should('have.value', publicQuota.memory)
      .and('be.disabled')
    cy.getByDataTestid('cpuInput')
      .should('have.value', publicQuota.cpu)
      .and('be.disabled')
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('not.be.checked')
      .and('be.enabled')
    cy.getByDataTestid('updateQuotaBtn').should('be.enabled')
    publicQuota.stages.forEach((stage) => {
      cy.getByDataTestid(`${stage.id}-stages-select-tag`)
        .should('exist')
    })

    // Check quota availability for non admin user on environment form
    cy.kcLogin('test')
    cy.goToProjects()
      .wait('@listProjects')
      .getByDataTestid(`projectTile-${project?.name}`).click()
      .getByDataTestid('menuEnvironments').click()
    cy.wait('@getClusters')
    cy.url().should('contain', '/environments')
    cy.getByDataTestid('addEnvironmentLink').click()
    cy.wait('@listStages')
    cy.wait('@listQuotas')
    cy.get('h1').should('contain', 'Ajouter un environnement au projet')
    cy.get('#zone-select')
      .select(2)
    cy.get('#stage-select')
      .select(publicQuota.stages[0].name)
    cy.get('#quota-select')
      .find('option').contains(publicQuota.name)
      .should('exist')
    cy.get('#stage-select')
      .select(allStages.find(stage => !publicQuota.stages.find(pqStage => pqStage.id === stage.id))?.name)
    cy.get('#quota-select')
      .find('option').contains(publicQuota.name)
      .should('not.exist')
    cy.get('#stage-select')
      .select(allStages.find(stage => publicQuota.stages.find(pqStage => pqStage.id === stage.id))?.name)
    cy.get('#quota-select')
      .find('option').contains(publicQuota.name)
      .should('exist')

    // Check quota availability for admin user on project list
    cy.intercept('GET', 'api/v1/projects*').as('getAllProjects')
    cy.kcLogin('tcolin')
    cy.visit('/admin/projects')
    cy.wait('@getAllProjects')
    cy.url().should('contain', '/admin/projects')
    cy.getByDataTestid('tableAdministrationProjects').within(() => {
      cy.get('tr').contains(project.name)
        .click()
    })

    const environments = []
    cy.wait('@listEnvironments').its('response').then((response) => {
      environments.push(response.body)
    })
    cy.get('#environmentsTable').within(() => {
      cy.get('#quota-select:first')
        .find('option')
        .contains(publicQuota.name)
        .should('not.exist')
      cy.get('#quota-select:nth-of-type(1)')
        .find('option')
        .contains(publicQuota.name)
        .should('exist')
    })
  })

  it('Should not be able to create a quota with an already taken name', () => {
    cy.intercept('POST', '/api/v1/quotas').as('createQuota')

    cy.getByDataTestid('addQuotaLink')
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', 'Informations du quota')
    cy.getByDataTestid('addQuotaBtn').should('be.visible').and('be.disabled')
    cy.getByDataTestid('updateQuotaBtn').should('not.exist')
    cy.getByDataTestid('nameInput')
      .type(publicQuota.name)
    cy.getByDataTestid('memoryInput')
      .type(publicQuota.memory)
    cy.getByDataTestid('cpuInput')
      .clear()
      .type(publicQuota.cpu)
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('not.be.checked')
      .and('be.enabled')
    cy.getByDataTestid('addQuotaBtn').should('be.enabled')
    cy.get('[data-testid$="stages-select-tag"]')
      .should('not.exist')
    cy.get('#stages-select')
      .click()
    publicQuota.stages.forEach((stage) => {
      cy.getByDataTestid(`${stage.id}-stages-select-tag`)
        .click()
    })
    cy.get('#stages-select .fr-tag--dismiss')
      .should('have.length', publicQuota.stages.length)
    cy.getByDataTestid('addQuotaBtn')
      .click()
    cy.wait('@createQuota').its('response').then(($response) => {
      expect($response?.statusCode).to.not.match(/^20\d$/)
    })
    cy.getByDataTestid('snackbar').within(() => {
      cy.get('p').should('contain', 'Un quota portant ce nom existe déjà')
    })
  })

  it('Should create a private quota', () => {
    cy.intercept('POST', '/api/v1/quotas').as('createQuota')
    cy.intercept('GET', 'api/v1/clusters').as('getClusters')
    cy.intercept('GET', 'api/v1/stages').as('listStages')
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', '/api/v1/projects?filter=member&statusNotIn=archived').as('listProjects')
    cy.intercept('GET', '/api/v1/environments?*').as('listEnvironments')

    // Create quota
    cy.getByDataTestid('addQuotaLink')
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', 'Informations du quota')
    cy.getByDataTestid('addQuotaBtn').should('be.visible').and('be.disabled')
    cy.getByDataTestid('updateQuotaBtn').should('not.exist')
    cy.getByDataTestid('nameInput')
      .type(privateQuota.name)
    cy.getByDataTestid('memoryInput')
      .type(privateQuota.memory)
    cy.getByDataTestid('cpuInput')
      .clear()
      .type(privateQuota.cpu)
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('not.be.checked')
      .and('be.enabled')
      .check({ force: true })
    cy.getByDataTestid('addQuotaBtn').should('be.enabled')
    cy.get('#stages-select')
      .click()
    privateQuota.stages.forEach((stage) => {
      cy.getByDataTestid(`${stage.id}-stages-select-tag`)
        .click()
    })
    cy.get('#stages-select .fr-tag--dismiss')
      .should('have.length', privateQuota.stages.length)
    cy.getByDataTestid('addQuotaBtn')
      .click()
    cy.wait('@createQuota').its('response').then(($response) => {
      expect($response?.statusCode).to.match(/^20\d$/)
    })
    cy.getByDataTestid('nameInput')
      .should('not.exist')

    // Check quota creation
    cy.reload()
      .wait('@listStages')
    cy.getByDataTestid(`quotaTile-${privateQuota.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du quota ${privateQuota.name}`)
    cy.getByDataTestid('addQuotaBtn').should('not.exist')
    cy.getByDataTestid('updateQuotaBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', privateQuota.name)
      .and('be.disabled')
    cy.getByDataTestid('memoryInput')
      .should('have.value', privateQuota.memory)
      .and('be.disabled')
    cy.getByDataTestid('cpuInput')
      .should('have.value', privateQuota.cpu)
      .and('be.disabled')
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('be.checked')
      .and('be.enabled')
    cy.getByDataTestid('updateQuotaBtn').should('be.enabled')
    privateQuota.stages.forEach((stage) => {
      cy.getByDataTestid(`${stage.id}-stages-select-tag`)
        .should('exist')
    })

    // Check quota unavailability for non admin user on environment form
    cy.kcLogin('test')
    cy.goToProjects()
      .wait('@listProjects')
      .getByDataTestid(`projectTile-${project?.name}`).click()
      .getByDataTestid('menuEnvironments').click()
      .url().should('contain', '/environments')
    cy.wait('@getClusters')
    cy.getByDataTestid('addEnvironmentLink').click()
    cy.wait('@listStages')
    cy.wait('@listQuotas')
    cy.get('h1').should('contain', 'Ajouter un environnement au projet')
    cy.get('#zone-select')
      .select(2)
    cy.get('#stage-select')
      .select(privateQuota.stages[0].name)
    cy.get('#quota-select')
      .find('option').contains(privateQuota.name)
      .should('not.exist')

    // Check quota availability for admin user on project list
    cy.intercept('GET', 'api/v1/projects*').as('getAllProjects')
    cy.kcLogin('tcolin')
    cy.visit('/admin/projects')
    cy.wait('@getAllProjects')
    cy.url().should('contain', '/admin/projects')
    cy.getByDataTestid('tableAdministrationProjects').within(() => {
      cy.get('tr').contains(project.name)
        .click()
    })

    const environments = []
    cy.wait('@listEnvironments').its('response').then((response) => {
      environments.push(response.body)
    })

    cy.get('#environmentsTable').within(() => {
      cy.get('#quota-select:first')
        .find('option')
        .contains(privateQuota.name)
        .should('not.exist')
      cy.get('#quota-select:nth-of-type(1)')
        .find('option')
        .contains(privateQuota.name)
        .should('exist')
    })
  })

  it('Should update a quota', () => {
    const newStage = allStages?.find(stage => !publicQuota.stages?.find(pqStage => pqStage.id === stage.id))

    cy.intercept('PUT', '/api/v1/quotas/*').as('updateQuota')
    cy.intercept('GET', 'api/v1/clusters').as('getClusters')
    cy.intercept('GET', 'api/v1/stages').as('listStages')
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', '/api/v1/projects?filter=member&statusNotIn=archived').as('listProjects')

    cy.getByDataTestid(`quotaTile-${publicQuota.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du quota ${publicQuota.name}`)
    cy.getByDataTestid('addQuotaBtn').should('not.exist')
    cy.getByDataTestid('updateQuotaBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', publicQuota.name)
      .and('be.disabled')
    cy.getByDataTestid('memoryInput')
      .should('have.value', publicQuota.memory)
      .and('be.disabled')
    cy.getByDataTestid('cpuInput')
      .should('have.value', publicQuota.cpu)
      .and('be.disabled')
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('not.be.checked')
      .and('be.enabled')
      .check({ force: true })
    cy.getByDataTestid('updateQuotaBtn').should('be.enabled')
    cy.get('#stages-select')
      .click()
    cy.get('#stages-select .fr-tag--dismiss')
      .should('have.length', publicQuota.stages.length)
    cy.getByDataTestid(`${newStage.id}-stages-select-tag`)
      .click()
    cy.getByDataTestid(`${publicQuota.stages[0].id}-stages-select-tag`)
      .click()
    cy.getByDataTestid('updateQuotaBtn')
      .click()
    cy.wait('@updateQuota').its('response').then(($response) => {
      expect($response?.statusCode).to.match(/^20\d$/)
    })

    // Check quota update
    cy.reload()
      .wait('@listStages')
    cy.getByDataTestid(`quotaTile-${publicQuota.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du quota ${publicQuota.name}`)
    cy.getByDataTestid('addQuotaBtn').should('not.exist')
    cy.getByDataTestid('updateQuotaBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', publicQuota.name)
      .and('be.disabled')
    cy.getByDataTestid('memoryInput')
      .should('have.value', publicQuota.memory)
      .and('be.disabled')
    cy.getByDataTestid('cpuInput')
      .should('have.value', publicQuota.cpu)
      .and('be.disabled')
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should('be.checked')
      .and('be.enabled')
    cy.getByDataTestid('updateQuotaBtn').should('be.enabled')
    cy.getByDataTestid(`${publicQuota.stages[0].id}-stages-select-tag`)
      .should('not.exist')
    cy.getByDataTestid(`${newStage.id}-stages-select-tag`)
      .should('exist')

    // Check quota unavailability for non admin user on environment form
    cy.kcLogin('test')
    cy.goToProjects()
      .wait('@listProjects')
      .getByDataTestid(`projectTile-${project?.name}`).click()
      .getByDataTestid('menuEnvironments').click()
      .url().should('contain', '/environments')
    cy.wait('@getClusters')
    cy.getByDataTestid('addEnvironmentLink').click()
    cy.wait('@listStages')
    cy.wait('@listQuotas')
    cy.get('h1').should('contain', 'Ajouter un environnement au projet')
    cy.get('#zone-select')
      .select(2)
    cy.get('#stage-select')
      .select(newStage.name)
    cy.get('#quota-select')
      .find('option').contains(publicQuota.name)
      .should('not.exist')
  })

  it('Should display a non-deletable quota form', () => {
    cy.getByDataTestid(`quotaTile-${quota2.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du quota ${quota2.name}`)
    cy.getByDataTestid('addQuotaBtn').should('not.exist')
    cy.getByDataTestid('updateQuotaBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', quota2.name)
      .and('be.disabled')
    cy.getByDataTestid('memoryInput')
      .should('have.value', quota2.memory)
      .and('be.disabled')
    cy.getByDataTestid('cpuInput')
      .should('have.value', quota2.cpu)
      .and('be.disabled')
    cy.getByDataTestid('input-checkbox-isQuotaPrivateCbx')
      .should(quota2.isPrivate ? 'be.checked' : 'not.be.checked')
      .and('be.enabled')
    cy.getByDataTestid('updateQuotaBtn').should('be.enabled')
    cy.get('#stages-select')
      .click()
    cy.get('#stages-select .fr-tag--dismiss')
      .should('have.length', quota2.stageIds.length)
    cy.getByDataTestid('deleteQuotaZone').should('not.exist')
    cy.getByDataTestid('associatedEnvironmentsZone').should('exist')
    cy.getByDataTestid('associatedEnvironmentsTable').should('exist')
  })

  it('Should delete a public quota', () => {
    cy.getByDataTestid(`quotaTile-${publicQuota.name}`)
      .should('be.visible')
      .click()
    cy.getByDataTestid('associatedEnvironmentsZone').should('not.exist')
    cy.getByDataTestid('deleteQuotaZone').should('exist')
    cy.getByDataTestid('showDeleteQuotaBtn').click()
    cy.getByDataTestid('deleteQuotaInput')
      .clear()
      .type(publicQuota.name)
    cy.getByDataTestid('deleteQuotaBtn')
      .click()
    cy.reload()
    cy.getByDataTestid(`quotaTile-${publicQuota.name}`)
      .should('not.exist')
  })
  it('Should delete a private quota', () => {
    cy.getByDataTestid(`quotaTile-${privateQuota.name}`)
      .should('be.visible')
      .click()
    cy.getByDataTestid('associatedEnvironmentsZone').should('not.exist')
    cy.getByDataTestid('deleteQuotaZone').should('exist')
    cy.getByDataTestid('showDeleteQuotaBtn').click()
    cy.getByDataTestid('deleteQuotaInput')
      .clear()
      .type(privateQuota.name)
    cy.getByDataTestid('deleteQuotaBtn')
      .click()
    cy.reload()
    cy.getByDataTestid(`quotaTile-${privateQuota.name}`)
      .should('not.exist')
  })
})
