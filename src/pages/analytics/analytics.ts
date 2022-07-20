import * as d3 from 'd3'
import dayjs, { Dayjs, utc } from 'dayjs'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Watch } from 'vue-property-decorator'

import DropdownCheckboxes from '@/components/dropdown-checkboxes/dropdown-checkboxes.vue'
import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { ClusteredService, StreamService, VuexService } from '@/services'
import { Auth0Option, Clustered, ClusteredRequest, DropdownItem, Stream } from '@/types'
import { getDayAndMonth, toMonthYearStr, toTimeStr } from '@/utils'

import '@vuepic/vue-datepicker/dist/main.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
dayjs.extend(utc as any)

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
  public streamStatus: DropdownItem[] = []
  public isHaveData = false
  public showNumberOfEvents = false
  public selectedStream: string | undefined
  public valueDate: Date[] = []
  public timezone = 'UTC'
  public timezoneOffsetMins = 0
  public clusteredRequest: ClusteredRequest | undefined

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

  dateValues: [string, string] | undefined

  mounted (): void {
    void this.onUpdatePage()
  }

  @Watch('dateValues')
  onDateRangeChange (): void {
    if (this.clusteredRequest !== undefined && this.dateValues !== undefined) {
      const startMonth = dayjs(this.dateValues[0]).month()
      const endMonth = dayjs(this.dateValues[1]).month()
      const startYear = dayjs(this.dateValues[0]).year()
      const endYear = dayjs(this.dateValues[1]).year()
      d3.select('#heatmapGraph').selectAll('*').remove()

      const requests: ClusteredRequest[] = []
      for (let index = startYear; index <= endYear; index++) {
        if (startYear === endYear) {
          this.setClusteredRequest(startMonth, endMonth, index).forEach(request => {
            console.log(request)
            requests.push(request)
          })
        } else if (index === startYear) {
          this.setClusteredRequest(startMonth, 11, index).forEach(request => {
            requests.push(request)
          })
        } else if (index === endYear) {
          this.setClusteredRequest(0, endMonth, index).forEach(request => {
            requests.push(request)
          })
        } else {
          this.setClusteredRequest(0, 11, index).forEach(request => {
            requests.push(request)
          })
        }
      }

      requests.forEach((request, index) => {
        void this.getClusteredEventsData(request, index === 0)
      })
    }
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    void this.onUpdatePage()
  }

  data (): Record<string, unknown> {
    return {
      eventType: this.eventType,
      streamStatus: this.streamStatus,
      isHaveData: this.isHaveData,
      showNumberOfEvents: this.showNumberOfEvents,
      dateValues: this.dateValues,
      t: useI18n()
    }
  }

  public setClusteredRequest (startMonth: number, endMonth: number, year: number): ClusteredRequest[] {
    if (!this.clusteredRequest) return []
    if (!this.dateValues) return []

    const requests: ClusteredRequest[] = []
    for (let index = startMonth; index <= endMonth; index++) {
      const clustered: ClusteredRequest = {
        start: '',
        end: '',
        streams: this.clusteredRequest.streams,
        classifications: this.clusteredRequest.classifications,
        interval: '1h',
        limit: 1000
      }
      if (startMonth === endMonth) {
        clustered.start = dayjs.utc(this.dateValues[0]).year(year).startOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
        clustered.end = dayjs.utc(this.dateValues[1]).year(year).endOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
      } else if (index === startMonth) {
        clustered.start = dayjs.utc(this.dateValues[0]).year(year).startOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
        clustered.end = dayjs.utc().month(index).year(year).endOf('month').endOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
      } else if (index === endMonth) {
        clustered.start = dayjs.utc().month(index).year(year).startOf('month').startOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
        clustered.end = dayjs.utc(this.dateValues[1]).year(year).endOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
      } else {
        clustered.start = dayjs.utc().month(index).year(year).startOf('month').startOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
        clustered.end = dayjs.utc().month(index).year(year).endOf('month').endOf('day').subtract(this.timezoneOffsetMins, 'minutes').toISOString()
      }
      requests.push(clustered)
    }
    return requests
  }

  public getSelectedType (): string | undefined {
    const s = this.eventType.find(e => e.checked)
    return s?.label
  }

  public toggleType (t: DropdownItem[]): void {
    if (t[0].value === 'all') {
      this.eventType.forEach((e: DropdownItem) => { e.checked = (e.value === 'all') })
      const types = this.eventType.map(e => e.value)
      types.shift()

      if (this.clusteredRequest !== undefined) {
        this.clusteredRequest.classifications = types
        void this.getClusteredEventsData(this.clusteredRequest, true)
      }
      return
    } else {
      this.eventType[0].checked = false
    }
    if (this.clusteredRequest !== undefined) {
      this.clusteredRequest.classifications = this.eventType.filter(e => e.checked).map(i => i.value)
      void this.getClusteredEventsData(this.clusteredRequest, true)
    }
  }

  public initFilterOptions (): void {
    const utcStart = dayjs.utc().subtract(7, 'days').startOf('day')
    const utcEnd = dayjs.utc().endOf('day')
    this.clusteredRequest = {
      start: utcStart.subtract(this.timezoneOffsetMins, 'minutes').toISOString(),
      end: utcEnd.subtract(this.timezoneOffsetMins, 'minutes').toISOString(),
      streams: [],
      interval: '1h',
      limit: 1000
    }
    this.dateValues = [utcStart.format('YYYY-MM-DD'), utcEnd.format('YYYY-MM-DD')]
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
      this.timezone = res.data.length > 0 ? res.data[0].timezone : this.timezone
      this.timezoneOffsetMins = dayjs.tz(Date.now(), this.timezone).utcOffset()
      this.initFilterOptions()
      this.streamStatus.push({ value: 'all', label: this.$t('All streams'), checked: true })
      res.data.forEach((s: Stream) => { this.streamStatus.push({ value: s.id, label: s.name, checked: false }) })
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
    if (this.clusteredRequest !== undefined) {
      void this.getClusteredEventsData(this.clusteredRequest, true)
    }
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

  public toggleStream (streams: DropdownItem[]): void {
    if (this.clusteredRequest !== undefined) {
      if (streams[0].value === 'all') {
        this.streamStatus.forEach((s: DropdownItem) => { s.checked = (s.value === 'all') })
        const streams = this.streamStatus.map(s => s.value)
        streams.shift()

        this.clusteredRequest.streams = streams
        void this.getClusteredEventsData(this.clusteredRequest, true)
        return
      } else {
        this.streamStatus[0].checked = false
      }
      this.clusteredRequest.streams = this.streamStatus.filter(s => s.checked).map(i => i.value)
    }
    if (this.clusteredRequest !== undefined) {
      void this.getClusteredEventsData(this.clusteredRequest, true)
    }
  }

  public async getClusteredEventsData (request: ClusteredRequest, reset: boolean): Promise<void> {
    this.isLoading = true

    return await ClusteredService.getClusteredDetections(request).then(res => {
      this.clusteredData = res.data.map(i => {
        i.timeBucket = dayjs.utc(i.timeBucket).add(this.timezoneOffsetMins, 'minutes').toISOString()
        return i
      })
      if (reset) d3.select('#heatmapGraph').selectAll('*').remove()
      void this.buildGraph(this.clusteredData, request)
    }).catch(e => {
      console.error(this.$t('Can not getting clustered events'), e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public getDomainArray = function (maxNum: number): Item[] {
    const arr = []
    const minusWith = maxNum <= 100 ? 10 : maxNum >= 1000 ? 100 : 50
    let loop = maxNum - minusWith
    while (loop >= 0) {
      arr.push({ x: loop, y: 1, value: loop })
      loop -= minusWith
    }
    return arr.sort((a, b) => (a.x < b.x ? -1 : 1))
  }

  public buildScaleGraph (max: number): void {
    d3.select('#scaleOfHeatmapGraph').selectAll('*').remove()

    const myColor = d3.scaleLinear<string, number>()
      .range(['#ffffff', '#015a32'])
      .domain([1, max])

    const svg = d3.select('#scaleOfHeatmapGraph')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(5, 5)')

    const domain = this.getDomainArray(max)
    const svgX = d3.scaleBand()
      .range([0, 500])
      .domain(domain.map(i => i.x.toString()))
      .padding(0)

    const lineX = d3.scaleLinear()
      .range([0, 500])
      .domain([0, max])

    svg.append('g')
      .attr('transform', 'translate(0, 30)')
      .call(d3.axisBottom(lineX))

    svg.selectAll()
      .data(domain, function (d) { return `${d?.x ?? ''} + ':' + ${d?.y ?? ''}` })
      .enter()
      .append('rect')
      .attr('x', function (d) { return svgX(d?.x.toString() ?? '') ?? 0 })
      .attr('y', function (d) { return 1 })
      .attr('width', svgX.bandwidth())
      .attr('height', 25)
      .style('fill', function (d) { return myColor(d.value) })
      .style('stroke-width', 4)
      .style('stroke', 'none')
      .style('opacity', 0.8)
  }

  public getDateArray = function (start: Dayjs, end: Dayjs): Date[] {
    const arr = []
    while (start.toDate() <= end.toDate()) {
      arr.push(start.toDate())
      start = start.add(1, 'day')
    }
    return arr
  }

  public async buildGraph (clustereds: Clustered[], request: ClusteredRequest): Promise<void> {
    const el = document.createElement('div')
    el.classList.add('pl-11')
    el.classList.add('mt-5')
    el.classList.add('font-semibold')
    let title = this.$t(toMonthYearStr(request.start))
    if (clustereds.length === 0) {
      title = this.$t(toMonthYearStr(request.start)) + ' - ' + this.$t('No data')
    }
    el.innerHTML = '<span>' + title + '</span>'
    const box = document.getElementById('heatmapGraph')
    box?.appendChild(el)

    this.showNumberOfEvents = clustereds.length !== 0
    this.isHaveData = clustereds.length === 0
    if (clustereds.length === 0) {
      return
    }
    const utcGlobalStart = dayjs.utc(request.start).add(this.timezoneOffsetMins, 'minutes')
    const utcGlobalEnd = dayjs.utc(request.end).add(this.timezoneOffsetMins, 'minutes')
    const dateValue = this.getDateArray(utcGlobalStart, utcGlobalEnd).map(c => getDayAndMonth(c))
    const margin = { top: 20, right: 30, bottom: 30, left: 50 }
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
      .domain([...this.generateTimes(0, 24)])
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
        tooltip.text(`${d.aggregatedValue} ${eventText} ${this.$t('at')} ${getDayAndMonth(d?.timeBucket)} ${toTimeStr(d?.timeBucket ?? '')}`)
        tooltip.style('visibility', 'visible')
          .style('left', (event.pageX - 40).toString() + 'px')
          .style('top', (event.pageY - 45).toString() + 'px')
      })

    void this.buildScaleGraph(100)
  }

  public generateTimes (startHour: number, stopHour: number): string[] {
    const hrs = []
    for (let h = startHour; h < stopHour; ++h) {
      const hh = h.toString().padStart(2, '0')
      hrs.push(`${hh}:00`)
    }
    return hrs
  }

  public roundnum (num: number): number {
    return Math.round(Math.round(num / 25) / 2) * 50
  }
}

interface Item {
  x: number
  y: number
  value: number
}
