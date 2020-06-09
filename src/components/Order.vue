<template>
  <v-col>
    <v-row class="order-header">
      <v-col cols="3">
        <div class="d-flex flex-column">
          <div class="caption font-weight-bold">Order Placed</div>
          <div class="caption">
            {{ formatOrderDate(order.orderDate) }}
          </div>
        </div>
      </v-col>
      <v-col cols="1">
        <div class="d-flex flex-column">
          <div class="caption font-weight-bold">Total</div>
          <div class="caption">{{ formatCurrency(order.grandTotal) }}</div>
        </div>
      </v-col>
      <v-col cols="3">
        <div class="d-flex flex-column">
          <div class="caption font-weight-bold">Ship To</div>
          <div class="caption">{{ order.shippedTo }}</div>
        </div>
      </v-col>
      <v-col cols="auto" class="ml-auto">
        <div class="d-flex flex-column">
          <div class="caption font-weight-bold">
            Order #<span class="ml-2">{{ formatOrderNum(order.id) }}</span>
          </div>
          <div
            class="caption align-self-center order-detail-link"
            @click.stop="onOrderDetailsClick(order.id)"
          >
            Order Details
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row class="order-body">
      <v-col>
        <v-row justify="start">
          <v-col>
            <div class="title">
              Status:<span class="ml-2">{{ order.orderStatus }}</span>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row v-for="(lineItem, idx) in order.lineItems" :key="idx">
              <OrderLineItem :lineItem="lineItem"></OrderLineItem>
            </v-row>
          </v-col>
          <v-col xl="4" lg="3" md="2">
            <div class="d-flex flex-column align-end">
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn class="mb-2" min-width="200" v-on="on"
                    >Track Package</v-btn
                  >
                </template>
                <span>Button action not implemented.</span>
              </v-tooltip>
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn class="mb-2" min-width="200" v-on="on"
                    >Return Item</v-btn
                  >
                </template>
                <span>Button action not implemented.</span>
              </v-tooltip>
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn min-width="200" v-on="on">Review Product</v-btn>
                </template>
                <span>Button action not implemented.</span>
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { mapActions } from "vuex";
import OrderLineItem from "@/components/OrderLineItem";
import { formatDate } from "@/logic/utilities";

export default {
  name: "Order",
  components: {
    OrderLineItem
  },
  props: {
    order: {
      type: Object,
      required: true,
      default: null
    }
  },
  data: () => ({}),
  methods: {
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
    formatOrderDate: function(date) {
      if (date) {
        return formatDate(date, "MMMM Do, YYYY");
      } else {
        return "Order not placed.";
      }
    },
    formatOrderNum: function(order) {
      let orderParts = order.split("_");
      return orderParts[1];
    },
    onOrderDetailsClick: function(id) {
      this.setOrderDetailId(id);
      this.$router.push({ path: "orderDetail" }).catch(error => {});
    },
    ...mapActions("userStore", ["setOrderDetailId"])
  }
};
</script>

<style scoped>
.order-header {
  border: 1px solid gray;
  border-radius: 5px 5px 0px 0px;
}

.order-body {
  margin-top: -1px;
  border: 1px solid gray;
  border-radius: 0px 0px 5px 5px;
}

.order-detail-link {
  color: blue;
  cursor: pointer;
}
</style>
