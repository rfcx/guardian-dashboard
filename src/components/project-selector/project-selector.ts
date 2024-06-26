import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'
import { Project } from '@/types'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @VuexService.Projects.projects.bind()
  projects!: Project[]

  public componentProjects: Project[] | undefined

  public selectedProject: Project | undefined

  public searchLabel = ''

  @Emit('closeProjectSelector')
  public closeProjectSelector (): boolean {
    return false
  }

  data (): Record<string, unknown> {
    return {
      componentProjects: this.componentProjects,
      selectedProject: this.selectedProject,
      t: useI18n()
    }
  }

  mounted (): void {
    this.componentProjects = this.projects
    this.getSelectedProject()
  }

  public isSelectedProject (project: Project): boolean {
    return project.id === this.selectedProject?.id
  }

  public searchProject (): void {
    this.componentProjects = this.projects
    if (this.searchLabel.length && this.componentProjects !== undefined) {
      this.componentProjects = this.componentProjects.filter(p => {
        return p.name.toLowerCase().includes(this.searchLabel)
      })
    }
  }

  getSelectedProject (): void {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  setSelectedProject (project: Project): void {
    this.selectedProject = project
  }

  async confirmedSelectedProject (): Promise<void> {
    const newProjectId = this.selectedProject?.id
    if (newProjectId !== undefined) {
      const currentRoute = this.$router.currentRoute.value.name ?? ROUTES_NAME.incidents
      const route = currentRoute === ROUTES_NAME.analytics ? ROUTES_NAME.analytics : ROUTES_NAME.incidents
      void this.$router.push({ name: route, params: { projectId: newProjectId } })
    }
    this.closeProjectSelector()
  }
}
