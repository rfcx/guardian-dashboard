import { Vue } from 'vue-class-component'
import { formatDateLabel } from '@/utils'

export default class ReportPage extends Vue {
  guardian: any = {}
  messages: Array<string> =[
    'Equipment Encountered',
    'Loggers Encountered',
    'Large Scale',
    'No damage',
    'No action'
  ]
  mounted (): void {
    console.log('ReportPage')
    this.getGuardianData()
  }
  public closeReport (): string {
    return 'Closed on 20 Sep 2021'
  }
  public getColor(n: number): string {
    const classes = ['ic-violet', 'ic-blue', 'ic-green', 'ic-orange', 'ic-pink'];
    return classes[n]
  }

  public dateFormatted (date: string): string {
    return formatDateLabel(date)
  }

  private getGuardianData (): void {
    this.guardian = {
      shortname: "Curaci - Jabota",
      last_sync: "2021-09-06T18:51:19.707Z",
      label: '- response time 29 hours',
      status: 'report submitted',
      events: [
        {
          last_sync: "2021-09-06T18:51:19.707Z",
          title: 'Chainsaw',
          detections: 180,
          created_by: 'Topher White',
          id: '2kg1xourixp1',
        },
        {
          last_sync: "2021-09-06T18:51:19.707Z",
          title: 'Chainsaw',
          detections: 19,
          created_by: null,
          id: '2kg1xourixp2',
        },
        {
          last_sync: "2021-09-06T18:51:19.707Z",
          title: 'Chainsaw',
          detections: 299,
          created_by: null,
          id: '2kg1xourixp2',
        }
      ]
    }
  }
}
