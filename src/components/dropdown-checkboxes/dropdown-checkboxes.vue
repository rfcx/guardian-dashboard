<template>
  <div class="mr-2">
    <button
      id="dropdown-menu"
      type="button"
      class="relative w-full bg-steel-grey rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer outline-none focus:outline-none focus:border-transparent border-transparent sm:text-sm flex items-center mr-2 <sm:mb-2"
      aria-expanded="false"
      aria-haspopup="true"
      @click="toggleItems()"
    >
      <span class="block truncate">
        {{ $t(dropdownTitle) }}:
      </span>
      <span class="ml-3 block truncate">
        {{ $t(dropdownValue) }}
      </span>
      <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <img
          class="h-4 w-4 ml-1"
          src="/src/assets/dropdown.svg"
        >
      </span>
    </button>
    <ul
      v-if="itemSelected"
      class="absolute z-10 mt-1 bg-steel-grey w-40 shadow-lg rounded-md overflow-y focus:outline-none"
      :class="customClass"
      role="menu"
      :style="customStyle"
      aria-labelledby="dropdown-menu"
      @mouseleave="itemSelected = false"
    >
      <li
        v-for="item in items"
        :key="item.value"
        class="text-gray-900 cursor-pointer select-none relative pl-3 py-1 hover:bg-box-grey"
        role="option"
        @click="onItemChanged(item)"
      >
        <div class="flex items-center">
          <span class="font-normal block truncate text-white sm:text-sm w-30">
            {{ $t(item.label) }}
          </span>
          <span
            v-if="item.checked"
            class="text-white flex items-center px-2"
          >
            <img
              class="h-4 w-4"
              src="/src/assets/checked.svg"
            >
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script src="./dropdown-checkboxes.ts" lang="ts" />
