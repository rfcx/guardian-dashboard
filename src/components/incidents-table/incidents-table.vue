<template>
  <router-link
    v-for="(incident, i) in itemsData"
    :key="i"
    :to="{ path: '/project/' + incident.projectId + '/incidents/'+ incident.id}"
    class="grid grid-cols-5 gap-2 py-2 cursor-pointer hover:bg-gray-300 hover:bg-opacity-5 <sm:(flex flex-col)"
    :class="{ 'border-b border-gray-700': itemsData.length > 1 && i !== itemsData.length - 1 }"
  >
    <div class="pr-2 flex flex-nowrap items-center justify-start flex-1 <sm:py-1">
      <span class="text-white text-lg mr-2">#{{ incident.ref }}</span>
      <div
        v-if="incident.closedAt"
        class="px-3 shadow-sm inline-block mr-2 flex self-center items-center text-sm tracking-wide btn-tag leading-none bg-gray-600 bg-opacity-70"
      >
        {{ $t('Closed') }}
      </div>
    </div>
    <div
      class="pr-2 col-span-2 flex flex-1 justify-start flex-wrap items-end text-secondary <sm:py-1"
    >
      <img
        v-if="incident.events.length"
        :title="$t('Events')"
        class="h-5 w-5 self-center mr-2"
        src="/src/assets/alert.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary mb-0.2 mr-2 <lg:(mb-0 text-base) <md:text-sm"
        :title="incident.eventsTitle"
      >
        {{ incident.eventsLabel }}
      </div>
      <div
        v-if="incident.events.length"
        class="flex flex-row items-start"
      >
        <div
          v-for="event in getEventsCount(incident.events)"
          :key="event.value"
          class="text-sm text-secondary mb-0.2 mr-3"
          :title="getIconTitle(event.count, event.title)"
        >
          <img
            class="h-5 w-5 inline-block self-start mr-1"
            :src="`https://static.rfcx.org/img/guardian/ic_${event.value}.svg`"
            alt=""
            @error="setDefaultReportImg"
          >
          <span
            class="text-sm text-secondary text-center <lg:(mb-0 text-base) <md:text-sm"
          >
            {{ event.count || '' }}
          </span>
        </div>
      </div>
    </div>
    <div class="pr-2 flex-1 text-secondary flex justify-end items-end <lg:items-center <sm:justify-start <sm:py-1">
      <img
        v-if="incident.responses.length"
        :title="$t('Response')"
        class="h-5 w-5 self-center mr-2"
        src="/src/assets/response.svg"
        alt=""
      >
      <div
        class="text-sm text-secondary mb-0.2 <lg:(mb-0 text-base) <md:text-sm w-150px"
        :title="incident.responseTitle"
      >
        {{ incident.responseLabel }}
      </div>
    </div>
    <div
      class="pr-2  flex-1 flex justify-end items-center <sm:justify-start <sm:py-1"
      :title="$t('Difference between a first event start time and a first response was submitted in the Guardian App')"
    >
      <div class="text-secondary text-sm font-medium mr-3 sm:hidden flex items-center">
        {{ $t('Response time') }}
        <img
          :title="$t('Duration between the first event and the first response')"
          class="h-4 w-4 self-center ml-1 cursor-default"
          src="/src/assets/info.svg"
          alt="i"
        >
      </div>
      <span class="text-right text-lg text-gray-200"> {{ getResponseTime(incident) }} </span>
    </div>
  </router-link>
</template>

<script src="./incidents-table.ts" lang="ts" />
