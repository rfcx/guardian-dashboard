import { Options, Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { ProjectModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'

@Options({
  components: { OnClickOutside }
})
export default class ProjectSelectorComponent extends Vue {
  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  public selectedProject: any = {}

  isSelectedProject (project: ProjectModels.ProjectListItem): boolean {
    return project.id === this.selectedProject?.id
  }

  getSelectedProject (): any {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  setSelectedProject (project: ProjectModels.ProjectListItem): void {
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
