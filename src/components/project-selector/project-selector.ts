import { Options, Vue } from 'vue-class-component'
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

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public selectedProject: any = {}

  public searchLabel = ''

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
    if (newProjectId !== undefined) void this.$router.push({ name: ROUTES_NAME.incidents, params: { projectId: newProjectId } })
    this.closeProjectSelector()
  }

  @Emit('closeProjectSelector')
  public closeProjectSelector (): boolean {
    return false
  }

  data (): Record<string, unknown> {
    return {
      componentProjects: this.componentProjects
    }
  }

  mounted (): void {
    this.componentProjects = this.projects
    this.getSelectedProject()
  }
}
