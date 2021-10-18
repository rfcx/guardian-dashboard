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
          <dl v-if="!isLoading">
            <div
              v-for="(project, index) of projects"
              :key="project.id"
              class="bg-gray px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-500"
            >
              <dt class="text-sm font-medium flex items-center">
                <div class="h-10 w-10 bg-red-500 rounded-full inline-block mr-2 flex justify-center items-center">
                  8
                </div>
                <span class="border-b border-gray-200 text-white mr-4">#{{ index+1 }} {{ project.name }}</span>
                <span class="text-white">Curaci, Tembe Reserve</span>
              </dt>
              <dt class="text-sm font-medium flex items-center">
                <span class="ic-pink">{{ formatDifferentFromNow('2021-10-05T13:42:28.256Z') }} no response</span>
              </dt>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./index.ts" lang="ts" />
