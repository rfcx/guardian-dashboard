<template>
  <div
    id="ranger-player-modal-component"
    class="fixed inset-0 z-10 bg-mirage-grey bg-opacity-75 transition-opacity overflow-y-auto h-full w-full"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="flex justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
      />
      <div class="inline-block bg-steel-grey rounded text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <OnClickOutside @trigger="close">
          <div>
            <div class="flex flex-row justify-between content-center pt-4 pb-2 px-4 border-b-1">
              <h1 class="text-xl text-white">
                Play Sound
              </h1>
              <a
                class="cursor-pointer"
                @click="close()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div
            v-if="isLoading || !audioProp"
            class="flex flex-row bg-steel-grey h-10 w-10 min-h-lg"
            :style="{margin: '0 auto'}"
          >
            <svg
              class="animate-spin bg-steel-grey text-white"
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
          <div
            v-if="!isLoading"
            class="flex flex-row min-h-lg items-center justify-center relative overflow-hidden"
          >
            <div
              class="absolute w-full h-full left-0 right-0 z-0 opacity-40"
              style="background: no-repeat url('/src/assets/microphone.svg'); background-size: 60%; background-position: 118% 82%;"
            />
            <a
              class="cursor-pointer relative z-1"
              :title="isPlaying? 'Stop' : 'Play'"
              @click.prevent="toggleSound()"
            >
              <svg
                v-if="!isPlaying"
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-if="isPlaying"
                xmlns="http://www.w3.org/2000/svg"
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </div>
          <div class="flex justify-end px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <button
              v-if="!isError"
              :class="{'opacity-50 cursor-not-allowed': isDownloading}"
              :disabled="isDownloading"
              class="btn btn-primary"
              @click="downloadAssets()"
            >
              <img
                class="h-5 w-5 inline-block align-top mr-0.5"
                src="/src/assets/download.svg"
                alt=""
              >
              Download
            </button>
            <span
              v-else
              class="text-sm font-medium text-white px-3 py-2.5"
              :class="{'ic-pink': isError}"
            >
              Error occurred
            </span>
          </div>
        </OnClickOutside>
      </div>
    </div>
  </div>
</template>

<script src="./ranger-player-modal.ts" lang="ts" />
