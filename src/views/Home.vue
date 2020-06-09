<template>
  <v-container fluid>
    <v-row justify="center" v-show="showAlert">
      <v-col cols="12" xl="5" lg="6" md="7" sm="8">
        <v-alert
          :type="alertType"
          dense
          outlined
          dismissible
          close-text="Close Alert"
          v-model="showAlert"
        >
          {{ alertMessage }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="6" xs="12">
        <div class="d-flex justify-start">
          <v-text-field
            label="Search"
            v-model="productSearch"
            outlined
            dense
            clearable
            background-color="#fff"
            v-on:keyup.enter="onSearchClick"
          ></v-text-field>
          <v-btn text class="mt-1" @click="onSearchClick">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="8" xs="12">
        <v-row class="results-row" justify="center">
          <v-data-iterator
            :items="products"
            :items-per-page="resultsPerPage"
            :page="currentPage"
            hide-default-footer
            v-show="hasExecutedSearch"
            :loading="loading"
            :loading-text="`Searching for products...`"
          >
            <template v-slot:default="{ items }">
              <v-row>
                <v-col
                  v-for="item in items"
                  :key="item.prodId"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <HomePageProduct
                    :product="item"
                    @noUserLoggedIn="handleNoUserLoggedIn"
                    @saveOrUpdateError="handleSaveOrUpdateError"
                  ></HomePageProduct>
                </v-col>
              </v-row>
            </template>
          </v-data-iterator>
        </v-row>
        <v-divider v-show="hasExecutedSearch"></v-divider>
        <v-row
          align="center"
          justify="center"
          class="mt-2"
          v-show="hasExecutedSearch"
        >
          <v-col class="pa-0">
            <span class="grey--text">Items per page</span>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn text class="ml-2" v-on="on">
                  {{ resultsPerPage }}
                  <v-icon small>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(number, idx) in resultsPerPageList"
                  :key="idx"
                  @click="onUpdateResultsPerPage(number)"
                >
                  <v-list-item-title>{{ number }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col class="pa-0 col-auto">
            <span class="mr-4 grey--text"
              >Page {{ currentPage }} of {{ numberOfPages }}</span
            >
            <v-btn fab x-small class="mr-1" @click="previousPage">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab x-small class="ml-1" @click="nextPage">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-dialog v-model="showLoginRequest" max-width="300">
        <v-card>
          <v-card-title class="headline">
            Login Needed
          </v-card-title>
          <v-card-text>
            Please login in order to add items to cart.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showLoginRequest = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { _ } from "vue-underscore";
import HomePageProduct from "@/components/HomePageProduct";

export default {
  name: "Home",
  components: {
    HomePageProduct
  },
  data: () => ({
    productSearch: "",
    hasExecutedSearch: false,
    loading: false,
    products: [],
    currentPage: 1,
    selectedProducts: [],
    productCartCounts: [],
    showLoginRequest: false,
    showAlert: false,
    alertMessage: "",
    alertType: undefined
  }),
  created: function() {
    this.showAlert = false;
    let self = this;
    if (this.user == null) {
      this.checkSession();
    } else {
      this.checkOrder();
    }
  },
  methods: {
    checkSession: function() {
      let self = this;
      this.checkForUserSession()
        .then(response => {
          if (self.user != null) {
            self.checkOrder();
          }

          if (!response) {
            self.showMessage("USER");
          }
        })
        .catch(error => {
          self.showMessage("USER");
        });
    },
    checkOrder: function() {
      let self = this;
      this.checkForNewOrder()
        .then(response => {
          if (!response) {
            self.showMessage("USER");
          }
        })
        .catch(error => {
          self.showMessage("USER");
        });
    },
    showMessage: function(msgType) {
      if (msgType == "USER") {
        this.alertMessage = this.message.msg;
        this.alertType = this.message.msgType;
      } else {
        this.alertMessage = this.productMessage.msg;
        this.alertType = this.productMessage.msgType;
      }
      this.showAlert = true;
    },
    onSearchClick: function() {
      this.showAlert = false;
      this.hasExecutedSearch = true;
      this.loading = true;
      this.currentPage = 1;
      this.products = [];
      let payload = {
        productSearchTerm: this.productSearch,
        fuzziness: 1
      };
      let self = this;

      this.searchProducts(payload)
        .then(response => {
          this.loading = false;
          if (response) {
            self.products = response;
          } else {
            self.showMessage("PRODUCT");
          }
        })
        .catch(error => {
          this.loading = false;
          self.showMessage("PRODUCT");
        });
    },
    getProduct: function(id) {
      let match = _.findWhere(this.productCartCounts, { productId: id });
      return match;
    },
    onUpdateResultsPerPage: function(number) {
      this.updateResultsPerPage(number);
    },
    nextPage: function() {
      if (this.currentPage + 1 <= this.numberOfPages) {
        this.currentPage += 1;
      }
    },
    previousPage: function() {
      if (this.currentPage - 1 >= 1) {
        this.currentPage -= 1;
      }
    },
    handleSaveOrUpdateError: function() {
      this.showMessage("USER");
    },
    handleNoUserLoggedIn: function() {
      this.showLoginRequest = true;
    },
    ...mapActions("productStore", ["searchProducts", "updateResultsPerPage"]),
    ...mapActions("userStore", ["checkForUserSession", "checkForNewOrder"])
  },
  computed: {
    numberOfPages: function() {
      return Math.ceil(this.products.length / this.resultsPerPage);
    },
    ...mapState({
      resultsPerPage: state => state.productStore.itemsPerPage,
      resultsPerPageList: state => state.productStore.itemsPerPageList,
      user: state => state.userStore.userInfo,
      message: state => state.userStore.message,
      productMessage: state => state.productStore.message
    })
  }
};
</script>

<style scoped>
/*https://stackoverflow.com/questions/52473478/styling-vuetify-v-data-table */
.theme--light.v-data-table tbody tr:not(:last-child) .table-column,
.theme--light.v-data-table tbody tr:last-child .table-column {
  border-bottom: none;
  padding: 0px 5px;
}

.results-row {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
