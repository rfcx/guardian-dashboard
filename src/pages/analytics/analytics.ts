import * as d3 from 'd3'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { StreamService, VuexService } from '@/services'
import { Auth0Option, EventType, Stream, StreamStatus } from '@/types'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  }
})

export default class AnalyticsPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  public isLoading = true
  public streamsData: Stream[] | undefined
  public streamStatus: StreamStatus[] = []
  public streamSelected = false

  public selectedStream: string | undefined
  public typeSelected = false
  public eventType: EventType[] = [
    { type: 'chainsaw', label: 'Chainsaw', checked: true },
    { type: 'vehicle', label: 'Vehicle', checked: false },
    { type: 'gunshot', label: 'Gunshot', checked: false },
    { type: 'human voice', label: 'Human voice', checked: false },
    { type: 'bark', label: 'Bark', checked: false },
    { type: 'elephant', label: 'Elephant', checked: false },
    { type: 'fire', label: 'Fire', checked: false }
  ]

  mounted (): void {
    void this.onUpdatePage()
    void this.buildGraph()
  }

  data (): Record<string, unknown> {
    return {
      eventType: this.eventType,
      streamStatus: this.streamStatus,
      selectedStream: this.selectedStream,
      t: useI18n()
    }
  }

  public getSelectedType (): string | undefined {
    const s = this.eventType.find(e => e.checked)
    return s?.label
  }

  public toggleTypeMenu (): void {
    this.typeSelected = !this.typeSelected
  }

  public toggleType (type: EventType): void {
    this.eventType.forEach((e: EventType) => { e.checked = false })
    type.checked = true
    // TODO::Add action after selected type
  }

  public async getStreamsData (projectId?: string): Promise<void> {
    this.isLoading = true
    return await StreamService.getStreams({
      ...projectId !== undefined && { projects: [projectId] },
      limit: 100,
      offset: 0,
      limit_incidents: 1
    }).then(res => {
      this.streamsData = res.data
      res.data.forEach((s: Stream) => { this.streamStatus.push({ id: s.id, label: s.name, checked: false }) })
      this.streamStatus[0].checked = true
      this.getSelectedStream()
    }).catch(e => {
      console.error('Error getting streams with incidents', e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  async onUpdatePage (): Promise<void> {
    console.log(this.getProjectIdFromRouterParams())
    await this.getStreamsData(this.getProjectIdFromRouterParams())
  }

  public getProjectIdFromRouterParams (): string {
    const projectId: string = this.$route.params.projectId as string
    return projectId
  }

  public getSelectedStream (): string | undefined {
    const s = this.streamStatus.find(i => i.checked)
    return s?.label
  }

  public toggleStreamMenu (): void {
    this.streamSelected = !this.streamSelected
  }

  public toggleStream (stream: StreamStatus): void {
    this.streamStatus.forEach((s: StreamStatus) => { s.checked = false })
    stream.checked = true
    // TODO::Add action after selected stream
  }

  public async buildGraph (): Promise<void> {
    const margin = { top: 30, right: 30, bottom: 30, left: 30 }
    const width = 450 - margin.left - margin.right
    const height = 450 - margin.top - margin.bottom

    const graph = d3.select('#graphTest')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left.toString() + ',' + margin.top.toString() + ')')

    const myGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    const myVars = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10']

    const x = d3.scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01)

    graph.append('g')
      .attr('transform', 'translate(0, ' + height.toString() + ')')
      .call(d3.axisBottom(x))

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(myVars)
      .padding(0.01)

    graph.append('g')
      .call(d3.axisLeft(y))

    const myColor = d3.scaleSequential()
      .interpolator(d3.interpolateRainbow)
      .domain([1, 100])

    await d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv')
      .then(res => {
        graph.selectAll()
          .data(res, function (d) { return `${d?.group ?? ''} + ':' + ${d?.variable ?? ''}` })
          .enter()
          .append('rect')
          .attr('x', function (d) { return x(d?.group ?? '') ?? 100 })
          .attr('y', function (d) { return y(d.variable ?? '') ?? 100 })
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .style('fill', function (d) { return myColor(Number(d.value)) })
      }).catch(e => {
        console.error('Error getting data', e)
      }).finally(() => {
        this.isLoading = false
      })
  }
}
