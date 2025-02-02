<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { getRandomId } from '@gouvminint/vue-dsfr'
import type { CleanedCluster, Environment, Log, PluginsUpdateBody, ProjectService, ProjectV2, Repo, Zone } from '@cpn-console/shared'
import { bts } from '@cpn-console/shared'
import fr from 'javascript-time-ago/locale/fr'
import TimeAgo from 'javascript-time-ago'
import { useSnackbarStore } from '@/stores/snackbar.js'
import { useUserStore } from '@/stores/user.js'
import { useQuotaStore } from '@/stores/quota.js'
import { useProjectStore } from '@/stores/project.js'
import { useStageStore } from '@/stores/stage.js'
import { useLogStore } from '@/stores/log.js'
import router from '@/router/index.js'
import { useClusterStore } from '@/stores/cluster.js'
import { useZoneStore } from '@/stores/zone.js'
import OperationPanel from '@/components/OperationPanel.vue'

const props = defineProps<{ projectSlug: ProjectV2['slug'] }>()

const projectStore = useProjectStore()
const zoneStore = useZoneStore()
const clusterStore = useClusterStore()
const userStore = useUserStore()
const snackbarStore = useSnackbarStore()
const quotaStore = useQuotaStore()
const stageStore = useStageStore()

const bannerKey = ref(getRandomId('banner'))
const teamCtKey = ref(getRandomId('team'))
const environmentsCtKey = ref(getRandomId('environment'))
const repositoriesCtKey = ref(getRandomId('repository'))
const isArchivingProject = ref(false)
const projectToArchive = ref('')

const headerEnvs = ['Nom', 'Type', 'Quota', 'Localisation', 'Date']
const headerRepos = ['Nom', 'Type', 'Privé ?', 'url', 'Date']
const membersId = 'membersTable'
const repositoriesId = 'repositoriesTable'
const environmentsId = 'environmentsTable'
const servicesId = 'servicesTable'
const logsId = 'logsView'

const project = computed(() => projectStore.projectsBySlug[props.projectSlug])
const environments = ref<(Environment & { cluster?: CleanedCluster & { zone?: Zone } })[]>()
const repositories = ref<Repo[]>()
// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(fr)

// Create relative date/time formatter.
const timeAgo = new TimeAgo('fr-FR')

function refreshComponents() {
  bannerKey.value = getRandomId('banner')
  teamCtKey.value = getRandomId('team')
}

function unSelectProject() {
  router.push({ name: 'ListProjects' })
}

async function updateEnvironmentQuota({ environmentId, quotaId }: { environmentId: string, quotaId: string }) {
  await project.value.Environments.update(environmentId, { quotaId })
  refreshComponents()
}

async function handleProjectLocking() {
  await project.value.Commands.update({ locked: !project.value.locked })
  refreshComponents()
}

async function replayHooks() {
  await project.value.Commands.replay()
  refreshComponents()
}

async function archiveProject() {
  await project.value.Commands.delete()
  refreshComponents()
  unSelectProject()
}

async function addUserToProject(email: string) {
  await project.value.Members.create(email)
  refreshComponents()
}

async function removeUserFromProject(userId: string) {
  await project.value.Members.delete(userId)
  refreshComponents()
}

async function transferOwnerShip(nextOwnerId: string) {
  await project.value.Commands.update({ ownerId: nextOwnerId })
  refreshComponents()
}

async function getProjectDetails() {
  try {
    await Promise.all([
      project.value.Commands.refresh(),
      reloadProjectServices(),
      showLogs(0),
      clusterStore.getClusters(),
      zoneStore.getAllZones(),
    ])
    refreshComponents()
    environments.value = project.value.environments.map((environment) => {
      const cluster = clusterStore.clusters.find(cluster => cluster.id === environment.clusterId) as CleanedCluster
      const zone = zoneStore.zones.find(zone => zone.id === cluster.zoneId) as Zone
      return {
        ...environment,
        cluster: {
          ...cluster,
          zone,
        },
      }
    })
    repositories.value = project.value.repositories
  } catch (error) {
    console.trace(error)
  }
}
onBeforeMount(async () => {
  await Promise.all([
    getProjectDetails(),
    stageStore.getAllStages(),
    quotaStore.getAllQuotas(),
  ])
})

const projectServices = ref<ProjectService[]>([])
async function reloadProjectServices() {
  const resServices = await project.value.Services.list('admin')
  projectServices.value = []
  await nextTick()
  const filteredServices = resServices
  projectServices.value = filteredServices
}

