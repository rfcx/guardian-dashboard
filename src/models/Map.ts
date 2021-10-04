import Mapbox from 'mapbox-gl'

export interface MapboxOptions {
  center: Mapbox.LngLatLike,
  zoom: number
}
