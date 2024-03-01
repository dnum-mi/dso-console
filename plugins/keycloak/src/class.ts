import { PluginApi } from '@cpn-console/hooks'

type KeycloakEnv = {
  path: string
  subgroups: { // Key is the group name, value is the full path
    RO: string
    RW: string
  }
}

export class KeycloakProjectApi extends PluginApi {
  private organizationName: string
  private projectName: string

  constructor (organizationName: string, projectName: string) {
    super()
    this.organizationName = organizationName
    this.projectName = projectName
  }

  public async getProjectGroupPath (): Promise<string> {
    return `/${this.organizationName}/${this.projectName}`
  }

  public async getEnvGroup (environment: string): Promise<KeycloakEnv> {
    return {
      path: `/${this.organizationName}/${this.projectName}/${environment}`,
      subgroups: {
        RO: `/${this.organizationName}/${this.projectName}/${environment}/RO`,
        RW: `/${this.organizationName}/${this.projectName}/${environment}/RW`,
      },
    }
  }
}
