import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { Project } from '@/models'
import { VuexService } from '@/services'
import { formatDifferentFromNow } from '@/utils'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {
  @VuexService.Projects.projects.bind()
  projects!: Project[]

  public selectedProject: Project | undefined
  public isLoading = false
  public allProjects: Project[] = []

  mounted (): void {
    this.isLoading = true
    if (this.$route.params.projectId === undefined) {
      void this.parseProjectsData()
    }
  }

  public formatDifferentFromNow (date: string): string {
    return formatDifferentFromNow(date)
  }

  async parseProjectsData (): Promise<void> {
    this.allProjects = this.projects
    this.isLoading = false
  }
}
