import * as d3 from 'd3'
import dayjs from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Watch } from 'vue-property-decorator'

import DropdownCheckboxes from '@/components/dropdown-checkboxes/dropdown-checkboxes.vue'
import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { ClusteredService, StreamService, VuexService } from '@/services'
import { Auth0Option, Clustered, ClusteredRequest, DropdownItem, Stream, StreamStatus } from '@/types'
import { getDayAndMonth, toTimeStr } from '@/utils'

import '@vuepic/vue-datepicker/dist/main.css'

@Options({
  components: {
    'nav-bar': NavigationBarComponent,
    DropdownCheckboxes
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
    start: dayjs.utc().subtract(7, 'days').startOf('day').toISOString(),
    end: dayjs.utc().endOf('day').toISOString(),
    streams: [],
    interval: '1h',
    limit: 1000
  }

  public eventType: DropdownItem[] = [
    { value: 'all', label: 'All types', checked: true },
    { value: 'chainsaw', label: 'Chainsaw', checked: false },
    { value: 'vehicle', label: 'Vehicle', checked: false },
    { value: 'gunshot', label: 'Gunshot', checked: false },
    { value: 'human voice', label: 'Human voice', checked: false },
    { value: 'bark', label: 'Bark', checked: false },
    { value: 'elephant', label: 'Elephant', checked: false },
    { value: 'fire', label: 'Fire', checked: false }
  ]

  public clusteredData: Clustered[] | undefined

  @Emit()
  emitDateChange (): string[] {
    return this.dateValues ?? [dayjs().utc().subtract(7, 'days').format('YYYY-MM-DD'), dayjs.utc().format('YYYY-MM-DD')]
  }

  dateValues: [string, string] = [dayjs.utc().subtract(7, 'days').format('YYYY-MM-DD'), dayjs.utc().format('YYYY-MM-DD')]

  mounted (): void {
    void this.onUpdatePage()
  }

  @Watch('dateValues')
  onDateRangeChange (): void {
    this.emitDateChange()

    if (this.clusteredRequest !== undefined) {
      this.clusteredRequest.start = `${this.dateValues[0]}T00:00:00.000Z`
      this.clusteredRequest.end = `${this.dateValues[1]}T23:59:59.999Z`
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

  public toggleType (t: DropdownItem[]): void {
    if (t[0].value === 'all') {
      this.eventType.forEach((e: DropdownItem) => { e.checked = (e.value === 'all') })
      const types = this.eventType.map(e => e.value)
      types.shift()

      this.clusteredRequest.classifications = types
      void this.getClusteredEventsData(this.clusteredRequest)
      return
    } else {
      this.eventType[0].checked = false
    }
    this.clusteredRequest.classifications = this.eventType.filter(e => e.checked).map(i => i.value)
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
      this.streamsData = []
      this.streamStatus = []
      this.streamsData = res.data
      this.streamStatus.push({ id: 'all', label: this.$t('All streams'), checked: true })
      res.data.forEach((s: Stream) => { this.streamStatus.push({ id: s.id, label: s.name, checked: false }) })
      this.getSelectedStream()
      this.refreshClusteredEvents()
    }).catch(e => {
      this.isLoading = false
      console.error(this.$t('Can not getting streams with incidents'), e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public refreshClusteredEvents (): void {
    if (this.clusteredRequest !== undefined && this.streamsData !== undefined) {
      this.clusteredRequest.streams = this.streamsData.map(i => i.id)
    }
    void this.getClusteredEventsData(this.clusteredRequest)
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
        const streams = this.streamStatus.map(s => s.id)
        streams.shift()
        this.clusteredRequest.streams = streams
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

    return await ClusteredService.getClusteredDetections(request).then(res => {
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
      .range(['#ffffff', '#015a32'])
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
    const container = document.querySelector('#analytics-page') as HTMLElement
    const width = container.offsetWidth
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
      .range(['#ffffff', '#015a32'])
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
        const eventText = `detection${d.aggregatedValue > 1 ? 's' : ''}`
        tooltip.text(`${this.$t('Have')} ${d.aggregatedValue} ${eventText} ${this.$t('on')} ${getDayAndMonth(d?.timeBucket)} ${toTimeStr(d?.timeBucket ?? '')}`)
        tooltip.style('visibility', 'visible')
          .style('left', (event.pageX - 40).toString() + 'px')
          .style('top', (event.pageY - 45).toString() + 'px')
      })

    void this.buildScaleGraph()
  }
}
