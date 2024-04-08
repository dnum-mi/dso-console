import { type Pinia, createPinia, setActivePinia } from 'pinia'

import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.min.css'
import '@gouvfr/dsfr/dist/utility/utility.main.min.css'
import '@gouvminint/vue-dsfr/styles'
import '@/main.css'

import ZoneForm from '@/components/ZoneForm.vue'
import { useSnackbarStore } from '@/stores/snackbar.js'
import { getRandomCluster, getRandomZone } from '@cpn-console/test-utils'

describe('ZoneForm.vue', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()

    setActivePinia(pinia)
  })

  it('Should mount a new zone ZoneForm', () => {
    useSnackbarStore()

    const props = {
      associatedClusters: [],
      isNewZone: true,
      allClusters: [getRandomCluster({})],
    }

    cy.mount(ZoneForm, { props })

    cy.getByDataTestid('addZoneBtn').should('be.disabled')
    cy.getByDataTestid('deleteZoneZone').should('not.exist')
    cy.getByDataTestid('slugInput')
      .find('input')
      .clear()
      .type('zad')
    cy.getByDataTestid('labelInput')
      .find('input')
      .clear()
      .type('Zone à Défendre')
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
    cy.getByDataTestid('descriptionInput')
      .find('textarea')
      .clear()
      .type('Cette zone de déploiement est publique.')
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
    cy.get('#clusters-select')
      .select(`${props.allClusters[0].label}`)
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
  })

  it('Should mount a new zone ZoneForm without clusters', () => {
    useSnackbarStore()

    const props = {
      associatedClusters: [],
      isNewZone: true,
      allClusters: [],
    }

    cy.mount(ZoneForm, { props })

    cy.getByDataTestid('addZoneBtn').should('be.disabled')
    cy.getByDataTestid('deleteZoneZone').should('not.exist')
    cy.getByDataTestid('slugInput')
      .find('input')
      .clear()
      .type('zad')
    cy.getByDataTestid('labelInput')
      .find('input')
      .clear()
      .type('Zone à Défendre')
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
    cy.getByDataTestid('descriptionInput')
      .find('textarea')
      .clear()
      .type('Cette zone de déploiement est publique.')
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
    cy.get('#clusters-select')
      .find('option')
      .should('have.length', 1)
      .and('contain', 'Aucun cluster disponible')
    cy.getByDataTestid('addZoneBtn').should('be.enabled')
  })

  it('Should mount an update ZoneForm', () => {
    const zone = getRandomZone()
    const cluster = getRandomCluster({ zoneId: zone.id })
    useSnackbarStore()

    const props = {
      associatedClusters: [cluster],
      zone: { ...zone, clusters: [cluster] },
      allClusters: [cluster],
    }

    cy.mount(ZoneForm, { props })

    cy.getByDataTestid('updateZoneBtn').should('be.enabled')
    cy.getByDataTestid('deleteZoneZone').should('not.exist')
    cy.getByDataTestid('slugInput')
      .find('input')
      .should('have.value', props.zone.slug)
      .and('be.disabled')
    cy.getByDataTestid('labelInput')
      .find('input')
      .should('have.value', props.zone.label)
      .and('be.enabled')
      .clear()
      .type('Zone à Détruire')
    cy.getByDataTestid('updateZoneBtn').should('be.enabled')
    cy.getByDataTestid('descriptionInput')
      .find('textarea')
      .should('have.value', props.zone.description)
      .and('be.enabled')
      .clear()
      .type('Cette zone de déploiement est privée.')
    cy.getByDataTestid('updateZoneBtn').should('be.enabled')
    cy.get('#clusters-select')
      .should('be.disabled')
    cy.getByDataTestid('updateZoneBtn').should('be.enabled')
  })
})
