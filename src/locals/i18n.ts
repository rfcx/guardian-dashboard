import { createI18n, I18nOptions } from 'vue-i18n'

import en from './en.json'
import ind from './in.json'

type MessageSchema = typeof en

const i18n = createI18n<I18nOptions, [MessageSchema], 'en', 'in'>({
  locale: 'en',
  messages: {
    en: en,
    in: ind
  },
  globalInjection: true,
  fallbackLocale: 'en'
})

export default i18n
