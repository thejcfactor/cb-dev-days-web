<template>
  <v-card max-width="260">
    <v-img
      alt="Product Image"
      class="mt-2 mx-2"
      contain
      src="@/assets/shopping_bag_img.png"
      height="100"
    />
    <v-card-text class="pt-0">
      <v-row class="mx-0">
        <div class="subtitle-1 font-weight-bold">
          {{ product.dispName }}
        </div>
      </v-row>
      <v-row class="mx-0">
        <v-rating
          :value="productRating"
          color="amber"
          dense
          half-increments
          readonly
          size="12"
        ></v-rating>

        <div class="grey--text ml-4">
          {{ productRating }} ({{ productVotes }})
        </div>
      </v-row>
      <v-row class="mx-0">
        <v-col class="pa-0">
          <div class="d-flex justify-space-between">
            <div class="font-weight-bold">
              {{ productPrice }}
            </div>
            <div
              v-bind:class="{
                'out-of-stock': !inStock,
                'in-stock': inStock
              }"
            >
              {{ stockType }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn icon @click="onShowDetailsClick">
        <v-icon>
          {{ selected ? "mdi-chevron-up" : "mdi-chevron-down" }}
        </v-icon>
      </v-btn>
    </v-card-actions>
    <v-expand-transition>
      <div v-show="selected">
        <v-divider></v-divider>
        <v-card-text>
          <v-row class="mx-0">
            <div class="d-flex flex-column justify-start">
              <div class="caption font-weight-bold">
                Product Details
              </div>
              <div class="caption">
                {{ product.shortDescr }}
              </div>
            </div>
          </v-row>
          <v-divider></v-divider>
          <div class="d-flex flex-row-reverse cart-adj-div">
            <v-btn
              icon
              small
              outlined
              class="align-self-center ml-1"
              @click="addProduct"
              :disabled="!inStock"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <input
              type="text"
              class="cart-count-input"
              v-model="count"
              :readonly="!inStock"
            />
            <v-btn
              icon
              small
              outlined
              class="align-self-center mr-1"
              @click="removeProduct"
              :disabled="count == 0"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </div>
          <v-row class="mx-0">
            <v-spacer></v-spacer>
            <v-btn small @click="addToCart" :disabled="count == 0">
              Add To Cart
            </v-btn>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { formatCurrency } from "@/logic/utilities";

export default {
  name: "HomePageProduct",
  props: {
    product: {
      type: Object,
      required: false,
      default: null
    }
  },
  data: () => ({
    selected: false,
    count: 0
  }),
  methods: {
    isInStock: function() {
      if (this.product != null && this.product.availability == "In-Stock") {
        return true;
      }

      return false;
    },
    onShowDetailsClick: function() {
      if (this.selected) {
        this.count = 0;
      }
      this.selected = !this.selected;
    },
    addProduct: function() {
      this.count += 1;
    },
    removeProduct: function() {
      this.count -= 1;
    },
    addToCart: function() {
      if (this.user == null) {
        this.$emit("noUserLoggedIn");
        return;
      }

      let payload = {
        product: this.product,
        count: this.count
      };
      let scope = this;
      this.saveOrUpdateNewOrder(payload)
        .then(response => {
          scope.selected = false;
          if (!response) {
            scope.$emit("saveOrUpdateError");
          }
        })
        .catch(error => {
          scope.$emit("saveOrUpdateError");
        });
    },
    ...mapActions("userStore", ["saveOrUpdateNewOrder"])
  },
  computed: {
    productPrice: function() {
      return formatCurrency(this.product.price);
    },
    inStock: function() {
      return this.product != null && this.product.availability == "In-Stock";
    },
    stockType: function() {
      if (this.inStock) {
        return "In Stock";
      } else {
        return "Out of Stock";
      }
    },
    productRating: function() {
      let ratings = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
      let idx = Math.floor(Math.random() * ratings.length);
      return ratings[idx];
    },
    productVotes: function() {
      return Math.floor(Math.random() * 500);
    },
    ...mapState({
      user: state => state.userStore.userInfo
    })
  }
};
</script>

<style scoped></style>
