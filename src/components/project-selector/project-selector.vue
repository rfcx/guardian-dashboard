<template>
  <div id="project-selector-component">
    <div
      id="select-project-modal"
      class="fixed inset-0 z-10 bg-mirage-grey bg-opacity-75 transition-opacity overflow-y-auto h-full w-full"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div class="flex justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        />
        <div class="inline-block align-middle bg-steel-grey rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full h-125">
          <div class="bg-steel-grey px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <on-click-outside @trigger="closeProjectSelector">
              <div class="text-white text-xl pb-2">
                Select Project
              </div>
              <div
                v-if="componentProjects !== undefined"
                class="divide-y divide-gray-500 overflow-y-auto h-96"
              >
                <div>
                  <input
                    v-model="searchLabel"
                    type="text"
                    class="search px-0 flex justify-between text-white bg-steel-grey-dark md:focus:steel-grey focus:outline-none md:focus:outline-none outline-none border-none w-full"
                    placeholder="Filter by keyword"
                    @keyup="searchProject()"
                  >
                </div>
                <div
                  v-for="(project, idx) in componentProjects"
                  :key="'project-list-' + idx"
                  class="flex justify-between text-white cursor-pointer hover:bg-steel-grey-dark py-2"
                  @click="setSelectedProject(project)"
                >
                  <span class="truncate w-11/12">{{ project.name }}</span>
                  <span v-if="selectedProject !== undefined">
                    <i
                      v-if="isSelectedProject(project)"
                      class="icon-check"
                    />
                  </span>
                </div>
              </div>
              <div class="flex justify-end mt-2">
                <button
                  class="btn mr-2"
                  @click="closeProjectSelector"
                >
                  Cancel
                </button>
                <button
                  class="btn btn-primary ${updating ? 'opacity-50 cursor-not-allowed' : '' }"
                  @click="confirmedSelectedProject()"
                >
                  Select
                </button>
              </div>
            </on-click-outside>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./project-selector.ts" lang="ts" />
