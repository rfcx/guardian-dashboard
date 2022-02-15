<template>
  <div id="index-page">
    <div class="bg-gray shadow overflow-hidden <sm:pt-0">
      <div class="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 mb-5 bg-steel-grey rounded-md">
        <div
          title="Stream"
          class="flex justify-start items-center whitespace-nowrap"
        >
          <img
            v-if="!stream"
            class="h-5 w-5 animate-spin bg-steel-grey text-white"
            src="/src/assets/spinner.svg"
          >
          <span
            v-if="stream !== undefined"
            class="text-secondary text-xl mr-2"
          >
            {{ getStreamName() }}
          </span>
          <div
            v-if="stream && stream.tags && stream.tags.length"
            class="flex justify-start"
          >
            <div
              v-for="tag of stream.tags"
              :key="tag"
              class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide btn-tag leading-none capitalize"
              :class="{'bg-blue-500 bg-opacity-70': tag === 'recent', 'bg-red-400 bg-opacity-70': tag === 'hot', 'bg-green-600 bg-opacity-70': tag === 'open'}"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        <div class="justify-self-end <sm:hidden">
          <span class="text-secondary text-sm font-medium">Response time</span>
        </div>
        <div class="col-span-3 flex flex-col">
          <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div class="overflow-hidden">
                <div
                  v-if="isLoading"
                  class="mb-4"
                >
                  <img
                    class="flex flex-row bg-steel-grey h-10 w-10 animate-spin"
                    :style="{margin: '0 auto'}"
                    src="/src/assets/spinner.svg"
                  >
                </div>
                <incidents-table-rows
                  v-if="!isLoading && incidents && incidents.length && stream && stream.timezone"
                  :timezone="stream.timezone"
                  :items="incidents"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <pagination-component
      v-if="!isLoading && stream && isPaginationAvailable"
      :pagination-settings="paginationSettings"
      @selected-page="getPage()"
    />
  </div>
</template>
<script src="./index.ts" lang="ts" />