async function saveProjectServices(data: PluginsUpdateBody) {
  try {
    await project.value.Services.update(data)
    snackbarStore.setMessage('Paramètres sauvegardés', 'success')
  } catch (_error) {
    snackbarStore.setMessage('Erreur lors de la sauvegarde', 'error')
  }
  await reloadProjectServices()
}

// LOGS Rendering functions
const logStore = useLogStore()

const step = 10
const isUpdating = ref(false)
const page = ref(0)

const logs = ref<Log[]>([])
const totalLength = ref(0)

async function showLogs(index?: number) {
  page.value = index ?? page.value
  getProjectLogs({ offset: page.value * step, limit: step })
}

async function getProjectLogs({ offset, limit }: { offset: number, limit: number }) {
  isUpdating.value = true
  const res = await logStore.listLogs({ offset, limit, projectId: project.value.id, clean: false })
  logs.value = res.logs as Log[]
  totalLength.value = res.total
  isUpdating.value = false
}
</script>

<template>
  <div>
    <div
      class="w-full flex gap-4 justify-end fr-mb-1w"
    >
      <DsfrButton
        data-testid="refresh-btn"
        title="Rafraîchir la liste des projets"
        secondary
        icon-only
        icon="ri:refresh-line"
        :disabled="snackbarStore.isWaitingForResponse"
        @click="async() => {
          await getProjectDetails()
        }"
      />
      <DsfrButton
        v-if="project"
        title="Revenir à la liste des projets"
        data-testid="goBackBtn"
        secondary
        icon-only
        icon="ri:arrow-go-back-line"
        @click="unSelectProject"
      />
    </div>
    <template v-if="project">
      <div>
        <ProjectBanner
          :key="bannerKey"
          :project="project"
          :can-update-description="false"
        />
        <div
          class="w-full flex place-content-evenly fr-mb-2w"
        >
          <DsoBadge
            :resource="{
              ...project,
              locked: bts(project.locked),
              resourceKey: 'locked',
              wording: '',
            }"
          />
          <DsoBadge
            :resource="{
              ...project,
              resourceKey: 'status',
              wording: '',
            }"
          />
        </div>
        <div class="w-full flex gap-4 fr-mb-2w">
          <DsfrButton
            data-testid="replayHooksBtn"
            label="Reprovisionner le projet"
            :icon="{ name: 'ri:refresh-line', animation: project.operationsInProgress.includes('replay') ? 'spin' : undefined }"
            :disabled="project.operationsInProgress.includes('replay') || project.locked"
            secondary
            @click="replayHooks()"
          />
          <DsfrButton
            data-testid="handleProjectLockingBtn"
            :label="`${project.locked ? 'Déverrouiller' : 'Verrouiller'} le projet`"
            :icon="project.operationsInProgress.includes('lockHandling')
              ? { name: 'ri:refresh-line', animation: 'spin' }
              : project.locked ? 'ri:lock-unlock-line' : 'ri:lock-line'"
            :disabled="project.operationsInProgress.includes('lockHandling') || project.status === 'archived'"
            secondary
            @click="handleProjectLocking"
          />
          <DsfrButton
            v-show="!isArchivingProject"
            data-testid="showArchiveProjectBtn"
            label="Supprimer le projet"
            secondary
            :disabled="project.operationsInProgress.includes('delete') || project.locked"
            :icon="project.operationsInProgress.includes('delete')
              ? { name: 'ri:refresh-line', animation: 'spin' }
              : 'ri:delete-bin-7-line'"
            @click="isArchivingProject = true"
          />
        </div>
        <div
          v-if="isArchivingProject"
          class="fr-mt-4w"
        >
          <DsfrInput
            v-model="projectToArchive"
            data-testid="archiveProjectInput"
            :label="`Veuillez taper '${project.name}' pour confirmer la suppression du projet`"
            label-visible
            :placeholder="project.name"
            class="fr-mb-2w"
          />
          <div
            class="flex justify-between"
          >
            <DsfrButton
              data-testid="archiveProjectBtn"
              :label="`Supprimer définitivement le projet ${project.name}`"
              secondary
              :disabled="project.operationsInProgress.includes('delete') || projectToArchive !== project.name"
              :icon="project.operationsInProgress.includes('delete')
                ? { name: 'ri:refresh-line', animation: 'spin' }
                : 'ri:delete-bin-7-line'"
              @click="archiveProject"
            />
            <DsfrButton
              label="Annuler"
              primary
              @click="isArchivingProject = false"
            />
          </div>
        </div>
        <DsfrNavigation
          class="fr-mb-2w"
          :nav-items="[
            {
              to: `#${environmentsId}`,
              text: '#Environnements',
            },
            {
              to: `#${repositoriesId}`,
              text: '#Dépôts',
            },
            {
              to: `#${membersId}`,
              text: '#Membres',
            },
            {
              to: `#${servicesId}`,
              text: '#Services',
            },
            {
              to: `#${logsId}`,
              text: '#Journaux',
            },
          ]"
        />
        <hr>
        <div
          class="w-full flex flex-col"
        >
          <DsfrTable
            :id="environmentsId"
            :key="environmentsCtKey"
            title="Environnements"
          >
            <template #header>
              <tr>
                <td
                  v-for="header in headerEnvs"
                  :key="header"
                >
                  {{ header }}
                </td>
              </tr>
            </template>
            <tr
              v-for="env in environments?.sort((e1, e2) => Number(e1.createdAt) - Number(e2.createdAt))"
              :key="env.id"
            >
              <td>{{ env.name }}</td>
              <td>{{ stageStore.stages.find(stage => stage.id === env.stageId)?.name ?? 'Type inconnu...' }}</td>
              <td>
                <DsfrSelect
                  v-model="env.quotaId"
                  label=""
                  :options="quotaStore.quotas.filter(quota => quota.stageIds.includes(env.stageId)).map(quota => ({
                    text: `${quota.name} (${quota.cpu}CPU, ${quota.memory})`,
                    value: quota.id,
                  }))"
                  select-id="quota-select"
                  @update:model-value="(event: string | number) => updateEnvironmentQuota({ environmentId: env.id, quotaId: event.toString() })"
                />
              </td>
              <td>
                {{ env.cluster?.label ?? 'Cluster inconnu' }} - {{ env.cluster?.zone?.label ?? 'Zone inconnue' }}
              </td>
              <td
                :title="(new Date(env.createdAt)).toLocaleString()"
              >
                <span>{{ timeAgo.format(new Date(env.createdAt)) }}</span>
              </td>
            </tr>
            <tr
              v-if="!project.environments?.length"
            >
              <td
                :colspan="headerEnvs.length"
              >
                Aucun environnement existant
              </td>
            </tr>
          </DsfrTable>

          <hr>
          <DsfrTable
            :id="repositoriesId"
            :key="repositoriesCtKey"
            title="Dépôts"
          >
            <template #header>
              <tr>
                <td
                  v-for="header in headerRepos"
                  :key="header"
                >
                  {{ header }}
                </td>
              </tr>
            </template>
            <tr
              v-for="repo in repositories"
              :key="repo.id"
            >
              <td>{{ repo.internalRepoName }}</td>
              <td>{{ repo.isInfra ? 'Infra' : 'Applicatif' }}</td>
              <td>{{ repo.isPrivate ? 'oui' : 'non' }}</td>
              <td>{{ repo.externalRepoUrl || '-' }}</td>
              <td
                :title="(new Date(repo.createdAt)).toLocaleString()"
              >
                {{ timeAgo.format(new Date(repo.createdAt)) }}
              </td>
            </tr>
            <tr
              v-if="!repositories?.length"
            >
              <td
                :colspan="headerEnvs.length"
              >
                Aucun dépôt existant
              </td>
            </tr>
          </DsfrTable>
          <hr>
          <TeamCt
            :id="membersId"
            :key="teamCtKey"
            :user-profile="userStore.userProfile"
            :project="project"
            :members="project.members"
            :can-manage="true"
            :can-transfer="true"
            @add-member="(email: string) => addUserToProject(email)"
            @remove-member="(userId: string) => removeUserFromProject(userId)"
            @transfer-ownership="(nextOwnerId: string) => transferOwnerShip(nextOwnerId)"
          />
          <hr>
          <div
            class="mb-8"
          >
            <ServicesConfig
              :services="projectServices"
              permission-target="admin"
              :display-global="false"
              :disabled="false"
              @update="(data: PluginsUpdateBody) => saveProjectServices(data)"
              @reload="() => reloadProjectServices()"
            />
          </div>
          <hr>
          <div>
            <h4
              :id="logsId"
            >
              Journaux du projet
            </h4>
            <LogsViewer
              :logs="logs"
              :total-length="totalLength"
              :is-updating="isUpdating"
              :page="page"
              :step="step"
              @move-page="showLogs"
            />
          </div>
        </div>
      </div>
      <OperationPanel
        :project-id="project.id"
      />
    </template>
  </div>
</template>
