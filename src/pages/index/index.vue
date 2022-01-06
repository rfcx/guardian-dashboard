<template>
  <div id="index-page">
    <navigation-bar-component />
    <div class="pt-10 px-20 <sm:(px-3 pt-3)">
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
          <div
            v-if="incidents !== undefined && !incidents.length && !isLoading"
            class="px-4 py-5 text-sm font-medium whitespace-nowrap text-white"
          >
            No incidents data
          </div>
          <invalid-project-component v-if="incidents === undefined && !isLoading && auth?.isAuthenticated" />
          <div
            v-if="!auth?.isAuthenticated"
            class="px-4 py-5 lg:text-center"
          >
            <div class="lg:text-center">
              <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                Guardian Dashboard
              </p>
              <p class="mt-4 max-w-2xl text-xl leading-relaxed text-white lg:mx-auto">
                A dashboard for incidents and responses monitoring
              </p>
            </div>
          </div>
          <dl v-if="!isLoading && incidents !== undefined && incidents.length">
            <div
              v-for="incident of incidents"
              :key="incident.id"
              class="bg-gray px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 border-b border-gray-500"
            >
              <dt class="text-sm font-medium flex items-center">
                <div
                  :class="{'bg-red-500': getEventsCount(incident) !== 0, 'bg-green-500': getEventsCount(incident) === 0 || !getEventsCount(incident)}"
                  class="h-10 w-10 rounded-full rounded-full inline-block flex justify-center items-center min-w-10 truncate"
                >
                  <span> {{ getEventsCount(incident) || ' ' }} </span>
                </div>
                <router-link
                  v-if="incident !== undefined"
                  :to="{ path: '/project/' + getProjectId(incident.streamId) + '/incidents/'+ incident.id}"
                >
                  <span class="border-b border-gray-200 whitespace-nowrap text-white mx-2">#{{ incident.ref }} {{ getStreamName(incident.streamId) }} {{ getProjectName(incident.streamId)? ', ' : '' }}</span>
                </router-link>
                <svg
                  v-if="!getStreamName(incident.streamId)"
                  class="animate-spin bg-mirage-grey text-white inline-block h-5 w-5 mx-1 align-top"
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
                <span class="text-white">{{ getProjectName(incident.streamId) }}</span>
              </dt>
              <dt class="text-sm font-medium flex items-center justify-start <sm:(pl-12)">
                <span
                  v-if="incident.items && !incident.items.length && !incident.closedAt"
                  class="text-white"
                >
                  no events and responses
                </span>
                <span
                  v-if="incident.closedAt"
                  class="text-white"
                >
                  {{ getClosedLabel(incident.closedAt, getStreamTimezone(incident.streamId) || 'UTC') }}
                </span>
                <span
                  v-if="incident.items && incident.items.length && getEventsCount(incident) !== undefined && !incident.closedAt"
                  :class="{'text-white': !getEventsCount(incident), 'text-green-500': getEventsCount(incident) === 0, 'text-red-300': getEventsCount(incident) !== 0}"
                >
                  {{ getEventsCount(incident) !== 0 ? getEventsLabel(getLastEvents(incident), (getStreamTimezone(incident.streamId) || 'UTC')) : getResponsesLabel(incident, (getStreamTimezone(incident.streamId) || 'UTC')) }}
                </span>
              </dt>
            </div>
          </dl>
          <pagination-component
            v-if="!isLoading && incidents && incidents.length && isPaginationAvailable"
            :pagination-settings="paginationSettings"
            @selected-page="getIncidentsData()"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./index.ts" lang="ts" />
