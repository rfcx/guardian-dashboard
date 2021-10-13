import { Vue, Options } from 'vue-class-component'
import { OnClickOutside } from '@vueuse/components'
import { Emit, Prop, Watch } from 'vue-property-decorator'
import Mapbox from 'mapbox-gl'
import MapboxSettings from '../../../config/map.json'
import { MapboxOptions } from '@/models'
import rawRangerTrack from '@/api/raw-ranger-track.json'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerTrackModalComponent extends Vue {

  @Prop({ default: null })
  rawRangerTrack!: any | null

  public mapOptions: MapboxOptions = {
    center: [100.19, 16.74],
    zoom: 13
  }
  public mapbox: any
  public isLoading: boolean = false

  @Watch('rawRangerTrack')
  onRawRangerTrackChange (): void {
    this.isLoading = true
    if (rawRangerTrack) {
      this.createMap()
    }
  }

  mounted (): void {
    this.isLoading = true
    if (rawRangerTrack) {
      this.createMap()
    }
  }

  @Emit('closeRangerTrack')
  public closeRangerTrack (): any {
    return { key: 'track', toggle: false }
  }

  async createMap() {
    try {
      Mapbox.accessToken = MapboxSettings.MAPBOX_ACCESS_TOKEN;
      this.mapbox = new Mapbox.Map({
        container: 'map',
        style: MapboxSettings.MAPBOX_STYLE,
        center: this.mapOptions.center,
        zoom: this.mapOptions.zoom,
      })
      this.isLoading = false
      this.mapbox.on('load', () => {
          // console.log('mapbox loaded', rawRangerTrack)
          this.mapbox.addSource('track',
            {
              'type': 'geojson',
              'data': rawRangerTrack
            }
          )
          // console.log('mapbox map', this.mapbox)
          this.mapbox.addLayer({
            'id': 'track',
            'type': 'line',
            'source': 'track',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': rawRangerTrack.features[0].properties.color,
              'line-width': 2
            }
          });
          const source = this.mapbox.getSource('track')
          console.log('mapbox source', source)
          this.mapbox.getCanvas().style.height = 'auto';
          this.mapbox.getCanvas().style.width = '100%';
        })
    } catch (err) {
      console.log('err', err)
    }
  }

  public close (): void {
    this.closeRangerTrack()
  }

}
