import { Vue } from 'vue-class-component'

import { VuexService } from '@/services'
import { Auth0Option, Auth0User } from '@/types'

export default class AuthNavbarItemComponent extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  @VuexService.Auth.user.bind()
  public user!: Auth0User | undefined

  public isMenuOpen = false

  public get userImage (): string {
    return this.user?.picture ?? ''
  }

  public async login (): Promise<void> {
    await this.auth?.loginWithRedirect()
  }

  public async logout (): Promise<void> {
    await this.auth?.logout({ returnTo: window.location.origin })
  }

  public toggleMenu (): void {
    this.isMenuOpen = !this.isMenuOpen
  }
}
