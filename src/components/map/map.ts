import Mapbox, { LngLatLike } from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Prop, Watch } from 'vue-property-decorator'

import MapboxSettings from '../../../config/map.json'

export default class MapComponent extends Vue {
  @Prop({ default: [] })
  center!: LngLatLike | undefined

  @Prop({ default: 8 })
  zoom!: number

  @Prop({ default: false })
  marker!: boolean

  @Prop({ default: '' })
  classes!: string

  public mapbox?: Mapbox.Map
  public mapIndex = Math.floor(Math.random() * 1000)
  public isLoading = false
  public isError = false

  @Watch('mapData')
  onMapDataChange (): void {
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
      if (this.marker && this.center !== undefined) {
        new Mapbox.Marker({ color: 'red', scale: 0.5 })
          .setLngLat(this.center)
          .addTo(this.mapbox)
      }
    } catch (err) {
      console.log('err', err)
      this.isError = true
    } finally {
      this.isLoading = false
    }
  }
}
