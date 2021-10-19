<template>
  <tr
    v-for="item in itemsData"
    :key="item.id"
    class="table-row"
  >
    <td
      v-if="!isEvent(item)"
      class="px-6 py-2 whitespace-nowrap w-1/8"
      title="Report"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 ic-green"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </td>
    <td
      v-if="isEvent(item)"
      class="px-6 py-2 whitespace-nowrap w-1/8"
      title="Alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 ic-pink"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    </td>
    <td class="px-6 py-2 whitespace-nowrap w-1/5">
      <div class="text-sm font-medium text-white">
        {{ dateFormatted(item.createdAt) }}
      </div>
    </td>
    <td
      v-if="isEvent(item)"
      class="px-6 py-2 whitespace-nowrap w-1/5"
    >
      <div class="text-sm text-white">
        {{ timeFormatted(item.start) }}-{{ timeFormatted(item.end) }}
      </div>
    </td>
    <td
      v-if="!isEvent(item)"
      class="px-6 py-2 whitespace-nowrap text-sm text-white w-1/5"
    />
    <td
      v-if="isEvent(item)"
      class="px-6 py-2 whitespace-nowrap w-1/5"
    >
      <div class="text-sm text-white">
        {{ item.classification && item.classification.title }}
      </div>
    </td>
    <td
      v-if="!isEvent(item)"
      class="px-6 py-2 whitespace-nowrap text-sm text-white w-1/5"
    >
      Response by {{ item.createdBy.firstname }} {{ item.createdBy.lastname }}
    </td>
    <td
      v-if="!isEvent(item)"
      class="px-6 py-2 whitespace-nowrap text-sm w-1/5"
    />
    <td
      v-if="isEvent(item)"
      class="px-6 py-2 whitespace-nowrap text-sm text-white w-1/5"
    />
  </tr>
</template>

<script src="./incidents-table.ts" lang="ts" />
