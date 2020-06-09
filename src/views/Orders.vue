<template>
  <v-container>
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
    <v-row justify="center" v-if="showLoader">
      <Loader :message="loaderMessage"></Loader>
    </v-row>
    <v-row justify="center" v-else>
      <v-col cols="12" xl="6" lg="8" md="9">
        <v-row class="orders-total">
          <div class="grey--text">Found {{ orders.length }} orders</div>
        </v-row>
        <v-row class="orders-listing pa-2">
          <v-col>
            <v-row
              justify="center"
              v-for="(order, idx) in ordersOnPage"
              :key="idx"
            >
              <Order :order="order"></Order>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="orders-pagination">
          <v-col>
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Loader from "@/components/Loader";
import Order from "@/components/Order";

export default {
  name: "Orders",
  components: {
    Loader,
    Order
  },
  data: () => ({
    showLoader: false,
    loaderMessage: "Retrieving orders...",
    currentPage: 1,
    ordersPerPage: 2,
    showAlert: false,
    alertMessage: "",
    alertType: undefined
  }),
  created: function() {
    this.showLoader = true;
    if (this.user == null) {
      this.checkSession();
    } else {
      this.checkOrders();
    }
  },
  methods: {
    checkSession: function() {
      let self = this;
      this.checkForUserSession()
        .then(response => {
          if (self.user == null) {
            self.showLoader = false;
            self.$router.push({ path: "login" }).catch(error => {});
          } else {
            self.checkOrders();
          }
        })
        .catch(error => {
          self.showLoader = false;
          self.$router.push({ path: "login" }).catch(error => {});
        });
    },
    checkOrders: function() {
      let self = this;
      this.getCustomerOrders()
        .then(response => {
          self.showLoader = false;
          if (!response) {
            self.showMessage();
          }
        })
        .catch(error => {
          self.showLoader = false;
          self.showMessage();
        });
    },
    showMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    ...mapActions("userStore", ["checkForUserSession", "getCustomerOrders"])
  },
  computed: {
    totalPages: function() {
      return Math.ceil(this.orders.length / this.ordersPerPage);
    },
    ordersOnPage: function() {
      let start = (this.currentPage - 1) * this.ordersPerPage;
      //slice - the end value is not included, so can go to array length w/o error
      let end = this.currentPage * this.ordersPerPage;
      return this.orders.slice(start, end);
    },
    ...mapState({
      user: state => state.userStore.userInfo,
      message: state => state.userStore.message,
      orders: state => state.userStore.orders
    })
  }
};
</script>

<style scoped>
.orders-total {
  margin-bottom: 10px;
  border-bottom: 1px solid gray;
}

.orders-listing {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}

.orders-pagination {
  margin-top: 10px;
  border-top: 1px solid gray;
}
</style>
