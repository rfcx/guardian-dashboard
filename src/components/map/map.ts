import Mapbox, { LngLatLike } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import MapboxSettings from '../../../config/map.json'

export default class MapComponent extends Vue {
  @Prop({ default: [] })
  center!: LngLatLike | undefined

  @Prop({ default: 8 })
  zoom!: number

  @Prop({ default: '' })
  width!: string

  public mapbox?: Mapbox.Map
  public mapIndex = Math.floor(Math.random() * 1000)
  public isLoading = false
  public isError = false

  @Watch('mapData')
  onMapDataChange (): void {
    this.isLoading = true
    void this.createMap()
  }

  mounted (): void {
    this.isLoading = true
    void this.createMap()
  }

  async createMap (): Promise<void> {
    try {
      this.isError = false
      Mapbox.accessToken = MapboxSettings.MAPBOX_ACCESS_TOKEN
      this.mapbox = new Mapbox.Map({
        container: `map${this.mapIndex}`,
        style: MapboxSettings.MAPBOX_STYLE,
        center: this.center,
        zoom: this.zoom
      })
    } catch (err) {
      console.log('err', err)
      this.isError = true
    } finally {
      this.isLoading = false
    }
  }
}