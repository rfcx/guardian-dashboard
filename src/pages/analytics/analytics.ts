import * as d3 from 'd3'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Watch } from 'vue-property-decorator'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { ClusteredService, StreamService, VuexService } from '@/services'
import { Auth0Option, Clustered, ClusteredRequest, EventType, Stream, StreamStatus } from '@/types'
import { getDayAndMonth, toIsoStr, toTimeStr } from '@/utils'

import '@vuepic/vue-datepicker/dist/main.css'

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
  public isHaveData = false
  public showNumberOfEvents = false
  public selectedStream: string | undefined
  public typeSelected = false
  public valueDate: Date[] = []
  public clusteredRequest: ClusteredRequest = {
    start: '',
    end: '',
    streams: [],
    interval: '1h'
  }

  public eventType: EventType[] = [
    { type: 'all', label: 'All types', checked: true },
    { type: 'chainsaw', label: 'Chainsaw', checked: false },
    { type: 'vehicle', label: 'Vehicle', checked: false },
    { type: 'gunshot', label: 'Gunshot', checked: false },
    { type: 'human voice', label: 'Human voice', checked: false },
    { type: 'bark', label: 'Bark', checked: false },
    { type: 'elephant', label: 'Elephant', checked: false },
    { type: 'fire', label: 'Fire', checked: false }
  ]

  public clusteredData: Clustered[] | undefined

  @Emit()
  emitDateChange (): Date[] {
    this.dateValues = this.dateValues ?? [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]
    return this.dateValues
  }

  dateValues: [Date, Date] = [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]

  mounted (): void {
    void this.onUpdatePage()
    this.clusteredRequest = {
      start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
      end: new Date().toISOString(),
      streams: [],
      interval: '1h'
    }
  }

  @Watch('dateValues')
  onDateRangeChange (): void {
    this.emitDateChange()

    if (this.clusteredRequest !== undefined) {
      this.clusteredRequest.start = toIsoStr(this.dateValues[0])
      this.clusteredRequest.end = toIsoStr(this.dateValues[1].setHours(23, 59))
    }
    void this.getClusteredEventsData(this.clusteredRequest)
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    void this.onUpdatePage()
  }

  data (): Record<string, unknown> {
    return {
      eventType: this.eventType,
      streamStatus: this.streamStatus,
      selectedStream: this.selectedStream,
      isHaveData: this.isHaveData,
      showNumberOfEvents: this.showNumberOfEvents,
      dateValues: this.dateValues,
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

  public toggleType (t: EventType): void {
    this.eventType.forEach((e: EventType) => { e.checked = false })
    t.checked = true
    if (this.clusteredRequest !== undefined) {
      if (t.type === 'all') {
        this.clusteredRequest.classifications = undefined
      } else {
        this.clusteredRequest.classifications = t.type
      }
    }
    void this.getClusteredEventsData(this.clusteredRequest)
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
      this.streamStatus.push({ id: 'all', label: this.$t('All streams'), checked: true })
      res.data.forEach((s: Stream) => { this.streamStatus.push({ id: s.id, label: s.name, checked: false }) })
      this.getSelectedStream()
      if (this.clusteredRequest !== undefined) {
        this.clusteredRequest.streams = res.data.map(i => i.id)
      }
      void this.getClusteredEventsData(this.clusteredRequest)
    }).catch(e => {
      this.isLoading = false
      console.error(this.$t('Can not getting streams with incidents'), e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  async onUpdatePage (): Promise<void> {
    await this.getStreamsData(this.getProjectIdFromRouterParams())
  }

  public getProjectIdFromRouterParams (): string {
    const projectId: string = this.$route.params.projectId as string
    return projectId
  }

  public getSelectedStream (): string {
    const s = this.streamStatus.find(i => i.checked)
    return s?.label ?? this.$t('All streams')
  }

  public toggleStreamMenu (): void {
    this.streamSelected = !this.streamSelected
  }

  public toggleStream (stream: StreamStatus): void {
    stream.checked = !stream.checked
    if (this.clusteredRequest !== undefined) {
      const notSelectedAnyStream = this.streamStatus.filter(s => s.checked).map(i => i.id).length === 0
      if (stream.id === 'all' || notSelectedAnyStream) {
        this.streamStatus.forEach((s: StreamStatus) => { s.checked = s.id === 'all' })
        this.clusteredRequest.streams = this.streamStatus.map(s => s.id)
        void this.getClusteredEventsData(this.clusteredRequest)
        return
      } else {
        this.streamStatus[0].checked = false
      }
      this.clusteredRequest.streams = this.streamStatus.filter(s => s.checked).map(i => i.id)
    }
    void this.getClusteredEventsData(this.clusteredRequest)
  }

  public async getClusteredEventsData (request: ClusteredRequest): Promise<void> {
    this.isLoading = true
    d3.select('#heatmapGraph').selectAll('*').remove()
    d3.select('#scaleOfHeatmapGraph').selectAll('*').remove()

    return await ClusteredService.getClusteredEvents(request).then(res => {
      this.clusteredData = res.data
      void this.buildGraph(this.clusteredData)
    }).catch(e => {
      console.error(this.$t('Can not getting clustered events'), e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public buildScaleGraph (): void {
    const myColor = d3.scaleLinear<string, number>()
      .range(['#1f005c', '#FFB85C'])
      .domain([1, 100])

    const svg = d3.select('#scaleOfHeatmapGraph')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(5, 5)')

    const a = [{ x: '0', y: '1', v: 0 },
      { x: '10', y: '1', v: 10 },
      { x: '20', y: '1', v: 20 },
      { x: '30', y: '1', v: 30 },
      { x: '40', y: '1', v: 40 },
      { x: '50', y: '1', v: 50 },
      { x: '60', y: '1', v: 60 },
      { x: '70', y: '1', v: 70 },
      { x: '80', y: '1', v: 80 },
      { x: '90', y: '1', v: 90 }
    ]

    const svgX = d3.scaleBand()
      .range([0, 500])
      .domain(a.map(a => a.x))
      .padding(0)

    const lineX = d3.scaleLinear()
      .range([0, 500])
      .domain([0, 100])

    svg.append('g')
      .attr('transform', 'translate(0, 30)')
      .call(d3.axisBottom(lineX))

    svg.selectAll()
      .data(a, function (d) { return `${d?.x ?? ''} + ':' + ${d?.y ?? ''}` })
      .enter()
      .append('rect')
      .attr('x', function (d) { return svgX(d?.x ?? '') ?? 0 })
      .attr('y', function (d) { return 1 })
      .attr('width', svgX.bandwidth())
      .attr('height', 25)
      .style('fill', function (d) { return myColor(d.v) })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
  }

  public async buildGraph (clustereds: Clustered[]): Promise<void> {
    this.showNumberOfEvents = clustereds.length !== 0
    this.isHaveData = clustereds.length === 0
    if (clustereds.length === 0) {
      return
    }

    const dateValue = clustereds.map(c => getDayAndMonth(c.timeBucket))
    const timeValue = ['23:00', '22:00', '21:00', '20:00', '19:00', '18:00', '17:00', '16:00', '15:00', '14:00', '13:00', '12:00', '11:00', '10:00', '09:00', '08:00', '07:00', '06:00', '05:00', '04:00', '03:00', '02:00', '01:00', '00:00']

    const margin = { top: 30, right: 30, bottom: 30, left: 50 }
    const width = ([...new Set(dateValue)].length * 150) - margin.left - margin.right
    const height = 600 - margin.top - margin.bottom

    const graph = d3.select('#heatmapGraph')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left.toString() + ',' + margin.top.toString() + ')')

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

    const myColor = d3.scaleLinear<string, number>()
      .range(['#1f005c', '#FFB85C'])
      .domain([1, 100])

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#000')
      .style('opacity', 0)

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
      .on('mousemove', () => {
        tooltip.style('opacity', 1)
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0)
      })
      .on('mouseover', (event, d) => {
        let eventText = ''
        if (d.aggregatedValue === 1) {
          eventText = 'event'
        } else {
          eventText = 'enents'
        }
        tooltip.text(`${this.$t('Have')} ${d.aggregatedValue} ${eventText} ${this.$t('on')} ${getDayAndMonth(d?.timeBucket)} ${toTimeStr(d?.timeBucket ?? '')}`)
        tooltip.style('visibility', 'visible')
          .style('left', (event.pageX - 40).toString() + 'px')
          .style('top', (event.pageY - 45).toString() + 'px')
      })

    void this.buildScaleGraph()
  }
}
