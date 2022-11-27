import {
  keycloakProtocol,
  keycloakDomain,
  keycloakRealm,
  keycloakClientId,
  keycloakClientSecret,
  sessionSecret,
} from './env.js'

const userPayloadMapper = (userPayload) => ({
  id: userPayload.sub,
  email: userPayload.email,
  firstName: userPayload.given_name,
  lastName: userPayload.family_name,
})

export const keycloakConf = {
  appOrigin: 'http://localhost:4000',
  keycloakSubdomain: `${keycloakDomain}/realms/${keycloakRealm}`,
  clientId: keycloakClientId,
  clientSecret: keycloakClientSecret,
  useHttps: keycloakProtocol === 'https',
  disableCookiePlugin: true,
  disableSessionPlugin: true,
  userPayloadMapper,
  retries: 5,
}

export const sessionConf = {
  cookieName: 'sessionId',
  secret: sessionSecret || 'a-very-strong-secret-with-more-than-32-char',
  cookie: {
    httpOnly: true,
    secure: true,
  },
  expires: 1800000,
}
