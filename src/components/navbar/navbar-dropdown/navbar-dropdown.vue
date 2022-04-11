<template>
  <div
    class="flex flex-row px-4"
    aria-expanded="true"
    aria-haspopup="true"
  >
    <div
      id="dropdown-button"
      :title="$t(dropdownImageTitle)"
      type="button"
      class="hover:cursor-pointer focus:cursor-pointer outline-none focus:outline-none focus:border-transparent border-transparent group appearance-none"
      aria-expanded="false"
      aria-haspopup="true"
      :alt="$t(dropdownImageTitle)"
      @click="toggleItems()"
      @mouseover="itemSelected = true"
    >
      <img
        class="h-5 w-5 self-center mr-2"
        style="color: #979faa"
        :src="dropdownImage"
      >
      <ul
        v-if="itemSelected"
        class="absolute z-50 min-w-40 border-t-box-grey border-t-1 bg-steel-grey rounded-b-md text-primary invisible group-hover:visible focus:outline-none transition-all"
        :class="customClass"
        role="menu"
        :style="customStyle"
        aria-orientation="vertical"
        tabindex="-1"
        aria-labelledby="lang-button"
      >
        <li
          v-for="item in items"
          :key="item.value"
          class="p-4 rounded-b-md hover:(bg-box-grey cursor-pointer)"
          role="option"
          @click="onItemChanged(item)"
        >
          <div class="flex justify-between">
            <span class="font-normal block truncate text-white sm:text-sm w-30">
              {{ $t(item.label) }}
            </span>
            <span
              v-if="item.checked"
              class="text-white flex items-center pl-2"
            >
              <img
                class="h-5 w-5 text-white self-center mr-2"
                src="/src/assets/check.svg"
                alt=""
              >
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./navbar-dropdown.ts" lang="ts" />
