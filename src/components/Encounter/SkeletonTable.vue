<template>
  <div class="q-pa-md tw-w-full md:tw-w-[70%]">
    <q-markup-table
      style="height: calc(100vh - 135px)"
      flat
      bordered
      class="tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-sm tw-overflow-hidden dark:tw-bg-gray-800 dark:tw-border-gray-700"
    >
      <thead style="height: 53px">
        <tr>
          <th scope="col" class="text-left">
            <q-skeleton animation="blink" type="rect" />
          </th>
          <th scope="col" class="text-right"></th>
          <th scope="col" class="text-right">
            <q-skeleton animation="blink" type="QRange" />
          </th>
          <th scope="col" class="text-right">
            <q-skeleton animation="blink" type="QRange" />
          </th>
          <th scope="col">
            <q-skeleton animation="blink" type="QCheckbox" />
          </th>
          <th scope="col" class="text-left">
            <q-skeleton class="tw-ml-auto" animation="blink" type="QCheckbox" />
          </th>
          <th scope="col" class="text-right">
            <q-skeleton animation="blink" type="QRange" />
          </th>
        </tr>
      </thead>

      <thead style="height: 49px">
        <tr>
          <th scope="col" class="text-left" style="min-width: 225px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 80px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 100px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 125px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 125px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 100px">
            <div
              class="row no-wrap items-center tw-border-r tw-border-gray-200 dark:tw-border-gray-700"
            >
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
          <th scope="col" class="text-right" style="min-width: 100px">
            <div class="row no-wrap items-center">
              <div class="col-grow">
                <q-skeleton animation="blink" type="QRange" />
              </div>
              <div class="col-shrink tw-mx-2">
                <q-skeleton animation="blink" type="circle" size="32px" />
              </div>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="n in 30" :key="n">
          <td class="text-left">
            <q-skeleton animation="blink" type="text" min-width="170px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="80px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="100px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="180px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="125px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="100px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" min-width="100px" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>
