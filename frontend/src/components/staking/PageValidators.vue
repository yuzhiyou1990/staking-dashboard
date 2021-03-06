<template>
  <PageContainer
    :managed="true"
    :data-empty="validators && validators.length === 0"
    title="Validators"
  >
    <template slot="managed-body">
      <div class="networkInfo">
        <div class="networkInfo-column">
          <div id="validators_median_stake" class="networkInfo-item">
            <h4>Effective median stake:</h4>
            {{ networkInfo.effective_median_stake | ones | zeroDecimals }} ONE
            <!-- <PercentageChange
              :amount="networkInfo.effective_median_stake_changed"
            /> -->
          </div>
          <div id="validators_total_stake" class="networkInfo-item">
            <h4>Total stake:</h4>
            {{ networkInfo["total-staking"] | ones | zeroDecimals }} ONE
            <!-- <PercentageChange :amount="networkInfo['total-staking-changed']" /> -->
          </div>
          <!-- <div class="networkInfo-item">
            <h4>Total seats:</h4>
            {{ networkInfo.total_seats }}
          </div>
          <div class="networkInfo-item">
            <h4>Total elected seats:</h4>
            {{ networkInfo.total_seats_used }}
          </div> -->
          <div class="networkInfo-item">
            <h4>Current block number:</h4>
            <a :href="linkToTransaction" target="_blank">
              #{{ networkInfo.current_block_number }}
            </a>
          </div>
        </div>
      </div>
      <!-- <div v-if="networkInfo.staking_distro">
        <AllStakesChart :data="networkInfo.staking_distro" />
      </div> -->
      <div v-if="isNetworkInfoLoading" class="validatorTable">
        <div class="filterOptions">
          <TmField
            v-model="searchTerm"
            class="searchField"
            placeholder="Search"
          />
          <div class="toggles">
            <TmBtn
              value="Elected"
              :number="totalActive"
              class="btn-radio secondary"
              :type="activeOnly ? `active` : `secondary`"
              @click.native="activeOnly = true"
            />
            <TmBtn
              value="All"
              :number="total"
              class="btn-radio secondary"
              :type="!activeOnly ? `active` : `secondary`"
              @click.native="activeOnly = false"
            />
          </div>
        </div>
        <TableValidators
          :data="validators"
          :active-only="activeOnly"
          :search="searchTerm.trim()"
          show-on-mobile="expectedReturns"
        />
        <div
          v-if="validators && validators.length === 0 && searchTerm"
          class="no-results"
        >
          No results for these search terms
        </div>
      </div>
      <TmDataLoading v-if="isLoading" />
    </template>
  </PageContainer>
</template>

<script>
import { mapState } from "vuex"
import TableValidators from "staking/TableValidators"
import AllStakesChart from "staking/AllStakesChart"
import PageContainer from "common/PageContainer"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
import TmDataLoading from "common/TmDataLoading"
import { transactionToShortString } from "src/scripts/transaction-utils"
import { ones, shortDecimals, zeroDecimals, twoDecimals } from "scripts/num"
import PercentageChange from "./components/PercentageChange"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    PageContainer,
    TmField,
    TmBtn,
    TmDataLoading,
  },
  filters: {
    ones,
    shortDecimals,
    zeroDecimals,
    twoDecimals
  },
  data: () => ({
    searchTerm: "",
    activeOnly: true
  }),
  computed: {
    ...mapState({ network: state => state.connection.network }),
    ...mapState({ networkConfig: state => state.connection.networkConfig }),
    ...mapState({ networkInfo: state => state.connection.networkInfo }),
    ...mapState({
      isNetworkInfoLoading: state => state.connection.isNetworkInfoLoading
    }),
    ...mapState({
      allValidators: state =>
        state.validators.loaded ? state.validators.validators : [],
      total: state => state.validators.total,
      totalActive: state => state.validators.totalActive
    }),
    ...mapState({ isLoading: state => state.validators.loading }),
    activeValidators: state =>
      state.allValidators.filter(v => v.active === true),
    validators: state => {
      return state.allValidators
    },
    prettyTransactionHash() {
      return this.networkInfo.current_block_hash
        ? transactionToShortString(this.networkInfo.current_block_hash)
        : ""
    },
    linkToTransaction() {
      const blocksUrl = this.networkConfig.explorer_url
        ? this.networkConfig.explorer_url.replace("tx", "block")
        : ""

      return blocksUrl + this.networkInfo.current_block_hash
    }
  },
  async mounted() {
    // this.$store.dispatch(`getValidators`)
    this.$store.dispatch("getDelegates")
  }
}
</script>

<style lang="scss">

.validatorTable, .networkInfo {
  background: white;
  margin: var(--double) 0;
  border-radius: var(--unit);
  border: 1px solid var(--light2);
}
.validatorTable {
    overflow: hidden;
  padding: var(--unit);
}

.networkInfo {
  
  &-column {
    display: flex;
  }

  &-item {
    padding: var(--unit);
    flex: 1;
    text-align: center;
    font-weight: bold;
  }
  &-item:not(:last-child) {
    border-right: 1px solid var(--light2);
  }

  h4 {
    color: var(--gray);
    font-size: 16px;
  }
}


.filterOptions {
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  .toggles {
    button {
      background: white;
      border: 1px solid var(--light2);
      border-radius: var(--double) !important;
      
      &.secondary {
        background:white;
        color: var(--gray);
      }
      &.active {
        background: var(--blue);
        color: white;
      }
      &.number-circle {
        margin-right: -var(--unit);
      }
    }
    button:first-child {
      margin-right: var(--unit);
    }
  }

  label {
    cursor: pointer;
  }

  input.searchField {
    width: 200px;
    padding: 0 var(--unit);
    border: 1px solid var(--light2);
    border-radius: var(--double) !important;
    color: var(--gray);
  }
}


.no-results {
  text-align: center;
  margin: 3rem;
  color: var(--dim);
}


@media screen and (max-width: 411px) {

  .validatorTable {
    margin-left: calc(-2 * var(--unit)) !important;
    width: calc(100vw - 1px);
    border-left: none !important;
    border-right: none !important;
    border-radius: 0 !important;
  }

  .filterOptions {
    width: 100vw; 
    height: 48px;
    .toggles {
      text-align: right;
      margin-right: 8px;
      transform: scale(0.8);
      width: 300px;
    }
  }
}

</style>
