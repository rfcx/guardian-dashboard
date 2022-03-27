<template>
  <div class="flex items-end relative">
    <select
      v-model="$i18n.locale"
      class="relative w-full bg-steel-grey rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:shadow-none outline-none focus:outline-none focus:border-transparent border-transparent sm:text-sm w-10 flex items-center mr-2 <sm:mb-2"
      @change="onLangChange($i18n.locale)"
    >
      <option
        v-for="lang in languages"
        :key="`lang_${lang.value}`"
        :value="lang.value"
      >
        <span
          class="text-xl"
          :title="lang.title"
        >{{ lang.flag }}</span>
      </option>
    </select>
  </div>
</template>

<script src="./language-selector.ts" lang="ts" />
