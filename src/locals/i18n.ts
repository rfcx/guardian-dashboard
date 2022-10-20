import { createI18n, I18nOptions } from 'vue-i18n'

import en from './en.json'
import ind from './in.json'
import ms from './ms.json'
import nl from './nl.json'
import pt from './pt.json'
import srn from './srn.json'

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
  if (['pt_ID', 'pt'].includes(navigator.language)) {
    return 'pt'
  }
  if (['srn_ID', 'srn'].includes(navigator.language)) {
    return 'srn'
  }
  if (['nl_ID', 'nl'].includes(navigator.language)) {
    return 'nl'
  }
  return 'en'
}

const i18n = createI18n<I18nOptions, [MessageSchema], 'en', 'in'>({
  locale: getLocalLang() ?? 'en',
  messages: {
    en: en,
    in: ind,
    ms: ms,
    pt: pt,
    srn: srn,
    nl: nl
  },
  globalInjection: true,
  fallbackLocale: 'en'
})

export default i18n
