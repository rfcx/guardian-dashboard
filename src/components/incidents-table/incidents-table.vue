<template>
  <router-link
    v-for="(incident, i) in itemsData"
    :key="i"
    :to="{ path: '/project/' + incident.projectId + '/incidents/'+ incident.id}"
    tag="tr"
    class="flex flex-row cursor-pointer content-center hover:bg-gray-300 hover:bg-opacity-5 <sm:flex-col"
    :class="{ 'border-b border-gray-700': itemsData.length > 1 && i !== itemsData.length - 1 }"
  >
    <div class="pr-2 py-2 flex flex-nowrap justify-start items-end flex-1 <sm:py-1">
      <span class="text-white text-xl mr-1">#{{ incident.ref }}</span>
      <div
        v-if="incident.closedAt"
        class="px-3 shadow-sm inline-block mr-2 flex self-center items-center text-sm tracking-wide btn-tag leading-none bg-gray-500"
      >
        Closed
      </div>
    </div>
    <div class="pr-2 py-2 flex flex-1 justify-start flex-wrap items-end text-secondary <sm:py-1">
      <img
        v-if="incident.events.length"
        title="Events"
        class="h-5 w-5 inline-block mb-0.7 mr-2"
        src="/src/assets/alert.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary inline-block mr-2"
        :title="incident.eventsTitle"
      >
        {{ incident.eventsLabel }}
      </div>
      <div
        v-if="incident.events.length"
        class="inline-block flex flex-row"
      >
        <div
          v-for="event in getEventsCount(incident.events)"
          :key="event.value"
          class="text-sm text-secondary flex inline-block mr-3"
          :title="getIconTitle(event.count, event.value)"
        >
          <img
            class="h-5 w-5 inline-block text-gray-500 mb-0.7 mr-1"
            :src="`https://static.rfcx.org/img/guardian/ic_${event.value}.svg`"
            alt=""
            @error="setDefaultReportImg"
          >
          <span
            class="text-sm self-end text-center inline-block"
          >
            {{ event.count || '' }}
          </span>
        </div>
      </div>
    </div>
    <div class="pr-2 py-2 flex-1 text-secondary flex items-end justify-end <sm:justify-start <sm:py-1">
      <img
        v-if="incident.responses.length"
        title="Response"
        class="h-5 w-5 inline-block mb-0.7 mr-2"
        src="/src/assets/response.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary inline-block"
        :title="incident.responseTitle"
      >
        {{ incident.responseLabel }}
      </div>
    </div>
    <div
      class="pr-2 py-2 flex-1 flex items-end justify-end <sm:justify-start <sm:py-1"
      title="Difference between a first event start time and a first response was submitted in the Guardian App"
    >
      <span class="text-secondary text-sm font-medium mr-3 sm:hidden">Response time</span>
      <span class="text-base"> {{ getResponseTime(incident) }} </span>
    </div>
  </router-link>
</template>

<script src="./incidents-table.ts" lang="ts" />
