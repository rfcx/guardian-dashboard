import Mapbox from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import MapboxSettings from '../../../config/map.json'

export default class MapComponent extends Vue {
  @Prop({ default: null })
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  mapData!: any | null

  @Prop({ default: '' })
  mapWidth!: string

  @Prop({ default: '' })
  mapIndex!: string

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public mapbox: any
  public isLoading = false

  @Watch('mapData')
  onMapDataChange (): void {
    this.isLoading = true
    void this.createMap()
  }

  mounted (): void {
    this.isLoading = true
    void this.createMap()
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async createMap (): Promise<any> {
    try {
      Mapbox.accessToken = MapboxSettings.MAPBOX_ACCESS_TOKEN
      this.mapbox = new Mapbox.Map({
        container: `map${this.mapIndex}`,
        style: MapboxSettings.MAPBOX_STYLE,
        center: this.mapData.center,
        zoom: this.mapData.zoom
      })
      this.isLoading = false
    } catch (err) {
      console.log('err', err)
    }
  }
}
