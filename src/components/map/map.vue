<template>
  <div
    v-if="!isLoading && !isError"
    :id="'map' + mapIndex"
    :class="classes"
  />
  <div>
    <img
      v-if="isError"
      class="h-9 <sm:h-7 h-min-7"
      src="/src/assets/error.svg"
      :title="$t('Error getting a map')"
      :alt="$t('Error getting a map')"
    >
    <img
      v-if="isLoading"
      class="h-8 w-8 animate-spin bg-steel-grey text-white"
      src="/src/assets/spinner.svg"
    >
  </div>
</template>

<script src="./map.ts" lang="ts" />

<style lang="scss">
  .mapboxgl-ctrl-logo {
    display: none !important;
  }
  .mapboxgl-ctrl-bottom-right {
    display: none !important;
  }
  .mapboxgl-canvas {
    height: 100%;
  }
</style>
