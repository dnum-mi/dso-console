<script lang="ts" setup>
import type { CleanLog, ProjectV2 } from '@cpn-console/shared'
import { ref, watch } from 'vue'
import { useLogStore } from '../stores/log.js'
import { selectedProjectSlug } from '@/router/index.js'
import { useProjectStore } from '@/stores/project.js'

const props = defineProps<{
  projectSlug?: ProjectV2['slug']
}>()

const projectStore = useProjectStore()

const project = computed(() => props.projectSlug ? projectStore.projectsBySlug[props.projectSlug] : undefined)
const logStore = useLogStore()

const step = 5
const isUpdating = ref(false)
const page = ref(0)

const logs = ref<CleanLog[]>([])
const totalLength = ref(0)

async function showLogs(index?: number) {
  page.value = index ?? page.value
  await getProjectLogs({ offset: page.value * step, limit: step })
}

async function getProjectLogs({ offset, limit }: { offset: number, limit: number }) {
  if (!project.value) {
    return
  }
  isUpdating.value = true
  const res = await logStore.listLogs({ offset, limit, projectId: project.value.id, clean: true })
  logs.value = res.logs as CleanLog[]
  totalLength.value = res.total
  isUpdating.value = false
}

function toggleDisplayLogs() {
  logStore.displayProjectLogs = !logStore.displayProjectLogs
  showLogs()
}

watch(logStore, async () => {
  if (logStore.needRefresh) {
    await showLogs()
    logStore.needRefresh = false
  }
})

watch(selectedProjectSlug, () => {
  if (!selectedProjectSlug.value) {
    logStore.needRefresh = false
    logStore.displayProjectLogs = true
    return undefined
  }
  logStore.needRefresh = true
})
</script>

<template>
  <div
    v-if="projectSlug"
    :class="`fixed bottom-0 right-0 z-1000 top-40 shadow-lg flex fr-btn--secondary h-130 transition-all ${logStore.displayProjectLogs ? '' : 'translate-x-90'}`"
  >
    <div
      class="log-btn origin-bottom-left -rotate-90 h-max w-min absolute top-30 left-1px"
    >
      <DsfrButton
        class="pr-9"
        data-testid="displayLogsBtn"
        label="Journaux"
        secondary
        small
        @click="toggleDisplayLogs"
      />
      <v-icon
        :class="`fixed bottom-2.5 right-3 transition-all ${logStore.displayProjectLogs ? 'rotate-180' : ''}`"
        name="ri-arrow-up-s-line"
        @click="toggleDisplayLogs"
      />
    </div>
    <div
      class="max-h-150 w-90 p-5 items-center overflow-y-hidden log-panel"
      data-testid="displayLogsPanel"
    >
      <div
        class="max-h-120 flex gap-4 flex-row flex-wrap overflow-y-scroll"
      >
        <h4
          id="logsView"
          class="mb-2"
        >
          Journaux du projet
        </h4>
        <LogsViewer
          :logs="logs"
          :total-length="totalLength"
          :is-updating="isUpdating"
          :page="page"
          :step="step"
          header-class="grid-col-2 shrink"
          body-class="grid-col-span-2 mt-1 w-full"
          mode="hide"
          hide-total-events
          pagination-position="top"
          @move-page="showLogs"
        />
      </div>
    </div>
  </div>
</template>
