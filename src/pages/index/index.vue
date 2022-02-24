<template>
  <div id="index-page">
    <div
      v-if="isDataValid"
      class="bg-gray shadow overflow-hidden <sm:pt-0"
    >
      <div class="inline-flex items-center px-4 py-2 rounded-md shadow-sm bg-steel-grey w-60 <sm:mb-2">
        <input
          id="closedIncidents"
          v-model="incidentsClosed.checked"
          name="closedIncidents"
          value="incidentsClosed.value"
          type="checkbox"
          class="h-3 w-3 rounded bg-gray text-gray-500 focus:ring-transparent"
          @change="getPage()"
        >
        <label
          for="closedIncidents"
          class="ml-3 min-w-0 flex-1 text-white text-sm font-medium whitespace-nowrap"
        >
          {{ incidentsClosed.label }}
        </label>
      </div>
      <div class="mt-5 px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 mb-5 bg-steel-grey rounded-md">
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
    <invalid-page-state-component
      v-if="!isDataValid"
      :message="'This stream either does not exist or you do not have permission to access it'"
    />
  </div>
</template>
<script src="./index.ts" lang="ts" />
