import { Options, Vue } from 'vue-class-component'

import FooterComponent from '@/components/footer/footer.vue'
import NavBarComponent from '@/components/navbar/navbar.vue'
import { VuexService } from '@/services'
import { Auth0Option, Auth0User, Project, Stream } from '@/types'

@Options({
  components: {
    NavBarComponent,
    FooterComponent
  }
})
export default class RootPage extends Vue {
  @VuexService.Auth.auth.bind()
  protected auth!: Auth0Option | undefined

  @VuexService.Auth.user.bind()
  protected user!: Auth0User | undefined

  @VuexService.Projects.streams.bind()
  protected streams!: Stream | undefined

  @VuexService.Projects.selectedProject.bind()
  selectedProject!: Project | undefined
}
