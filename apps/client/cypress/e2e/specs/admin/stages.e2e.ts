import { getModel, getModelById } from '../../support/func.js'

describe('Administration stages', () => {
  const project = getModelById('project', '22e7044f-8414-435d-9c4a-2df42a65034b')
  let stage1 = getModelById('stage', '4a9ad694-4c54-4a3c-9579-548bf4b7b1b9')
  const allQuotas = getModel('quota')
  const allClusters = getModel('cluster')
  const stage = {
    name: 'dev1',
    quotas: [allQuotas.find(quota => quota.id === '5a57b62f-2465-4fb6-a853-5a751d099199')],
    clusters: [allClusters.find(cluster => cluster.id === 'aaaaaaaa-5b03-45d5-847b-149dec875680')],
  }

  let allStages

  beforeEach(() => {
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', '/api/v1/stages').as('listStages')
    cy.intercept('GET', '/api/v1/clusters').as('getClusters')

    cy.kcLogin('tcolin')
    cy.visit('/admin/stages')
    cy.url().should('contain', '/admin/stages')
    cy.wait('@listStages').its('response').then((response) => {
      allStages = response?.body
      stage1 = allStages.find(quota => quota.id === stage1.id)
    })
    cy.wait('@listQuotas')
    cy.wait('@getClusters')
  })

  it('Should display stages list', () => {
    allStages?.forEach((stage) => {
      cy.getByDataTestid(`stageTile-${stage.name}`)
        .should('be.visible')
    })
  })

  it('Should create a stage', () => {
    cy.intercept('POST', '/api/v1/stages').as('createStage')
    cy.intercept('GET', 'api/v1/stages').as('listStages')
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', 'api/v1/clusters').as('getClusters')
    cy.intercept('GET', '/api/v1/projects?filter=member&statusNotIn=archived').as('listProjects')

    // Create stage
    cy.getByDataTestid('addStageLink')
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', 'Informations du type d\'environnement')
    cy.getByDataTestid('addStageBtn').should('be.visible').and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('not.exist')
    cy.getByDataTestid('nameInput')
      .type(stage.name)
    cy.getByDataTestid('addStageBtn').should('be.enabled')
    cy.get('[data-testid$="quotas-select-tag"]')
      .should('not.have.class', 'fr-tag--dismiss')
    stage.quotas.forEach((quota) => {
      cy.getByDataTestid(`${quota.id}-quotas-select-tag`)
        .click()
    })
    cy.get('#quotas-select .fr-tag--dismiss')
      .should('have.length', stage.quotas.length)
    cy.get('[data-testid$="clusters-select-tag"]')
      .should('not.have.class', 'fr-tag--dismiss')
    stage.clusters.forEach((cluster) => {
      cy.getByDataTestid(`${cluster.id}-clusters-select-tag`)
        .click()
    })
    cy.get('#clusters-select .fr-tag--dismiss')
      .should('have.length', stage.clusters.length)
    cy.getByDataTestid('addStageBtn')
      .click()
    cy.wait('@createStage').its('response').then(($response) => {
      expect($response?.statusCode).to.match(/^20\d$/)
    })
    cy.getByDataTestid('nameInput')
      .should('not.exist')

    // Check stage creation
    cy.reload()
      .wait('@listStages')
    cy.getByDataTestid(`stageTile-${stage.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du type d'environnement ${stage.name}`)
    cy.getByDataTestid('addStageBtn').should('not.exist')
    cy.getByDataTestid('updateStageBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', stage.name)
      .and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('be.enabled')
    stage.quotas.forEach((quota) => {
      cy.getByDataTestid(`${quota.id}-quotas-select-tag`)
        .should('exist')
    })
    cy.get('#clusters-select')
      .click()
    stage.clusters.forEach((cluster) => {
      cy.getByDataTestid(`${cluster.id}-clusters-select-tag`)
        .should('have.class', 'fr-tag--dismiss')
    })

    // Check stage availability on environment form
    cy.kcLogin('test')
    cy.goToProjects()
      .wait('@listProjects')
      .getByDataTestid(`projectTile-${project?.slug}`).click()
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
      .find('option').contains(stage.name)
      .should('exist')
    cy.get('#stage-select')
      .select(stage.name)
    cy.get('#quota-select')
      .find('option')
      .should('have.length', stage.quotas.length + 1)
      .and('contain', stage.quotas[0].name)
    cy.get('#cluster-select')
      .find('option')
      .should('have.length', stage.clusters.length + 1)
      .and('contain', stage.clusters[0].label)
  })

  it('Should not be able to create a stage with an already taken name', () => {
    cy.intercept('POST', '/api/v1/stages').as('createStage')

    cy.getByDataTestid('addStageLink')
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', 'Informations du type d\'environnement')
    cy.getByDataTestid('addStageBtn').should('be.visible').and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('not.exist')
    cy.getByDataTestid('nameInput')
      .type(stage.name)
    cy.getByDataTestid('addStageBtn')
      .should('be.enabled')
      .click()
    cy.wait('@createStage').its('response').then(($response) => {
      expect($response?.statusCode).to.not.match(/^20\d$/)
    })
    cy.getByDataTestid('snackbar').should('contain', 'Un type d\'environnement portant ce nom existe déjà')
  })

  it('Should update a stage', () => {
    const newQuota = allQuotas?.find(quota => !stage.quotas?.find(stQuota => stQuota.id === quota.id))
    const newCluster = allClusters?.find(cluster => cluster.privacy === 'public' && !stage.clusters?.find(stCluster => stCluster.id === cluster.id))

    cy.intercept('PUT', '/api/v1/stages/*').as('updateStage')
    cy.intercept('GET', 'api/v1/clusters').as('getClusters')
    cy.intercept('GET', 'api/v1/quotas').as('listQuotas')
    cy.intercept('GET', 'api/v1/stages').as('listStages')
    cy.intercept('GET', '/api/v1/projects?filter=member&statusNotIn=archived').as('listProjects')

    cy.getByDataTestid(`stageTile-${stage.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du type d'environnement ${stage.name}`)
    cy.getByDataTestid('addStageBtn').should('not.exist')
    cy.getByDataTestid('updateStageBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', stage.name)
      .and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('be.enabled')
    cy.get('#quotas-select')
      .click()
    cy.get('#quotas-select .fr-tag--dismiss')
      .should('have.length', stage.quotas.length)
    cy.getByDataTestid(`${newQuota.id}-quotas-select-tag`)
      .click()
    cy.getByDataTestid(`${stage.quotas[0].id}-quotas-select-tag`)
      .click()
    cy.get('#clusters-select .fr-tag--dismiss')
      .should('have.length', stage.clusters.length)
    cy.getByDataTestid(`${newCluster.id}-clusters-select-tag`)
      .click()
    cy.getByDataTestid(`${stage.clusters[0].id}-clusters-select-tag`)
      .click()
    cy.getByDataTestid('updateStageBtn')
      .click()
    cy.wait('@updateStage').its('response').then(($response) => {
      expect($response?.statusCode).to.match(/^20\d$/)
    })

    // Check stage update
    cy.reload()
      .wait('@listStages')
    cy.getByDataTestid(`stageTile-${stage.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du type d'environnement ${stage.name}`)
    cy.getByDataTestid('addStageBtn').should('not.exist')
    cy.getByDataTestid('updateStageBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', stage.name)
      .and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('be.enabled')
    cy.getByDataTestid(`${stage.quotas[0].id}-quotas-select-tag`)
      .should('not.have.class', 'fr-tag--dismiss')
    cy.getByDataTestid(`${newQuota.id}-quotas-select-tag`)
      .should('have.class', 'fr-tag--dismiss')
    cy.getByDataTestid(`${stage.clusters[0].id}-clusters-select-tag`)
      .should('not.have.class', 'fr-tag--dismiss')
    cy.getByDataTestid(`${newCluster.id}-clusters-select-tag`)
      .should('have.class', 'fr-tag--dismiss')

    // Check stage availability on environment form
    cy.kcLogin('test')
    cy.goToProjects()
      .wait('@listProjects')
      .getByDataTestid(`projectTile-${project?.slug}`).click()
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
      .select(stage.name)
    cy.get('#quota-select')
      .find('option').contains(stage.quotas[0].name)
      .should('not.exist')
    cy.get('#quota-select')
      .find('option').contains(newQuota.name)
      .should('exist')
    cy.get('#cluster-select')
      .find('option').contains(stage.clusters[0].label)
      .should('not.exist')
    cy.get('#cluster-select')
      .find('option').contains(newCluster.label)
      .should('exist')
  })

  it('Should display a non-deletable quota form', () => {
    cy.getByDataTestid(`stageTile-${stage1.name}`)
      .should('be.visible')
      .click()
    cy.get('h1').invoke('text').should('contain', `Informations du type d'environnement ${stage1.name}`)
    cy.getByDataTestid('addStageBtn').should('not.exist')
    cy.getByDataTestid('updateStageBtn').should('be.visible').and('be.enabled')
    cy.getByDataTestid('nameInput')
      .should('have.value', stage1.name)
      .and('be.disabled')
    cy.getByDataTestid('updateStageBtn').should('be.enabled')
    cy.get('#quotas-select')
      .click()
    cy.get('#quotas-select .fr-tag--dismiss')
      .should('have.length', stage1.quotaIds.length)
    cy.getByDataTestid('deleteStageZone').should('not.exist')
    cy.getByDataTestid('associatedEnvironmentsZone').should('exist')
    cy.getByDataTestid('associatedEnvironmentsTable').should('exist')
  })

  it('Should delete a quota', () => {
    cy.getByDataTestid(`stageTile-${stage.name}`)
      .should('be.visible')
      .click()
    cy.getByDataTestid('associatedEnvironmentsZone').should('not.exist')
    cy.getByDataTestid('deleteStageZone').should('exist')
    cy.getByDataTestid('showDeleteStageBtn').click()
    cy.getByDataTestid('deleteStageInput')
      .clear()
      .type(stage.name)
    cy.getByDataTestid('deleteStageBtn')
      .click()
    cy.reload()
    cy.getByDataTestid(`stageTile-${stage.name}`)
      .should('not.exist')
  })
})
