<template>
  <div id="error-page-not-found">
    <nav-bar />
    <div class="<sm:pt-0">
      <div class="bg-gray shadow overflow-hidden">
        <div class="px-4 py-5 text-sm font-medium whitespace-nowrap text-white">
          {{ $t('Page not found') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./error.ts" lang="ts" />
