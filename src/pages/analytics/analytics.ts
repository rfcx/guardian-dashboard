import * as d3 from 'd3'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { ClusteredService, StreamService, VuexService } from '@/services'
import { Auth0Option, Clustered, EventType, Stream, StreamStatus } from '@/types'
import { getDayAndMonth, toTimeStr } from '@/utils'

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

  public clusteredData: Clustered[] | undefined

  mounted (): void {
    void this.onUpdatePage()
    void this.getClusteredEventsData()
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

  public async getClusteredEventsData (): Promise<void> {
    this.isLoading = true
    return await ClusteredService.getClusteredEvents({
      start: '2022-06-01T06:26:11.075Z',
      end: '2022-06-14T06:26:11.075Z',
      streams: ['75fx5x48thb8', '0zkza1k2x49p', 'hpf3y2eanftq', 'qsux48f0bcql', '0v7cy0hppg8t', 'jt4dq8r4lwxh', 'xqcth5uvwomx', 'ed9afhdxieso'],
      interval: '1h'
    }).then(res => {
      this.clusteredData = res.data
      void this.buildGraph(this.clusteredData)
    }).catch(e => {
      console.error('Error getting clustered events', e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public async buildGraph (clustereds: Clustered[]): Promise<void> {
    const margin = { top: 30, right: 30, bottom: 30, left: 50 }
    const width = 950 - margin.left - margin.right
    const height = 650 - margin.top - margin.bottom

    const graph = d3.select('#graphTest')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left.toString() + ',' + margin.top.toString() + ')')

    const dateValue = clustereds.map(c => getDayAndMonth(c.timeBucket))
    const timeValue = ['23:00', '22:00', '21:00', '20:00', '19:00', '18:00', '17:00', '16:00', '15:00', '14:00', '13:00', '12:00', '11:00', '10:00', '09:00', '08:00', '07:00', '06:00', '05:00', '04:00', '03:00', '02:00', '01:00', '00:00']

    const x = d3.scaleBand()
      .range([0, width])
      .domain(dateValue)
      .padding(0.05)

    graph.append('g')
      .attr('transform', 'translate(0, ' + height.toString() + ')')
      .call(d3.axisBottom(x))

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(timeValue)
      .padding(0.05)

    graph.append('g')
      .call(d3.axisLeft(y))

    const myColor = d3.scaleSequential()
      .interpolator(d3.interpolateRainbow)
      .domain([1, 100])

    graph.selectAll()
      .data(clustereds, function (d) { return `${getDayAndMonth(d?.timeBucket)} + ':' + ${toTimeStr(d?.timeBucket ?? '')}` })
      .enter()
      .append('rect')
      .attr('x', function (d) { return x(getDayAndMonth(d?.timeBucket) ?? '') ?? 100 })
      .attr('y', function (d) { return y(toTimeStr(d?.timeBucket ?? '') ?? '') ?? 100 })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', function (d) { return myColor(d.aggregatedValue) })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
  }
}
