const userPayloadMapper = (userPayload) => ({
  account: userPayload.preferred_username,
  name: userPayload.name,
})

export const keycloakConf = {
  appOrigin: 'http://localhost:8080',
  keycloakSubdomain: 'keycloak:8080/realms/quickstart',
  clientId: 'test-backend',
  clientSecret: 'client-secret-backend',
  useHttps: false,
  disableCookiePlugin: true,
  disableSessionPlugin: true,
  userPayloadMapper,
  retries: 5,
}

export const sessionConf = {
  cookieName: 'sessionId',
  secret: 'a-very-strong-secret-with-more-than-32-char',
  cookie: {
    httpOnly: true,
    secure: true,
  },
  expires: 1800000,
}
