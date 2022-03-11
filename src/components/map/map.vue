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
      title="Error getting a map"
      alt="Error getting a map"
    >
    <img
      v-if="isLoading"
      class="h-8 w-8 animate-spin bg-steel-grey text-white"
      src="/src/assets/spinner.svg"
    >
  </div>
</template>

<script src="./map.ts" lang="ts" />
