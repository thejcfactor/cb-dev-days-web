<template>
  <v-col>
    <v-row>
      <v-col cols="3">
        <v-img
          alt="Product Image"
          class="mt-2 mx-2"
          contain
          src="@/assets/shopping_bag_img.png"
          height="100"
        />
      </v-col>
      <v-col>
        <div class="d-flex flex-column mt-5">
          <div>{{ lineItem.dispName }}</div>
          <div class="d-flex flex-row justify-start">
            <div>{{ lineItemPrice }}</div>
            <div class="ml-5">
              Quantity: <span class="ml-2">{{ lineItem.qty }}</span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { formatCurrency } from "@/logic/utilities";
export default {
  name: "OrderLineItem",
  props: {
    lineItem: {
      type: Object,
      required: true,
      default: null
    }
  },
  data: () => ({}),
  computed: {
    lineItemPrice: function() {
      //let price = this.lineItem.price / this.lineItem.qty;
      return formatCurrency(this.lineItem.price);
    }
  }
};
</script>

<style></style>
