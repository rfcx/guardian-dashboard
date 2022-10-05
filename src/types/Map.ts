import Mapbox from 'mapbox-gl'

export interface MapboxOptions {
  center: Mapbox.LngLatLike
  zoom: number
}

export interface MapboxOptionsWTitle extends MapboxOptions {
  title: string
}
