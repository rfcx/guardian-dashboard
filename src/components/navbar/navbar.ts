import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

import AuthNavbarItemComponent from '@/components/navbar/auth-navbar-item/auth-navbar-item.vue'
import MobileMenuToggleButton from '@/components/navbar/mobile-menu-toggle-button/mobile-menu-toggle-button.vue'
import NavbarDropdownComponent from '@/components/navbar/navbar-dropdown/navbar-dropdown.vue'
import ProjectSelectorComponent from '@/components/project-selector/project-selector.vue'
import { ROUTES_NAME } from '@/router'
import { VuexService } from '@/services'
import { Auth0User, DropdownItem, Project } from '@/types'
import { NavMenu } from '@/types/Navbar'

@Options({
  components: {
    MobileMenuToggleButton,
    NavbarDropdownComponent,
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
  public globeIcon = 'https://static.rfcx.org/img/guardian/ic_globe.svg'

  public languages: DropdownItem[] = [
    { value: 'en', label: 'English', checked: false },
    { value: 'in', label: 'Bahasa Indonesia', checked: false },
    { value: 'ms', label: 'Malay', checked: false }
  ]

  updated (): void {
    this.getSelectedProject()
    this.checkDefaultLanguage()
  }

  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }

  public get selectedProjectName (): string {
    this.getSelectedProject()
    return this.selectedProject?.name ?? `${this.$t('Select Project')}`
  }

  public get navMenus (): NavMenu[] {
    const selectedProjectId = this.$route.params.projectId
    return selectedProjectId !== undefined
      ? [
          {
            label: 'Incidents',
            destination: { name: ROUTES_NAME.incidents }
          },
          {
            label: 'Analytics',
            destination: { name: ROUTES_NAME.analytics }
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

  public checkDefaultLanguage (): void {
    const defaultLang = localStorage.getItem('GDLang')
    if (!defaultLang) return
    const l = this.languages.find(lang => {
      return lang.value === defaultLang
    })
    if (l !== undefined) l.checked = true
  }

  public onLangChanged (item: string): void {
    this.$i18n.locale = item
    localStorage.setItem('GDLang', item)
  }

  // Menu

  public toggleMobileMenu (): void {
    this.hasToggledMobileMenu = !this.hasToggledMobileMenu
  }

  public toggleProjectSelector (isOpened: boolean): void {
    this.hasOpenedProjectSelector = isOpened
  }
}
