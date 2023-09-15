import { RegisterFn } from '@/plugins/index.js'
import {
  createDsoProject,
  archiveDsoProject,
  createDsoRepository,
  deleteDsoRepository,
  addDsoGroupMember,
  removeDsoGroupMember,
  checkApi,
} from './index.js'
import { getGroupRootId } from './utils.js'
import { infos } from './infos.js'

export const init = (register: RegisterFn) => {
  getGroupRootId()
  register(
    'gitlab',
    {
      addUserToProject: { main: addDsoGroupMember },
      removeUserFromProject: { main: removeDsoGroupMember },
      createProject: {
        // @ts-ignore fix type for check step
        check: checkApi,
        main: createDsoProject,
      },
      archiveProject: { main: archiveDsoProject },
      createRepository: {
        // @ts-ignore fix type for check step
        check: checkApi,
        main: createDsoRepository,
      },
      deleteRepository: { main: deleteDsoRepository },
    },
    infos,
  )
}
