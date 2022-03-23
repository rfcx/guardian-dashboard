import { Vue } from 'vue-class-component'

export default class LanguageSelectorComponent extends Vue {
  data (): Record<string, unknown> {
    return {
      languages: [
        { flag: '🇺🇸', value: 'en', title: 'English' },
        { flag: '🇮🇩', value: 'in', title: 'Bahasa Indonesia' }
      ]
    }
  }

  public onLangChange (lang: string): void {
    localStorage.setItem('GDLang', lang)
  }
}
