import { Options, Vue } from 'vue-class-component'

import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'
import { Auth0User, Project } from '@/types'
import { NavMenu } from '@/types/Navbar'
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

  @VuexService.Projects.projects.bind()
  projects!: Project[]

  public selectedProject!: Project | undefined

  public hasToggledMobileMenu = false
  public hasOpenedProjectSelector = false

  updated (): void {
    this.getSelectedProject()
  }

  public get selectedProjectName (): string {
    this.getSelectedProject()
    return this.selectedProject?.name ?? 'Select Project'
  }

  public get navMenus (): NavMenu[] {
    const selectedProjectId = this.$route.params.projectId
    return selectedProjectId !== undefined
      ? [
          {
            label: 'Open Incidents',
            destination: { name: ROUTES_NAME.incidents, params: { isOpenedIncidents: 'true' } }
          },
          {
            label: 'Closed Incidents',
            destination: { name: ROUTES_NAME.incidents, params: { isOpenedIncidents: 'false' } }
          }
        ]
      : []
  }

  public getSelectedProject (): void {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  public removeSelectedProject (): void {
    delete this.$route.params.projectId
  }

  // Menu

  public toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  public toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
