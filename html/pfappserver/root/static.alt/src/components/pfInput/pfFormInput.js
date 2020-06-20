import {
  BButton,
  BFormGroup,
  BFormInput,
  BFormText,
  BInputGroup,
  BInputGroupAppend,
  BInputGroupPrepend
} from 'bootstrap-vue'
import * as Icon from 'vue-awesome'

import mixinScss from './mixin.scss' // mixin scoped scss
import {
  mixinFormHandlers,
  mixinFormModel,
  mixinFormState
} from '@/components/_mixins/'

export const defaultProps = {
  columnLabel: {
    type: String
  },
  labelCols: {
    type: [String, Number],
    default: 3
  },
  text: {
    type: String
  },
  disabled: {
    type: Boolean,
    disabled: false
  },
  placeholder: {
    type: String,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'text'
  }
}

// @vue/component
export default {
  name: 'pf-form-input',
  mixins: [
    mixinFormHandlers,
    mixinFormModel, // uses v-model
    mixinFormState,
    mixinScss
  ],
  props: {
    // value defined in formModel mixin
    //value: {/* noop */},
    ...defaultProps
  },
  computed: {
    mergeDisabled () { // overloaded through inheritance
      return this.disabled
    },
    mergeSlots () { // overloaded through inheritance
      return (h) => {
        return this.$scopedSlots // defaults
      }
    }
  },
  methods: {
    focus () {
      this.$refs.input.focus()
    },
    onInput (event) {
      this.$emit('input', event) // bubble up
      this.localValue = event
    },
    onChange (event) {
      this.$emit('change', event) // bubble up
      this.localValue = event
    }
  },
  render (h) { // https://vuejs.org/v2/guide/render-function.html

    const $BFormInput = h(BFormInput, {
      ref: 'input',
      staticClass: null,
      class: {
        'pf-input': true
      },
      directives: [ // https://vuejs.org/v2/guide/custom-directive.html
        /*
        {
          name: 'model',
          rawName: 'v-model',
          value: this.localValue,
          expression: 'localValue'
        }
        */
      ],
      attrs: this.$attrs, // forward $attrs
      props: {
        ...this.$props, // forward $props
        disabled: this.mergeDisabled,
        state: this.localState,
        value: this.localValue
      },
      domProps: {/* noop */},
      on: {
        ...this.$listeners, // forward $listeners
        input: this.onInput,
        change: this.onChange
      }
    })

    const $BInputGroup = h(BInputGroup, {
      class: { // append state class to input-group
        'is-valid': this.localState === true,
        'is-invalid': this.localState === false
      },
      scopedSlots: { // forward `prepend` and `append` scopedSlots to BInputGroup
        // prepend
        prepend: this.mergeSlots(h).prepend,
        // append
        append: props => [
        ...((this.mergeSlots(h).append) // slot(s) first
            ? [this.mergeSlots(h).append(props)]
            : [/* noop */]
          ),
          ...((this.disabled || this.readonly) // icon last
            ? [
              h(BButton, {
                staticClass: 'input-group-text',
                props: {
                  disabled: true,
                  tabIndex: -1 // ignore
                }
              }, [
                h(Icon, {
                  ref: 'icon-lock',
                  props: {
                    name: 'lock'
                  }
                })
              ])
            ]
            : [/* noop */]
          )
        ]
      }
    }, [$BFormInput])

    return h(BFormGroup, {
      ref: 'form-group',
      staticClass: 'pf-form-input',
      class: {
        'mb-0': !this.columnLabel
      },
      props: {
        state: this.localState,
        invalidFeedback: this.localInvalidFeedback,
        ...((this.columnLabel)
          ? {
              labelCols: this.labelCols,
              label: this.columnLabel
          }
          : {/* noop */}
        )
      }
    }, [
      $BInputGroup,
      ...((this.text)
        ? [h(BFormText, {
          ref: 'form-text',
          domProps: {
            innerHTML: this.text
          }
        })]
        : [/* noop */]
      )
    ])
  }
}
