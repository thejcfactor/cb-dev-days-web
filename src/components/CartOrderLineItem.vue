<template>
  <v-col class="py-0">
    <v-row>
      <v-col cols="3" class="py-0">
        <v-img
          alt="Product Image"
          class="mt-2 mx-2"
          contain
          src="@/assets/shopping_bag_img.png"
          height="100"
        />
      </v-col>
      <v-col class="py-0">
        <v-row>
          <v-col>
            <div class="d-flex flex-column justify-start align-start">
              <div class="title">{{ lineItemLocal.dispName }}</div>
              <div class="caption in-stock">In Stock</div>
            </div>
          </v-col>
          <v-col>
            <div class="d-flex flex-row-reverse align-end">
              <div class="title">{{ lineItemPrice }}</div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="d-flex flex-row justify-start align-start">
              <div class="d-flex flex-row-reverse cart-adj-div">
                <v-btn
                  icon
                  small
                  outlined
                  class="align-self-center ml-1"
                  @click="addProductQty"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <input
                  type="text"
                  class="cart-count-input"
                  v-model="lineItemLocal.qty"
                />
                <v-btn
                  icon
                  small
                  outlined
                  class="align-self-center mr-1"
                  @click="removeProductQty"
                  :disabled="lineItemLocal.qty <= 1"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
              </div>
              <v-divider class="mx-3" vertical></v-divider>
              <div class="align-self-center">
                <v-btn text small outlined @click="onDeleteItemClick"
                  >Delete</v-btn
                >
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { formatCurrency } from "@/logic/utilities";
export default {
  name: "CartOrderLineItem",
  props: {
    lineItem: {
      type: Object,
      required: true,
      default: null,
    },
  },
  data: () => ({
    lineItemLocal: null
  }),
  created: function () {
    this.lineItemLocal = JSON.parse(JSON.stringify(this.lineItem))
  },
  methods: {
    addProductQty: function () {
      this.lineItemLocal.qty += 1;
      console.log("emitting");
      this.$emit("addProductQty", this.lineItem, 1);
    },
    removeProductQty: function () {
      this.lineItemLocal.qty -= 1;
      this.$emit("removeProductQty", this.lineItem, -1);
    },
    onDeleteItemClick: function () {
      this.$emit("deleteItem", this.lineItem);
    },
  },
  computed: {
    lineItemPrice: function () {
      //let price = this.lineItem.price / this.lineItem.qty;
      return formatCurrency(this.lineItemLocal.price);
    },
  },
  watch: {
    lineItem: function(newVal) {
      this.lineItemLocal = JSON.parse(JSON.stringify(newVal))
    },
  },
};
</script>

<style></style>
