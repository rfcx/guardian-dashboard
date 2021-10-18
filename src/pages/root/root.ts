import { Options, Vue } from 'vue-class-component'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import NavBarComponent from '@/components/navbar/navbar.vue'
import { Auth0Option, Auth0User, Project, Stream } from '@/models'
import { VuexService } from '@/services'

@Options({
  components: {
    NavBarComponent,
    InvalidProjectComponent
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
