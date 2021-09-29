import { Vue } from 'vue-class-component'
import { ProjectModels } from '@/models'
import { VuexService } from '@/services'

export default class GuardiansPage extends Vue {
  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  public currentSelectedProject: ProjectModels.ProjectListItem | undefined = { ...VuexService.Project.selectedProject.get() }
  public guardians: Array<any> = []
  public originalData: Array<any> = []

  public routerParam: any = {}

  updated(): void {
    console.log('updated', this.$route.params)
    if (this.$route.params && this.$route.params.isOpenedIncidents) {
      this.guardians = this.originalData.filter(item => {
        if (this.$route.params.isOpenedIncidents === 'false') {
          return item.status === 'report closed';
        }
        else return item.status !== 'report closed';
      })
    }
    else {
      this.guardians = this.originalData
    }
  }

  mounted (): void {
    console.log('GuardiansPage')
    this.getGuardiansData()
    this.routerParam = this.$route.params.isOpenedIncidents
  }

  private getGuardiansData (): void {
    this.originalData = [
      {
        shortname: "Guama - Sede - North Road #1",
        last_sync: "2021-07-24T13:42:28.256Z",
        status: 'awaiting report',
        label: 'for 32 hours',
        id: 'c9d541166e12',
        events: [
          {
            last_sync: "2021-07-24T13:42:28.256Z",
            title: 'Chainsaw',
            detections: 240,
            created_by: null,
            id: 'c9d541166e13',
          },
          {
            last_sync: "2021-07-24T13:42:28.256Z",
            title: 'Chainsaw',
            detections: 582,
            created_by: null,
            id: 'c9d541166e14',
          }
        ]
      },
      {
        shortname: "Curaci - Jabota",
        last_sync: "2021-09-06T18:51:19.707Z",
        label: '- response time 29 hours',
        id: '2kg1xourixpz',
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
          }
        ]
      },
      {
        shortname: "Curaci - Elbe",
        last_sync: "2021-08-26T21:28:46.606Z",
        status: 'report submitted',
        label: '',
        id: 'ln6kx5ahqj4r',
        events: [
          {
            last_sync: "2021-08-26T21:28:46.606Z",
            title: 'Chainsaw',
            detections: 210,
            created_by: null,
            id: 'ln6kx5ahqj4a',
          },
          {
            last_sync: "2021-08-26T21:28:46.606Z",
            title: 'Chainsaw',
            detections: 82,
            created_by: null,
            id: 'ln6kx5ahqj5a',
          }
        ]
      },
      {
        shortname: "Guardian G",
        last_sync: "2021-08-26T21:28:46.606Z",
        status: 'report closed',
        label: 'response time 72 hours',
        id: 'ln6kx5ahqj4r',
        events: [
          {
            last_sync: "2021-08-26T21:28:46.606Z",
            title: 'Chainsaw',
            detections: 210,
            created_by: null,
            id: 'ln6kx5ahqj4a',
          },
          {
            last_sync: "2021-08-26T21:28:46.606Z",
            title: 'Chainsaw',
            detections: 82,
            created_by: null,
            id: 'ln6kx5ahqj5a',
          }
        ]
      }
    ]
    this.guardians = this.originalData
  }
}

