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

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public selectedProject: any = {}

  isSelectedProject (project: Project): boolean {
    return project.id === this.selectedProject?.id
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getSelectedProject (): any {
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

  mounted (): void {
    this.getSelectedProject()
  }
}
