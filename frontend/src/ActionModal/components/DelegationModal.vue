<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="isRedelegation() ? 0 : amount"
    :title="isRedelegation() ? 'Redelegate' : 'Delegate'"
    class="delegation-modal"
    submission-error-prefix="Delegating failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="!isRedelegation()">
          It will take 7 epochs to unlock your tokens after a delegation and the
          tokens are still slashable if the validator behaves maliciously.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon redelegation —
          your tokens will still be subject to the risks associated with the
          original delegation for the duration of the undelegation period.
        </span>
      </div>
    </TmFormGroup>
    <!-- <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To"> -->
    <TmFormGroup class="action-modal-form-group" field-id="to">
      <TmField id="to" v-model="to" type="text" readonly />
      <TmFormMsg
        v-if="validatorStatus === 'Inactive' && !isRedelegation()"
        :msg="
          `You are about to delegate to an inactive validator (${validatorStatusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
      <TmFormMsg
        v-if="validatorStatus === 'Inactive' && isRedelegation()"
        :msg="
          `You are about to redelegate to an inactive validator (${validatorStatusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>

    <TmFormGroup
      v-if="fromOptions.length > 1"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        v-model="selectedIndex"
        :title="from"
        :options="fromOptions"
        type="select"
      />
    </TmFormGroup>
    <!-- <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    > -->
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
    >
      <span class="input-suffix-denom">{{ viewDenom(denom) }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          type="number"
          placeholder="Amount"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span v-if="!isRedelegation()" class="form-message">
        Available to Stake:
        {{ getFromBalance() }}
        {{ denom | viewDenom }}s
      </span>
      <div v-if="!isRedelegation()" class="form-message">
        Available for this Validator: 
        {{ validator.remainder | ones | shortDecimals }}
        {{ denom | viewDenom }}s
      </div>
      <span v-else-if="isRedelegation()" class="form-message">
        Available to Redelegate:
        {{ getFromBalance() }}
        {{ denom | viewDenom }}s
      </span>
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${viewDenom(denom)}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg v-else-if="$v.amount.$error && !$v.amount.decimal" name="Amount" type="numeric" />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <TmFormMsg
        v-else-if="isMaxAmount() && !isRedelegation()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { between, decimal } from "vuelidate/lib/validators"
import {
  uatoms,
  atoms,
  viewDenom,
  SMALLEST,
  ones,
  shortDecimals
} from "src/scripts/num"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"

export default {
    name: `delegation-modal`,
    components: {
        TmField,
        TmFieldGroup,
        TmBtn,
        TmFormGroup,
        TmFormMsg,
        ActionModal
    },
    filters: {
        viewDenom,
    ones,
    shortDecimals
  },
  props: {
    fromOptions: {
      type: Array,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    validator: {
      type: Object,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: null,
    selectedIndex: 0
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`modalContext`]),
    balance() {
      if (!this.session.signedIn) return 0

            return this.fromOptions[this.selectedIndex].maximum
        },
        from() {
            if (!this.session.signedIn) return ``

            return this.fromOptions[this.selectedIndex].address
        },
        transactionData() {
            if (!this.from) return {}

            if (this.from === this.modalContext.userAddress) {
                return {
                    type: transaction.DELEGATE,
                    validatorAddress: this.validator.operator_address,
                    amount: uatoms(this.amount),
                    denom: this.denom
                }
            } else {
                const validatorSrc = this.modalContext.delegates.find(
                    v => this.from === v.operator_address
                )
                return {
                    type: transaction.REDELEGATE,
                    validatorSourceAddress: validatorSrc.operator_address,
                    validatorDestinationAddress: this.validator
                        .operator_address,
                    amount: uatoms(this.amount),
                    denom: this.denom
                }
            }
        },
        notifyMessage() {
            if (this.from === this.modalContext.userAddress) {
                return {
                    title: `Successful delegation!`,
                    body: `You have successfully delegated your ${viewDenom(
                        this.denom
                    )}s`
                }
            } else {
                return {
                    title: `Successful redelegation!`,
                    body: `You have successfully redelegated your ${viewDenom(
                        this.denom
                    )}s`
                }
            }
        },
        // Will be replaced by `status` field from backend
        validatorStatus() {
            if (
                this.validator.jailed ||
                this.validator.tombstoned ||
                this.validator.status === 0
            )
                return `Inactive`
            return `Active`
        },
        // Will be replaced by `status_detail` field from backend
        validatorStatusDetailed() {
            if (this.validator.jailed)
                return `temporally banned from the network`
            else if (this.validator.tombstoned) return `banned from the network`
            else if (this.validator.status === 0)
                return `banned from the network`
            else return false
        }
    },
    methods: {
        viewDenom,
        open(options) {
            if (
                options &&
                options.redelegation &&
                this.fromOptions.length > 1
            ) {
                this.selectedIndex = 1
            }
            this.$refs.actionModal.open()
        },
        validateForm() {
            this.$v.$touch()

            return !this.$v.$invalid
        },
        clear() {
            this.$v.$reset()

            this.selectedIndex = 0
            this.amount = null
        },
        setMaxAmount() {
            this.amount = Math.min(atoms(this.balance), ones(this.validator.remainder))
        },
        isMaxAmount() {
            return parseFloat(this.amount) === parseFloat(atoms(this.balance))
        },
        enterPressed() {
            this.$refs.actionModal.validateChangeStep()
        },
        isRedelegation() {
            return this.from !== this.modalContext.userAddress
        },
        getFromBalance() {
            return atoms(this.balance)
        }
    },
    validations() {
        return {
            amount: {
                required: x => !!x && x !== `0`,
                decimal,
                between: between(
          SMALLEST,
          Math.min(atoms(this.balance), ones(this.validator.remainder))
        )
            }
        }
    }
}
</script>
