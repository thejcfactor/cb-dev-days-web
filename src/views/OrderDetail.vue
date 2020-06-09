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
    <v-row justify="center">
      <Loader message="Retreiving order details..." v-if="loading"></Loader>
      <v-col xl="6" lg="7" md="8">
        <v-row>
          <v-col class="pb-0">
            <div class="caption grey--text font-weight-regular">
              Your Account >
              <span class="your-orders-link" @click.stop="onYourOrdersClick"
                >Your Orders</span
              >
              > Order Details
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="pb-0">
            <div class="title">Order Details</div>
          </v-col>
        </v-row>
        <v-row v-if="order != null">
          <v-col class="pt-0">
            <div class="d-flex flex-row body-2 font-weight-bold">
              <div>
                Ordered on
                <span class="font-weight-light">{{ getOrderDate() }}</span>
              </div>
              <v-divider class="mx-3" vertical></v-divider>
              <div>
                Order #
                <span class="font-weight-light">{{
                  order != null ? order.orderId : ""
                }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="rounded-border" v-if="order != null">
          <v-col>
            <div class="d-flex flex-column justify-start caption">
              <div class="font-weight-bold">Shipping Address</div>
              <div>{{ getShippingInfo("name") }}</div>
              <div>{{ getShippingInfo("street") }}</div>
              <div v-show="getShippingInfo('street2') != ''">
                {{ getShippingInfo("street2") }}
              </div>
              <div>{{ getShippingInfo("cityStateZip") }}</div>
            </div>
          </v-col>
          <v-col>
            <div class="d-flex flex-column justify-start caption">
              <div class="font-weight-bold">Payment Method</div>
              <div>
                {{ randomPaymentMethod }}
              </div>
            </div>
          </v-col>
          <v-col>
            <div class="d-flex flex-column justify-start caption">
              <div class="font-weight-bold">Order Summary</div>
              <div class="d-flex flex-row justify-space-between">
                <div>Item(s) Subtotal:</div>
                <div>{{ getOrderSubtotal() }}</div>
              </div>
              <div class="d-flex flex-row justify-space-between">
                <div>Shipping &amp; Handling:</div>
                <div>{{ getOrderShipping() }}</div>
              </div>
              <div class="d-flex flex-row justify-space-between">
                <div>Tax:</div>
                <div>{{ getOrderTax() }}</div>
              </div>
              <div
                class="d-flex flex-row justify-space-between font-weight-bold"
              >
                <div>Grand Total:</div>
                <div>{{ getOrderGrandTotal() }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row
          class="rounded-border mt-4"
          v-if="order != null && order.lineItems != null"
        >
          <v-col>
            <v-row v-for="(lineItem, idx) in order.lineItems" :key="idx">
              <OrderLineItem :lineItem="lineItem"></OrderLineItem>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Loader from "@/components/Loader";
import OrderLineItem from "@/components/OrderLineItem";
import moment from "moment";

export default {
  name: "OrderDetail",
  components: {
    Loader,
    OrderLineItem
  },
  data: () => ({
    loading: false,
    showAlert: false,
    alertMessage: "",
    alertType: undefined
  }),
  created: function() {
    if (this.user == null) {
      this.$router.push({ path: "orders" }).catch(error => {});
    }
    this.loading = true;
    let self = this;
    this.getOrder()
      .then(response => {
        self.loading = false;
        if (!response) {
          self.showMessage();
        }
      })
      .catch(error => {
        self.loading = false;
        self.showMessage();
      });
  },
  methods: {
    showMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    formatCurrency: function(value) {
      if (value == null) {
        return "N/A";
      } else {
        var formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2
        });
        return formatter.format(value);
      }
    },
    formatOrderNum: function(order) {
      let orderParts = order.split("_");
      return orderParts[1];
    },
    onYourOrdersClick: function() {
      this.$router.push({ path: "orders" }).catch(error => {});
    },
    getOrderDate: function() {
      if (this.order != null) {
        return moment(this.order.orderDate).format("dddd, MMMM Do, YYYY");
      }
      return "";
    },
    getShippingInfo: function(infoType) {
      let info = "";
      if (infoType == "name") {
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.name
        ) {
          info = this.order.shippingInfo.name;
        }
      } else if (infoType == "street") {
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.address
        ) {
          info = this.order.shippingInfo.address.address1;
        }
      } else if (infoType == "street2") {
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.address
        ) {
          info = this.order.shippingInfo.address.address2;
        }
      } else if (infoType == "cityStateZip") {
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.address &&
          this.order.shippingInfo.address.city
        ) {
          info = this.order.shippingInfo.address.city;
        }
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.address &&
          this.order.shippingInfo.address.state
        ) {
          info += `, ${this.order.shippingInfo.address.state}`;
        }
        if (
          this.order &&
          this.order.shippingInfo &&
          this.order.shippingInfo.address &&
          this.order.shippingInfo.address.zipCode
        ) {
          info += ` ${this.order.shippingInfo.address.zipCode}`;
        }
      }
      return info;
    },
    getOrderSubtotal: function() {
      let subTotal = 0.0;
      if (this.order != null) {
        for (let i = 0; i < this.order.lineItems.length; i++) {
          subTotal += this.order.lineItems[i].price;
        }
      }
      return this.formatCurrency(subTotal);
    },
    getOrderShipping: function() {
      let shippingTotal = this.order != null ? this.order.shippingTotal : 0.0;
      return this.formatCurrency(shippingTotal);
    },
    getOrderTax: function() {
      let taxTotal = this.order != null ? this.order.tax : 0.0;
      return this.formatCurrency(taxTotal);
    },
    getOrderGrandTotal: function() {
      let grandTotal = this.order != null ? this.order.grandTotal : 0.0;
      return this.formatCurrency(grandTotal);
    },
    ...mapActions("userStore", ["checkForUserSession", "getOrder"])
  },
  computed: {
    randomPaymentMethod: function() {
      const cardTypes = ["VISA", "MasterCard", "American Express", "Discover"];
      let idx = Math.floor(Math.random() * cardTypes.length);
      let cardNum = Math.floor(Math.random() * 1000) + 1000;

      return `${cardTypes[idx]} ****${cardNum}`;
    },
    ...mapState({
      user: state => state.userStore.userInfo,
      message: state => state.userStore.message,
      order: state => state.userStore.orderDetail
    })
  }
};
</script>

<style scoped>
span.your-orders-link:hover {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
}

.rounded-border {
  border: 1px solid gray;
  border-radius: 5px;
}
</style>
