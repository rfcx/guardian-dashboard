<template>
  <router-link
    v-for="(incident, i) in itemsData"
    :key="i"
    :to="{ path: '/project/' + incident.projectId + '/incidents/'+ incident.id}"
    tag="tr"
    class="flex flex-row cursor-pointer hover:bg-gray-300 hover:bg-opacity-5 <sm:flex-col"
    :class="{ 'border-b border-gray-700': itemsData.length > 1 && i !== itemsData.length - 1 }"
  >
    <div class="pr-6 py-2 flex-nowrap flex-1 <sm:py-1">
      <div class="flex justify-start items-center whitespace-nowrap">
        <span class="text-white text-xl mr-4">#{{ incident.ref }}</span>
        <div
          :class="{ 'bg-gray-500': incident.closedAt, 'bg-green-500': !incident.closedAt }"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide ic-btn-tags leading-none"
        >
          {{ incident.closedAt ? 'Closed' : 'Open' }}
        </div>
        <div
          v-if="!incident.closedAt && incident.events.length && checkRecentLabel(incident.events)"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide bg-yellow-500 ic-btn-tags leading-none"
        >
          Recent
        </div>
        <div
          v-if="!incident.closedAt && incident.events.length && incident.events.length > 10"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide bg-red-400 ic-btn-tags leading-none"
        >
          Hot
        </div>
      </div>
    </div>
    <div class="pr-6 py-2 flex-wrap flex-1 text-secondary whitespace-nowrap <sm:py-1">
      <img
        v-if="incident.events.length"
        title="Events"
        class="h-5 w-5 inline-block mr-2"
        src="/src/assets/event.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary inline-block"
        :title="incident.events.length ? getEventsTitle(incident.events) : ''"
      >
        {{ incident.events.length ? getEventsLabel(incident.events) : '' }}
      </div>
      <div
        v-if="incident.events.length"
        class="inline-block ml-3"
      >
        <div
          v-for="event in getEventsCount(incident.events)"
          :key="event.value"
          class="text-sm text-secondary inline-block mr-3"
          :title="`${event.count} ${event.value} events`"
        >
          <img
            class="h-5 w-5 inline-block text-gray-500 align-top mr-1"
            :src="'/src/assets/alert-icons/ic_' + event.value + '.svg'"
            :alt="event.value"
          >
          <span
            class="text-sm text-center inline-block"
          >
            {{ event.count }}
          </span>
        </div>
      </div>
    </div>
    <div class="pr-6 py-2 flex-nowrap flex-1 whitespace-nowrap text-secondary <sm:justify-start <sm:py-1">
      <img
        v-if="incident.responses.length"
        title="Response"
        class="h-5 w-5 inline-block mr-2"
        src="/src/assets/response.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary inline-block"
        :title="incident.responses.length ? getResponseTitle(incident.responses) : ''"
      >
        {{ incident.responses.length ? getResponseLabel(incident.responses) : '' }}
      </div>
    </div>
    <div
      class="pr-6 py-2 whitespace-wrap flex-1 flex justify-end <sm:justify-start <sm:py-1"
      title="Difference between a first event start time and a first response was submitted in the Guardian App"
    >
      <span class="text-base"> {{ getResponseTime(incident) }} </span>
    </div>
  </router-link>
</template>

<script src="./incidents-table.ts" lang="ts" />
