import { createI18n, I18nOptions } from 'vue-i18n'

import en from './en.json'
import ind from './in.json'

type MessageSchema = typeof en

let localStorage: Storage

export const getLocalLang = (): string | null => {
  if (localStorage === undefined) {
    return 'en'
  }
  const lang = localStorage.getItem('GDLang')
  if (lang !== null) {
    return lang
  }
  if (['in_ID', 'in'].includes(navigator.language)) {
    return 'in'
  }
  return 'en'
}

const i18n = createI18n<I18nOptions, [MessageSchema], 'en', 'in'>({
  locale: getLocalLang() ?? 'en',
  messages: {
    en: en,
    in: ind
  },
  globalInjection: true,
  fallbackLocale: 'en'
})

export default i18n
