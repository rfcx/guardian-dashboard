import { Options, Vue } from 'vue-class-component'

import { Auth0User, ProjectModels } from '@/models'
import { NavMenu } from '@/models/Navbar'
import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'
import ProjectSelectorComponent from '../project-selector/project-selector.vue'
import AuthNavbarItemComponent from './auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from './mobile-menu-toggle-button/mobile-menu-toggle-button.vue'

@Options({
  components: {
    MobileMenuToggleButton,
    ProjectSelectorComponent,
    AuthNavbarItemComponent
  }
})

export default class NavigationBarComponent extends Vue {
  @VuexService.Auth.user.bind()
  public user!: Auth0User | undefined

  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  public selectedProject: any

  public hasToggledMobileMenu = false
  public hasOpenedProjectSelector = false

  updated (): void {
    if (this.$route.params && (this.selectedProject && this.selectedProject.id !== this.$route.params.projectId)) {
      this.getSelectedProject()
    }
  }

  public get selectedProjectName (): string {
    this.getSelectedProject()
    return this.selectedProject?.name ?? 'Select Project'
  }

  public get navMenus (): NavMenu[] {
    const selectedProjectId = this.$route.params.projectId
    return selectedProjectId
      ? [
          {
            label: 'Open',
            destination: { name: ROUTES_NAME.incidents, params: { isOpenedIncidents: 'true' } }
          },
          {
            label: 'Closed',
            destination: { name: ROUTES_NAME.incidents, params: { isOpenedIncidents: 'false' } }
          }
        ]
      : []
  }

  getSelectedProject (): any {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  // Menu

  public toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  public toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
