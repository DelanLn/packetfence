<template>
  <b-card no-body>
    <b-card-header>
      <h4 class="mb-0" v-t="'Main Configuration'"></h4>
    </b-card-header>
    <b-tabs ref="tabs" v-model="tabIndex" card>
      <b-tab :title="$t('General Configuration')" @click="changeTab('general')">
        <general-view form-store-name="formGeneral" />
      </b-tab>
      <b-tab :title="$t('Alerting')" @click="changeTab('alerting')">
        <alerting-view form-store-name="formAlerting" />
      </b-tab>
      <b-tab :title="$t('Advanced')" @click="changeTab('advanced')">
        <advanced-view form-store-name="formAdvanced" />
      </b-tab>
      <b-tab :title="$t('Maintenance')" @click="changeTab('maintenance_tasks')" no-body>
        <maintenance-tasks-list form-store-name="formMaintenanceTasks" />
      </b-tab>
      <b-tab :title="$t('Services')" @click="changeTab('services')">
        <services-view form-store-name="formServices" />
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<script>
import FormStore from '@/store/base/form'
import GeneralView from './GeneralView'
import AlertingView from './AlertingView'
import AdvancedView from './AdvancedView'
import MaintenanceTasksList from './MaintenanceTasksList'
import ServicesView from './ServicesView'

export default {
  name: 'main-tabs',
  components: {
    GeneralView,
    AlertingView,
    AdvancedView,
    MaintenanceTasksList,
    ServicesView
  },
  props: {
    tab: {
      type: String,
      default: 'general'
    }
  },
  computed: {
    tabIndex () {
      return ['general', 'alerting', 'advanced', 'maintenance_tasks', 'services'].indexOf(this.tab)
    }
  },
  methods: {
    changeTab (name) {
      this.$router.push({ name })
    }
  },
  beforeMount () {
    if (!this.$store.state.formGeneral) { // Register store module only once
      this.$store.registerModule('formGeneral', FormStore)
    }
    if (!this.$store.state.formAlerting) { // Register store module only once
      this.$store.registerModule('formAlerting', FormStore)
    }
    if (!this.$store.state.formAdvanced) { // Register store module only once
      this.$store.registerModule('formAdvanced', FormStore)
    }
    if (!this.$store.state.formMaintenanceTasks) { // Register store module only once
      this.$store.registerModule('formMaintenanceTasks', FormStore)
    }
    if (!this.$store.state.formServices) { // Register store module only once
      this.$store.registerModule('formServices', FormStore)
    }
  }
}
</script>
