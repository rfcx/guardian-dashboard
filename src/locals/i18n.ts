import { createI18n, I18nOptions } from 'vue-i18n'

import en from './en.json'
import ind from './in.json'

type MessageSchema = typeof en

export const getLocalLang = (): string | null => {
  try {
    const lang = localStorage.getItem('GDLang')
    if (lang !== null) {
      return lang
    }
    if (['in_ID', 'in'].includes(navigator.language)) {
      return 'in'
    }
    return 'en'
  } catch (e) {
    console.log(e)
    return null
  }
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
