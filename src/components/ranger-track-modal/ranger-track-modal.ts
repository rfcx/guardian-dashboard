import Mapbox from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { MapboxOptions } from '@/types'
import MapboxSettings from '../../../config/map.json'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerTrackModalComponent extends Vue {
  @Prop({ default: null })
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  rawRangerTrack!: any | null

  public mapOptions: MapboxOptions = {
    center: [100.19, 16.74],
    zoom: 13
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public mapbox: any
  public isLoading = false

  @Watch('rawRangerTrack')
  onRawRangerTrackChange (): void {
    this.isLoading = true
    void this.createMap()
  }

  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }

  mounted (): void {
    this.isLoading = true
    void this.createMap()
  }

  @Emit('closeRangerTrack')
  public closeRangerTrack (): boolean {
    return true
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async createMap (): Promise<any> {
    try {
      Mapbox.accessToken = MapboxSettings.MAPBOX_ACCESS_TOKEN
      this.mapbox = new Mapbox.Map({
        container: 'map',
        style: MapboxSettings.MAPBOX_STYLE,
        center: this.getPathCenter(),
        zoom: this.mapOptions.zoom
      })
      this.isLoading = false
      this.mapbox.on('load', () => {
        const arr = this.rawRangerTrack.features[0].geometry.coordinates
        const isOnePoint = arr.length === 1
        const point = isOnePoint ? arr[0] : arr[arr.length - 1]
        new Mapbox.Marker({
          draggable: false,
          color: '#bf0000'
        })
          .setLngLat(point)
          .addTo(this.mapbox)
        if (!isOnePoint) {
          this.mapbox.addSource('track',
            {
              type: 'geojson',
              data: this.rawRangerTrack
            }
          )
          this.mapbox.addLayer({
            id: 'track',
            type: 'line',
            source: 'track',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#bf0000',
              'line-width': 2
            }
          })
          const source = this.mapbox.getSource('track')
          console.log('mapbox source', source)
          this.mapbox.getCanvas().style.height = 'auto'
          this.mapbox.getCanvas().style.width = '100%'
        }
      })
    } catch (err) {
      console.log('err', err)
    }
  }

  public close (): void {
    this.closeRangerTrack()
  }

  public getPathCenter (): Mapbox.LngLatLike {
    const array = this.rawRangerTrack?.features[0].geometry.coordinates
    return array[Math.floor(array.length / 2)]
  }
}
