import { Options, Vue } from 'vue-class-component'
import { ProjectModels } from '@/models'
import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { VuexService } from '@/services'
import { formatHoursLabel } from '@/utils'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {
  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  public selectedProject: ProjectModels.ProjectListItem | undefined
  public isLoading: boolean = false
  public allProjects: Array<any> = []
  public routerParam: any = {}

  mounted (): void {
    this.isLoading = true
    if (!this.$route.params.projectId) {
      this.parseProjectsData()
    }
  }

  public hoursFormatted (date: string): string {
    return formatHoursLabel(date)
  }

  async parseProjectsData (): Promise<void> {
    this.allProjects = this.projects
    this.isLoading = false
  }
}
