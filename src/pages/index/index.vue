<template>
  <div id="index-page">
    <navigation-bar-component />
    <div class="pt-10 px-20">
      <div class="bg-gray shadow overflow-hidden">
        <div>
          <div
            v-if="isLoading"
            class="bg-mirage-grey h-10 w-10"
            :style="{margin: '0 auto'}"
          >
            <svg
              class="animate-spin bg-mirage-grey text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <dl v-if="!isLoading && componentStreams !== undefined">
            <div
              v-for="(stream, index) of componentStreams"
              :key="stream.id"
              class="bg-gray px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-500"
            >
              <dt class="text-sm font-medium flex items-center">
                <div
                  :class="{'bg-red-500': stream.incidents && stream.incidents.length && isLastItemEvent(stream.incidents), 'bg-green-500': stream.incidents && (stream.incidents.length && !isLastItemEvent(stream.incidents) || !stream.incidents.length)}"
                  class="h-10 w-10 rounded-full inline-block mr-2 flex justify-center items-center"
                >
                  {{ (stream.responsesCount === 0 && stream.eventsCount !== 0) || (stream.incidents && stream.incidents.length && isLastItemEvent(stream.incidents)) ? stream.eventsCount : ' ' }}
                </div>
                <span class="text-white mr-1">#{{ index+1 }} {{ stream.name }}{{ stream.countryName? ', ' : '' }}</span>
                <span class="text-secondary italic">{{ stream.countryName }}</span>
              </dt>
              <dt class="text-sm font-medium flex items-center">
                <span
                  v-if="stream.incidents && !stream.incidents.length"
                  class="text-white"
                >
                  no events and responses
                </span>
                <span
                  v-if="stream.incidents && stream.incidents.length"
                  :class="{'ic-green' : !isLastItemEvent(stream.incidents), 'ic-pink': isLastItemEvent(stream.incidents)}"
                >
                  {{ getLabel(stream.incidents, stream.timezone) }}
                </span>
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./index.ts" lang="ts" />
