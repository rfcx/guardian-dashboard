<template>
  <tr
    v-for="(incident, i) in itemsData"
    :key="i"
    class="table-row"
    :class="{ 'border-b border-gray-700': itemsData.length > 1 && i !== itemsData.length - 1 }"
  >
    <td class="pr-6 py-2 w-1/4">
      <div class="flex justify-start items-center whitespace-nowrap">
        <router-link
          :to="{ path: '/project/' + incident.projectId + '/incidents/'+ incident.id}"
          class="cursor-pointer"
        >
          <span class="text-white text-xl mr-4">#{{ incident.ref }}</span>
        </router-link>
        <div
          :class="{ 'ic-btn-gray-lighter': incident.closedAt, 'ic-btn-green': !incident.closedAt }"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide ic-btn-tags leading-none cursor-pointer"
        >
          {{ getFirstTagLabel(incident) }}
        </div>
        <div
          v-if="!incident.closedAt && incident.events.length && checkRecentLabel(incident.events)"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide ic-btn-orange ic-btn-tags leading-none cursor-pointer"
        >
          Recent
        </div>
        <div
          v-if="!incident.closedAt && incident.events.length && incident.events.length > 10"
          class="px-3 shadow-sm inline-block mr-2 flex justify-center items-center text-sm tracking-wide ic-btn-red ic-btn-tags leading-none cursor-pointer"
        >
          Hot
        </div>
      </div>
    </td>
    <td
      class="px-6 py-2 text-secondary whitespace-nowrap w-1/4"
    >
      <svg
        v-if="incident.events.length"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 inline-block ic-gray-lighter mr-2"
        title="Events"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
        />
      </svg>
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
            class="h-5 w-5 inline-block ic-gray-lighter align-top mr-1"
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
    </td>
    <td class="px-6 py-2 whitespace-nowrap text-secondary text-center w-1/4">
      <svg
        v-if="incident.responses.length"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 ic-gray-lighter inline-block mr-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fill-rule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <div
        class="text-sm text-secondary inline-block"
        :title="incident.responses.length ? getResponseTitle(incident.responses) : ''"
      >
        {{ incident.responses.length ? getResponseLabel(incident.responses) : '' }}
      </div>
    </td>
    <td
      class="px-6 py-2 whitespace-nowrap flex justify-end"
      title="Difference between a first event start time and a first response was submitted in the Guardian App"
    >
      <span class="text-base"> {{ getResponseTime(incident) }} </span>
    </td>
  </tr>
</template>

<script src="./incidents-table.ts" lang="ts" />
