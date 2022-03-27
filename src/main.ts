import { createApp } from 'vue'

import App from './App.vue'
import { Auth0 } from './auth'
import i18n from './locals/i18n'
import router from './router'
import stores from './stores'

import 'virtual:windi.css'
import './styles/global.scss'

async function init (): Promise<void> {
  const { Auth0Plugin, redirectAfterAuth } = await Auth0.init({ redirectUri: window.location.origin })

  createApp(App)
    .use(i18n)
    .use(Auth0Plugin)
    .use(stores)
    .use(router)
    .mount('#app')

  if (redirectAfterAuth) await router.replace(redirectAfterAuth)
}

void init()
