import i18n from '@/utils/locale'
import pfField from '@/components/pfField'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormFields from '@/components/pfFormFields'
import pfFormInput from '@/components/pfFormInput'
import pfFormPassword from '@/components/pfFormPassword'
import pfFormToggle from '@/components/pfFormToggle'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  and,
  not,
  conditional,
  hasScans,
  scanExists
} from '@/globals/pfValidators'

const { required } = require('vuelidate/lib/validators')

export const pfConfigurationScanEngineListColumns = [
  {
    key: 'id',
    label: i18n.t('Name'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'ip',
    label: i18n.t('IP Address'),
    sortable: true,
    visible: true
  },
  {
    key: 'port',
    label: i18n.t('Port'),
    sortable: true,
    visible: true
  },
  {
    key: 'type',
    label: i18n.t('Type'),
    sortable: true,
    visible: true
  },
  {
    key: 'buttons',
    label: '',
    locked: true
  }
]

export const pfConfigurationScanEngineListFields = [
  {
    value: 'id',
    text: i18n.t('Name'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'ip',
    text: i18n.t('IP Address'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'port',
    text: i18n.t('Port'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: i18n.t('Type'),
    types: [conditionType.SUBSTRING]
  }
]

export const pfConfigurationScanEngineListConfig = (context = {}) => {
  const { $i18n } = context
  return {
    columns: pfConfigurationScanEngineListColumns,
    fields: pfConfigurationScanEngineListFields,
    rowClickRoute (item, index) {
      return { name: 'scanEngine', params: { id: item.id } }
    },
    searchPlaceholder: $i18n.t('Search by name, ip, port or type'),
    searchableOptions: {
      searchApiEndpoint: 'config/scans',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'ip', op: 'contains', value: null },
            { field: 'port', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'scanEngines' }
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [
          {
            op: 'or',
            values: [
              { field: 'id', op: 'contains', value: quickCondition },
              { field: 'ip', op: 'contains', value: quickCondition },
              { field: 'port', op: 'contains', value: quickCondition },
              { field: 'type', op: 'contains', value: quickCondition }
            ]
          }
        ]
      }
    }
  }
}

export const pfConfigurationScanEngineViewFields = (context = {}) => {
  const {
    isNew = false,
    isClone = false,
    scanType = null, // from router,
    options: {
      meta = {}
    },
    form = {}
  } = context
  return [
    {
      tab: null, // ignore tabs
      fields: [
        {
          label: i18n.t('Name'),
          fields: [
            {
              key: 'id',
              component: pfFormInput,
              attrs: {
                ...pfConfigurationAttributesFromMeta(meta, 'id'),
                ...{
                  disabled: (!isNew && !isClone)
                }
              },
              validators: {
                ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
                ...{
                  [i18n.t('Name exists.')]: not(and(required, conditional(isNew || isClone), hasScans, scanExists))
                }
              }
            }
          ]
        },
        {
          if: ['nessus', 'nessus6', 'openvas', 'rapid7'].includes(scanType),
          label: i18n.t('Hostname or IP Address'),
          fields: [
            {
              key: 'ip',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'ip'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'ip', 'IP')
            }
          ]
        },
        {
          if: ['nessus', 'nessus6', 'openvas', 'rapid7', 'wmi'].includes(scanType),
	  label: i18n.t('Username'),
          fields: [
            {
              key: 'username',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'username'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'username', i18n.t('Username'))
            }
          ]
        },
        {
          if: ['wmi'].includes(scanType),
          label: i18n.t('Domain'),
          fields: [
            {
              key: 'domain',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'domain'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'domain', i18n.t('Domain'))
            }
          ]
        },
        {
          if: ['nessus', 'nessus6', 'openvas', 'rapid7', 'wmi'].includes(scanType),
          label: i18n.t('Password'),
          fields: [
            {
              key: 'password',
              component: pfFormPassword,
              attrs: pfConfigurationAttributesFromMeta(meta, 'password'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'password', i18n.t('Password'))
            }
          ]
        },
        {
          if: ['nessus', 'nessus6', 'openvas', 'rapid7'].includes(scanType),
          label: i18n.t('Port of the service'),
          text: i18n.t('If you use an alternative port, please specify.'),
          fields: [
            {
              key: 'port',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'port'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port'))
            }
          ]
        },
        {
          if: ['nessus', 'nessus6'].includes(scanType),
          label: i18n.t('Nessus client policy'),
          text: i18n.t('Name of the policy to use on the nessus server.'),
          fields: [
            {
              key: 'nessus_clientpolicy',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'nessus_clientpolicy'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'nessus_clientpolicy', i18n.t('Policy'))
            }
          ]
        },
        {
          if: ['nessus6'].includes(scanType),
          label: i18n.t('Nessus scanner name'),
          text: i18n.t('Name of the scanner to use on the nessus server.'),
          fields: [
            {
              key: 'scannername',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'scannername'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'scannername', i18n.t('Name'))
            }
          ]
        },
        {
          if: ['openvas'].includes(scanType),
          label: i18n.t('Alert ID'),
          text: i18n.t('ID of the alert configuration on the OpenVAS server.'),
          fields: [
            {
              key: 'openvas_alertid',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'openvas_alertid'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'openvas_alertid', 'ID')
            }
          ]
        },
        {
          if: ['openvas'].includes(scanType),
          label: i18n.t('Scan config ID'),
          text: i18n.t('ID of the scanning configuration on the OpenVAS server.'),
          fields: [
            {
              key: 'openvas_configid',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'openvas_configid'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'openvas_configid', 'ID')
            }
          ]
        },
        {
          if: ['openvas'].includes(scanType),
          label: i18n.t('Report format ID'),
          text: i18n.t('ID of the "CSV Results" report format on the OpenVAS server.'),
          fields: [
            {
              key: 'openvas_reportformatid',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'openvas_reportformatid'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'openvas_reportformatid', 'ID')
            }
          ]
        },
        {
          if: ['rapid7'].includes(scanType),
          label: i18n.t('Verify Hostname'),
          text: i18n.t('Verify hostname of server when connecting to the API.'),
          fields: [
            {
              key: 'verify_hostname',
              component: pfFormToggle,
              attrs: {
                values: { checked: 'enabled', unchecked: 'disabled' }
              }
            }
          ]
        },
        {
          if: ['rapid7'].includes(scanType),
          label: i18n.t('Scan Engine'),
          text: i18n.t('After configuring this scan engine for the first time, you will be able to select this attribute from the available ones in Rapid7.'),
          fields: [
            {
              key: 'engine_id',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'engine_id'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'engine_id', i18n.t('Engine'))
            }
          ]
        },
        {
          if: ['rapid7'].includes(scanType),
          label: i18n.t('Scan Template'),
          text: i18n.t('After configuring this scan engine for the first time, you will be able to select this attribute from the available ones in Rapid7.'),
          fields: [
            {
              key: 'template_id',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'template_id'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'template_id', i18n.t('Template'))
            }
          ]
        },
        {
          if: ['rapid7'].includes(scanType),
          label: i18n.t('Site'),
          text: i18n.t('After configuring this scan engine for the first time, you will be able to select this attribute from the available ones in Rapid7.'),
          fields: [
            {
              key: 'site_id',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'site_id'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'site_id', i18n.t('Site'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('TenableIO url'),
          text: i18n.t('URL of the tenableIO instance.'),
          fields: [
            {
              key: 'url',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'url'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'url', i18n.t('url'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('Access Key'),
          text: i18n.t('TenableIO Access Key.'),
          fields: [
            {
              key: 'accessKey',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'accessKey'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'accessKey', i18n.t('accessKey'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('TenableIO Secret Key'),
          text: i18n.t('TenableIO Secret Key.'),
          fields: [
            {
              key: 'secretKey',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'secretKey'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'secretKey', i18n.t('secretKey'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('TenableIO scanner name'),
          text: i18n.t('Name of the scanner to use on the TenableIO instance.'),
          fields: [
            {
              key: 'scannername',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'scannername'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'scannername', i18n.t('scannername'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('TenableIO client policy'),
          text: i18n.t('Name of the client policy to use.'),
          fields: [
            {
              key: 'tenableio_clientpolicy',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'tenableio_clientpolicy'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'tenableio_clientpolicy', i18n.t('tenableio_clientpolicy'))
            }
          ]
        },
        {
          if: ['tenableio'].includes(scanType),
          label: i18n.t('Folder ID'),
          text: i18n.t('Folder ID to use.'),
          fields: [
            {
              key: 'folderId',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'folderId'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'folderId', i18n.t('folderId'))
            }
          ]
        },
        {
          label: i18n.t('Roles'),
          text: i18n.t('Nodes with the selected roles will be affected.'),
          fields: [
            {
              key: 'categories',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'categories'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'categories', i18n.t('Categories'))
            }
          ]
        },
        {
          if: ['nessus', 'nessus6', 'openvas', 'rapid7', 'tenableio'].includes(scanType),
          label: i18n.t('OS'),
          text: i18n.t('Nodes with the selected OS will be affected.'),
          fields: [
            {
              key: 'oses',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'oses'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'oses', 'OS')
            }
          ]
        },
        {
          label: i18n.t('Duration'),
          text: i18n.t('Approximate duration of a scan. User being scanned on registration are presented a progress bar for this duration, afterwards the browser refreshes until scan is complete.'),
          fields: [
            {
              key: 'duration.interval',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'duration.interval'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'duration.interval', i18n.t('Interval'))
            },
            {
              key: 'duration.unit',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'duration.unit'),
              validators: pfConfigurationValidatorsFromMeta(meta, 'duration.unit', i18n.t('Unit'))
            }
          ]
        },
        {
          label: i18n.t('Scan before registration'),
          text: i18n.t('If this option is enabled, the PF system will scan host before the registration.'),
          fields: [
            {
              key: 'pre_registration',
              component: pfFormToggle,
              attrs: {
                values: { checked: 1, unchecked: 0 }
              }
            }
          ]
        },
        {
          label: i18n.t('Scan on registration'),
          text: i18n.t('If this option is enabled, the PF system will scan each host after registration is complete.'),
          fields: [
            {
              key: 'registration',
              component: pfFormToggle,
              attrs: {
                values: { checked: 1, unchecked: 0 }
              }
            }
          ]
        },
        {
          label: i18n.t('Scan after registration'),
          text: i18n.t('If this option is enabled, the PF system will scan host after on the production vlan.'),
          fields: [
            {
              key: 'post_registration',
              component: pfFormToggle,
              attrs: {
                values: { checked: 1, unchecked: 0 }
              }
            }
          ]
        },
        {
          if: ['wmi'].includes(scanType),
          label: i18n.t('WMI Rules'),
          text: i18n.t('If this option is enabled, the PF system will scan host after on the production vlan.'),
          fields: [
            {
              key: 'wmi_rules',
              component: pfFormFields,
              attrs: {
                buttonLabel: i18n.t('Add Rule'),
                emptyText: i18n.t('With no WMI rules specified, the scan engine will not be triggered.'),
                sortable: true,
                field: {
                  component: pfField,
                  attrs: {
                    field: {
                      component: pfFormChosen,
                      attrs: {
                        ...pfConfigurationAttributesFromMeta(meta, 'wmi_rules'),
                        ...{
                          collapseObject: true,
                          placeholder: i18n.t('Click to select a rule'),
                          trackBy: 'value',
                          label: 'text',
                          multiple: false
                        }
                      },
                      validators: {
                        [i18n.t('Duplicate Rule.')]: conditional((value) => {
                          return !(form.wmi_rules.filter(v => v === value).length > 1)
                        })
                      }
                    }

                  }
                },
                invalidFeedback: [
                  { [i18n.t('Rule(s) contain one or more errors.')]: true }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
