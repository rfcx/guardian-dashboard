import { Vue } from 'vue-class-component'

interface LangItem {
  flag: string
  value: string
  title: string
}

export default class LanguageSelectorComponent extends Vue {
  public languages: LangItem[] = [
    { flag: '🇺🇸', value: 'en', title: 'English' },
    { flag: '🇮🇩', value: 'in', title: 'Bahasa Indonesia' }
  ]

  data (): Record<string, unknown> {
    return {
      languages: this.languages
    }
  }

  public onLangChange (lang: string): void {
    localStorage.setItem('GDLang', lang)
  }
}
