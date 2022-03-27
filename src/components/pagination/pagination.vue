<template>
  <div
    v-if="paginationSettings !== undefined && paginationSettings.total !== undefined"
    class="bg-gray px-4 py-3 flex items-center justify-between sm:px-6"
  >
    <div class="flex-1 flex justify-between sm:hidden">
      <a
        :class="{'opacity-50 cursor-not-allowed': paginationSettings.page === 1}"
        class="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md text-white bg-gray hover:bg-gray-700"
        @click="getPrevPage()"
      >
        {{ $t('Previous') }}
      </a>
      <a
        :class="{'opacity-50 cursor-not-allowed': paginationSettings.page === lastPage}"
        class="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md text-white bg-gray hover:bg-gray-700"
        @click="getNextPage()"
      >
        {{ $t('Next') }}
      </a>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-white">
          {{ $t('Page') }}
          {{ ' ' }}
          <span class="font-medium">{{ paginationSettings.page }}</span>
          {{ ' ' }}
          {{ $t('of') }}
          {{ ' ' }}
          <span class="font-medium">{{ lastPage }}</span>
        </p>
      </div>
      <div>
        <nav
          class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <a
            :class="{'opacity-50 cursor-not-allowed': paginationSettings.page === 1}"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-500 bg-gray text-sm font-medium text-white hover:bg-gray-700"
            @click="getPrevPage()"
          >
            <span class="sr-only">{{ $t('Previous') }}</span>
            <ChevronLeftIcon
              class="h-5 w-5"
              aria-hidden="true"
            />
          </a>
          <a
            v-for="page of pages()"
            :key="page"
            aria-current="page"
            :class="{'bg-gray-700 border-gray-500': page === paginationSettings.page, 'bg-gray border-gray-500': page !== paginationSettings.page}"
            class="z-10 text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer hover:bg-gray-700"
            @click="getPage(page)"
          >
            {{ page }}
          </a>
          <a
            :class="{'opacity-50 cursor-not-allowed': paginationSettings.page === lastPage}"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-500 bg-gray text-sm font-medium text-white hover:bg-gray-700"
            @click="getNextPage()"
          >
            <span class="sr-only">{{ $t('Next') }}</span>
            <ChevronRightIcon
              class="h-5 w-5"
              aria-hidden="true"
            />
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script src="./pagination.ts" lang="ts"/>
