import Keycloak from 'keycloak-js'

import {
  keycloakProtocol,
  keycloakDomain,
  keycloakClientId,
  keycloakRealm,
  keycloakRedirectUri,
} from '../env.js'

export const keycloakConf = {
  url: `${keycloakProtocol}://${keycloakDomain}`,
  realm: keycloakRealm,
  clientId: keycloakClientId,
  onLoad: 'check-sso',
  flow: 'standard',
  redirectUri: keycloakRedirectUri,
}

let keycloak

export const getKeycloak = () => {
  if (!keycloak) {
    keycloak = new Keycloak(keycloakConf)
  }
  return keycloak
}

export const getUserProfile = async () => {
  try {
    const keycloak = getKeycloak()
    const { email, id, firstName, lastName } = await keycloak.loadUserProfile()
    return {
      email,
      id,
      firstName,
      lastName,
    }
  } catch (error) {
    return error
  }
}

export const keycloakInit = async () => {
  keycloakConf.redirectUri = keycloakConf.redirectUri.concat(location.pathname)
  try {
    const { onLoad, redirectUri, flow } = keycloakConf
    const keycloak = getKeycloak()
    await keycloak.init({ onLoad, flow, redirectUri })

    // Permet de refresh le token keycloak toutes les minutes
    setInterval(async () => {
      try {
        await keycloak.updateToken(70)
      } catch (error) {
        console.log(`Failed to refresh token. ${error.message}`)
      }
    }, 60000)
  } catch (error) {
    return error
  }
}

export const keycloakLogin = async () => {
  try {
    const keycloak = getKeycloak()
    await keycloak.login()
  } catch (error) {
    return error
  }
}

export const keycloakLogout = async () => {
  try {
    const keycloak = getKeycloak()
    await keycloak.logout()
  } catch (error) {
    return error
  }
}
