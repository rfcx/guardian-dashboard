<template>
  <div
    id="ranger-slider-component"
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
            <div>
              <div class="flex flex-row justify-between content-center pt-4 pb-2 px-4 border-b-1">
                <h1 class="text-xl text-white">
                  Attachments
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
              v-if="isLoading || !images.length"
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
              v-if="!isLoading && images.length"
              class="flex flex-row min-h-lg items-center justify-between"
              :style="{'background': 'center / contain no-repeat url(' + images[currentIndex].src + ')'}"
            >
              <a
                v-if="images.length > 1"
                class="cursor-pointer"
                title="Previous Image"
                @click="getPrevImage()"
              >
                <svg
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </a>
              <a
                v-if="images.length > 1"
                class="cursor-pointer"
                title="Next Image"
                @click="getNextImage()"
              >
                <svg
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
            <div class="flex justify-end px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <button
                v-if="!isError"
                :class="{'opacity-50 cursor-not-allowed': isDownloading}"
                :disabled="isDownloading"
                class="btn btn-primary flex items-center"
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
                :class="{'text-danger': isError}"
              >
                Error occurred
              </span>
            </div>
          </div>
        </OnClickOutside>
      </div>
    </div>
  </div>
</template>

<script src="./ranger-slider.ts" lang="ts" />
