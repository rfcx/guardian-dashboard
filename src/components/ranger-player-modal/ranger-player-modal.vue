<template>
  <div
    id="player"
    class="bg-mirage-grey bg-opacity-75 rounded-lg px-2 py-1 flex flex-row items-center h-30px"
  >
    <button
      class="cursor-pointer relative z-1 focus:outline-none mr-2"
      :title="isPlaying? $t('Stop') : $t('Play')"
      @click="toggleSound()"
    >
      <img
        v-if="!isLoading && isPlaying"
        class="inline-block"
        src="/src/assets/pause.svg"
        alt=""
      >
      <img
        v-if="!isLoading && !isPlaying"
        class="inline-block"
        src="/src/assets/play.svg"
        alt=""
      >
      <img
        v-if="isLoading"
        class="h-2.5 w-2.5 animate-spin bg-mirage-grey text-white"
        src="/src/assets/spinner.svg"
      >
    </button>
    <div class="text-gray-500 mr-2">
      <span class="text-xs">{{ audioProp.current }}</span>
      /
      <span class="text-xs">{{ audioProp.total }}</span>
    </div>
    <div
      v-if="!isError"
      class="w-100px rounded-full h-2.5 bg-gray-600 mr-2"
      @click="onProgressClicked($event)"
    >
      <div
        class="bg-gray-300 h-2.5 rounded-full"
        :style="{'width': progress + '%'}"
      />
    </div>
    <div
      v-if="isError"
      class="w-100px text-xs px-2"
    >
      {{ $t('Error occured') }}
    </div>
  </div>
</template>

<script src="./ranger-player-modal.ts" lang="ts" />
