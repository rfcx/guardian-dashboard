import { createI18n, I18nOptions } from 'vue-i18n'

import en from './en.json'
import ind from './in.json'
import ms from './ms.json'

type MessageSchema = typeof en

export const getLocalLang = (): string | null => {
  if (typeof window === 'undefined' || localStorage === undefined) {
    return 'en'
  }
  const lang = localStorage.getItem('GDLang')
  if (lang !== null) {
    return lang
  }
  if (['in_ID', 'in'].includes(navigator.language)) {
    return 'in'
  }
  if (['ms_ID', 'ms'].includes(navigator.language)) {
    return 'ms'
  }
  return 'en'
}

const i18n = createI18n<I18nOptions, [MessageSchema], 'en', 'in'>({
  locale: getLocalLang() ?? 'en',
  messages: {
    en: en,
    in: ind,
    ms: ms
  },
  globalInjection: true,
  fallbackLocale: 'en'
})

export default i18n
