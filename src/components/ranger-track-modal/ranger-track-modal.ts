import Mapbox from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
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
        center: this.mapOptions.center,
        zoom: this.mapOptions.zoom
      })
      this.isLoading = false
      this.mapbox.on('load', () => {
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
            'line-color': this.rawRangerTrack.features[0].properties.color,
            'line-width': 2
          }
        })
        const source = this.mapbox.getSource('track')
        console.log('mapbox source', source)
        this.mapbox.getCanvas().style.height = 'auto'
        this.mapbox.getCanvas().style.width = '100%'
      })
    } catch (err) {
      console.log('err', err)
    }
  }

  public close (): void {
    this.closeRangerTrack()
  }
}
