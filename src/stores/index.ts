import { createDecorator, VueDecorator } from 'vue-class-component'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'

import * as Models from '@/models'
import { ProjectServices } from '@/services'
import * as ACTIONS from './actions'
import * as ITEMS from './items'

export { ACTIONS, ITEMS }

const MUTATIONS = {
  root: {
    updateAuth: 'updateAuth',
    updateUser: 'updateUser',
    updateProjects: 'updateProjects',
    updateSelectedProject: 'updateSelectedProject',
    updateStreams: 'updateStreams'
  }
}

export class RootState {
  auth?: Models.Auth0Option
  user?: Models.Auth0User
  projects: Models.Project[] = []
  selectedProject?: Models.Project
  streams?: Models.Stream[] = []
}

const rootActions: ActionTree<RootState, RootState> = {
  [ACTIONS.root.updateAuth]: ({ commit }, auth?: Models.Auth0Option) => commit(MUTATIONS.root.updateAuth, auth),
  [ACTIONS.root.updateUser]: async ({ commit }, user?: Models.Auth0User) => {
    commit(MUTATIONS.root.updateUser, user)

    const projects = user ? await ProjectServices.getProjects() : []
    commit(MUTATIONS.root.updateProjects, projects)

    const streams = undefined
    commit(MUTATIONS.root.updateStreams, streams)

    const selectedProject = projects.length > 0 ? projects[0] : undefined
    commit(MUTATIONS.root.updateSelectedProject, selectedProject)
  },
  [ACTIONS.root.updateSelectedProject]: ({ commit }, project?: Models.Project) => commit(MUTATIONS.root.updateSelectedProject, project),
  [ACTIONS.root.updateStreams]: ({ commit }, streams?: Models.Stream) => commit(MUTATIONS.root.updateStreams, streams)
}

const rootMutations: MutationTree<RootState> = {
  [MUTATIONS.root.updateAuth]: (state, auth?: Models.Auth0Option) => { state.auth = auth },
  [MUTATIONS.root.updateUser]: (state, user?: Models.Auth0User) => { state.user = user },
  [MUTATIONS.root.updateProjects]: (state, projects: Models.Project[]) => { state.projects = projects },
  [MUTATIONS.root.updateStreams]: (state, streams: Models.Stream[]) => { state.streams = streams },
  [MUTATIONS.root.updateSelectedProject]: (state, project?: Models.Project) => { state.selectedProject = project }
}

const rootGetters: GetterTree<RootState, RootState> = {
  [ITEMS.root.auth]: state => state.auth,
  [ITEMS.root.user]: state => state.user,
  [ITEMS.root.projects]: state => state.projects,
  [ITEMS.root.streams]: state => state.streams,
  [ITEMS.root.selectedProject]: state => state.selectedProject
}

export default new Vuex.Store({
  state: new RootState(),
  mutations: rootMutations,
  actions: rootActions,
  getters: rootGetters
})

export const createVuexDecorator = (field: string): VueDecorator => createDecorator((options, key) => {
  options.computed = options?.computed ?? {}
  options.computed[key] = function () {
    return this.$store.getters[field]
  }
})
