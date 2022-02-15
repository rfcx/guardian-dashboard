<template>
  <div class="flex flex-col items-center justify-center h-[80vh]">
    <p class="text-5xl text-white">
      404
    </p>
    <p class="py-4 text-xl text-white text-center">
      {{ message }}
    </p>
    <div class="rounded-md mt-4 text-sm text-gray-500 text-white">
      <router-link
        to="/"
        class="inline-flex items-center justify-center px-4 py-1 border border-transparent text-white font-small rounded-md font-semibold bg-gray-600 bg-opacity-70 hover:bg-steel-grey cursor-pointer"
      >
        Go back home
      </router-link>
    </div>
  </div>
</template>

<script src="./invalid-page-state.ts" lang="ts" />
