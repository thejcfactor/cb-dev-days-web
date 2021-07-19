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
    <v-row justify="center" v-else-if="order != null && !showLoader">
      <v-col cols="10" xl="6" lg="8" md="6">
        <v-row class="mb-1">
          <v-col class="bordered-column pa-0 mr-1">
            <v-row class="mx-1">
              <v-col class="py-0">
                <div class="d-flex flex-row">
                  <div class="title">Shipping</div>
                  <v-spacer></v-spacer>
                  <div class="align-self-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          x-small
                          outlined
                          v-on="on"
                          @click="onAddAddressClick"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </template>
                      <span>Add address</span>
                    </v-tooltip>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row class="row-top-border mx-1">
              <v-col cols="6" class="pb-0">
                <v-select
                  :items="customerAddresses"
                  label="Selected Address"
                  outlined
                  dense
                  v-model="selectedShippingAddress"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mx-1">
              <v-col cols="6" class="ml-1 pt-0">
                <div class="d-flex flex-column justify-start caption">
                  <div class="subtitle-2">Shipping Address</div>
                  <div>{{ getShippingAddressInfo("street") }}</div>
                  <div v-show="getShippingAddressInfo('street2') != ''">
                    {{ getShippingAddressInfo("street2") }}
                  </div>
                  <div>{{ getShippingAddressInfo("cityStateZip") }}</div>
                </div>
              </v-col>
              <v-col cols="5" class="pt-0">
                <div class="d-flex flex-column justify-start caption">
                  <div class="subtitle-2">Shipping Method</div>
                  <v-radio-group v-model="selectedShippingMethod">
                    <v-radio
                      v-for="method in shippingMethods"
                      :key="method.id"
                      :label="`${method.name}`"
                      :value="method.id"
                      small
                    ></v-radio>
                  </v-radio-group>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col class="bordered-column pa-0">
            <v-row class="mx-1">
              <v-col class="py-0">
                <div class="d-flex flex-row">
                  <div class="title">Billing</div>
                  <v-spacer></v-spacer>
                  <div class="align-self-center">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          icon
                          x-small
                          outlined
                          v-on="on"
                          @click="onAddAddressClick"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </template>
                      <span>Add address</span>
                    </v-tooltip>
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row class="row-top-border mx-1">
              <v-col cols="6" class="pb-0">
                <v-select
                  :items="customerAddresses"
                  label="Selected Address"
                  outlined
                  dense
                  v-model="selectedBillingAddress"
                  :disabled="billingSameAsShipping"
                ></v-select>
              </v-col>
              <v-col>
                <v-checkbox
                  v-model="billingSameAsShipping"
                  :label="`Same as shipping`"
                  class="addr-chkbx"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row class="mx-1">
              <v-col cols="6" class="ml-1 pt-0">
                <div class="d-flex flex-column justify-start caption">
                  <div class="subtitle-2">Billing Address</div>
                  <div>{{ getBillingAddressInfo("street") }}</div>
                  <div v-show="getBillingAddressInfo('street2') != ''">
                    {{ getBillingAddressInfo("street2") }}
                  </div>
                  <div>{{ getBillingAddressInfo("cityStateZip") }}</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="bordered-column pa-0">
            <v-row class="row-bottom-border mx-1">
              <v-col class="pb-0">
                <div class="title">Items</div>
              </v-col>
              <v-col class="pb-0">
                <div
                  class="d-flex flex-row-reverse align-end mr-5 full-height-div"
                >
                  <div class="subtitle-2">Price</div>
                </div>
              </v-col>
            </v-row>
            <v-row
              v-for="(lineItem, idx) in order.lineItems"
              :key="idx"
              class="row-top-border mx-1"
            >
              <CartOrderLineItem
                :lineItem="lineItem"
                @addProductQty="onUpdateProductQty"
                @removeProductQty="onUpdateProductQty"
                @deleteItem="onDeleteItem"
              ></CartOrderLineItem>
            </v-row>
            <v-row class="row-top-border mx-1">
              <v-col>
                <div class="d-flex flex-row-reverse align-start">
                  <div class="font-weight-bold ml-2">
                    {{ formattedSubTotal }}
                  </div>
                  <div>Subtotal ({{ itemCount }} items):</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="2"
        xl="2"
        lg="3"
        md="4"
        class="bordered-column cart-purchase-col ml-2 pa-0"
      >
        <v-row class="mx-1">
          <v-col class="py-0">
            <div class="title">Order Summary</div>
          </v-col>
        </v-row>
        <v-row class="row-top-border mx-1">
          <v-col class="py-0">
            <div class="d-flex flex-column justify-start caption">
              <div class="d-flex flex-row justify-space-between">
                <div>Items ({{ itemCount }}):</div>
                <div>{{ formattedSubTotal }}</div>
              </div>
              <div class="d-flex flex-row justify-space-between">
                <div>Shipping &amp; Handling:</div>
                <div>{{ formattedShipping }}</div>
              </div>
              <div class="d-flex flex-row justify-space-between">
                <div>Estimated Tax:</div>
                <div>{{ formattedTax }}</div>
              </div>
              <v-divider></v-divider>
              <div class="d-flex flex-row justify-space-between title">
                <div>Order total:</div>
                <div>{{ formattedOrderTotal }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" class="mx-1 mt-2">
          <v-col cols="8">
            <v-btn small class="purchase-btn" @click="onPurchaseClick">
              Purchase
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" v-else>
      <v-col>
        <div class="no-items-msg">
          <p>No Items in cart.</p>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showNewAddressForm" persistent max-width="400">
      <v-card>
        <v-card-title class="headline"> New Address </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field v-model="newAddress.name">
                <template v-slot:label>
                  <div>Name</div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="newAddress.address"
                :rules="[rules.required]"
              >
                <template v-slot:label>
                  <div>Street<sup>*</sup></div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Street 2"
                v-model="newAddress.address2"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="newAddress.city" :rules="[rules.required]">
                <template v-slot:label>
                  <div>City<sup>*</sup></div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="newAddress.state"
                :items="states"
                :rules="[rules.required]"
              >
                <template v-slot:label>
                  <div>State<sup>*</sup></div>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="newAddress.zipCode"
                :rules="[rules.required]"
              >
                <template v-slot:label>
                  <div>Zipcode<sup>*</sup></div>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showNewAddressForm = false">Close</v-btn>
          <v-btn text @click="onSaveNewAddressClick">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="infoAlert" max-width="300">
      <v-card>
        <v-card-title class="headline">
          {{ infoAlertHeader }}
        </v-card-title>
        <v-card-text>
          {{ infoAlertMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="infoAlert = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import CartOrderLineItem from "@/components/CartOrderLineItem";
import Loader from "@/components/Loader";
import { _ } from "vue-underscore";
import { states, formatCurrency } from "@/logic/utilities";

export default {
  name: "Cart",
  components: {
    CartOrderLineItem,
    Loader,
  },

  data: () => ({
    selectedShippingAddress: null,
    billingSameAsShipping: true,
    selectedBillingAddress: null,
    showNewAddressForm: false,
    infoAlert: false,
    infoAlertHeader: "Missing Information",
    infoAlertMessage: "Please provide shipping & billing addresses for order.",
    newAddress: {
      name: null,
      address: null,
      address2: null,
      city: null,
      state: null,
      zipCode: null,
    },
    shippingMethods: [
      {
        id: 0,
        name: "Standard",
        price: 3.99,
      },
      {
        id: 1,
        name: "3 - Business Days",
        price: 7.99,
      },
      {
        id: 2,
        name: "Next Day Air",
        price: 15.99,
      },
    ],
    selectedShippingMethod: 0,
    showLoader: false,
    loaderMessage: "Processing order...",
    rules: {
      required: (value) => !!value || "Required.",
    },
    showAlert: false,
    alertMessage: "",
    alertType: undefined,
  }),
  created: function () {
    //only check for new/pending order if getting user from session
    if (this.user == null) {
      this.showLoader = true;
      this.loaderMessage = "Refreshing cart...";
      this.checkSession();
    }
  },
  methods: {
    checkSession: function () {
      let self = this;
      this.checkForUserSession()
        .then((response) => {
          if (self.user == null) {
            self.showLoader = false;
            self.$router.push({ path: "login" }).catch((error) => {});
          } else {
            self.checkOrder();
          }
        })
        .catch((error) => {
          self.showLoader = false;
          self.$router.push({ path: "login" }).catch((error) => {});
        });
    },
    checkOrder: function () {
      let self = this;
      this.checkForNewOrder()
        .then((response) => {
          self.showLoader = false;
          if (!response) {
            self.showMessage();
          }
        })
        .catch((error) => {
          self.showLoader = false;
          self.showMessage();
        });
    },
    showMessage: function () {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    getShippingAddressInfo: function (infoType) {
      if (
        !this.customer ||
        !this.selectedShippingAddress ||
        !this.shippingAddress
      ) {
        return "";
      }

      return this.getAddressInfo(infoType, this.shippingAddress);
    },
    getBillingAddressInfo: function (infoType) {
      if (
        !this.customer ||
        !(this.selectedBillingAddress || this.billingSameAsShipping) ||
        !this.billingAddress
      ) {
        return "";
      }

      return this.getAddressInfo(infoType, this.billingAddress);
    },
    getAddressInfo: function (infoType, address) {
      let info = "";
      if (infoType == "street") {
        info = address.address;
      } else if (infoType == "street2") {
        if (address.address2) {
          info = address.address2;
        }
      } else if (infoType == "cityStateZip") {
        info = address.city;
        info += `, ${address.state}`;
        info += ` ${address.zipCode}`;
      }
      return info;
    },
    onAddAddressClick: function () {
      this.showNewAddressForm = true;
    },
    onSaveNewAddressClick: function () {
      this.showNewAddressForm = false;
      if (!this.validateNewAddress()) {
        this.infoAlertHeader = "Missing Information";
        this.infoAlertMessage =
          "Please provide all required address information.";
        this.infoAlert = true;
        return;
      }

      let match = states.find((s) => s.name == this.newAddress.state);
      if (match) {
        this.newAddress.state = match.abbr;
      }

      let self = this;
      this.showLoader = true;
      this.loaderMessage = "Saving address...";
      this.saveNewAddress(this.newAddress)
        .then((response) => {
          self.showLoader = false;
          self.showMessage();
          if (response) {
            console.log(response);
            self.selectedShippingAddress = response["name"];
            self.customerAddresses.push(response["name"]);
          }
        })
        .catch((error) => {
          self.showLoader = false;
          self.showMessage();
        });
    },
    validateNewAddress: function () {
      if (
        this.newAddress.address &&
        this.newAddress.address != "" &&
        this.newAddress.city &&
        this.newAddress.city != "" &&
        this.newAddress.state &&
        this.newAddress.state != "" &&
        this.newAddress.zipCode &&
        this.newAddress.zipCode != ""
      ) {
        return true;
      }
      return false;
    },
    onUpdateProductQty: function (lineItem, qty) {
      let self = this;
      lineItem.qty += qty;
      this.updateProductQty(lineItem)
        .then((response) => {
          if (!response) {
            self.showMessage();
          }
        })
        .catch((error) => {
          self.showMessage();
        });
    },
    onDeleteItem: function (lineItem) {
      let self = this;
      let newOrder = self.updateOrderLineItems(
        JSON.parse(JSON.stringify(self.order)),
        lineItem
      );

      let payload = {
        order: newOrder,
        id: lineItem.prodId,
      };

      this.removeProductFromCart(payload)
        .then((response) => {
          if (!response) {
            self.showMessage();
          }
          if (response.includes("deleted")) {
            this.$router.push({ path: "home" }).catch((error) => {});
          }
        })
        .catch((error) => {
          self.showMessage();
        });
    },
    onPurchaseClick: function () {
      if (!this.billingAddress || !this.shippingAddress) {
        this.infoAlertHeader = "Missing Information";
        this.infoAlertMessage =
          "Please provide shipping & billing addresses for order.";
        this.infoAlert = true;
        return;
      }
      let name = `${this.customer.custName.firstName} ${this.customer.custName.lastName}`;
      let billingInfo = {
        name: name,
        address: this.billingAddress,
      };
      let shippingInfo = {
        name: name,
        address: this.shippingAddress,
      };
      let payload = {
        billingInfo: billingInfo,
        shippingInfo: shippingInfo,
        shippingTotal: this.shipping,
        tax: this.tax,
        grandTotal: this.orderTotal,
      };
      let self = this;
      this.showLoader = true;
      this.loaderMessage = "Processing order...";
      this.placeOrder(payload)
        .then((response) => {
          self.showLoader = false;
          if (response) {
            this.$router.push({ path: "orders" }).catch((error) => {});
          } else {
            self.showMessage();
          }
        })
        .catch((error) => {
          self.showLoader = false;
          self.showMessage();
        });
    },
    updateOrderLineItems: function (order, lineItem) {
      let index = -1;
      for (let i = 0; i < order.lineItems.length; i++) {
        if (order.lineItems[i].prodId == lineItem.prodId) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        order.lineItems.splice(index, 1);
      }

      let total = _.reduce(
        order.lineItems,
        function (sum, li) {
          return sum + li.subTotal;
        },
        0
      );
      order.grandTotal = total;
      return order;
    },
    ...mapActions("userStore", [
      "checkForUserSession",
      "checkForNewOrder",
      "saveNewOrder",
      "updateProductQty",
      "removeProductFromCart",
      "placeOrder",
      "saveNewAddress",
    ]),
  },
  computed: {
    states: function () {
      return _.map(states, (state) => state.name);
    },
    shipping: function () {
      let match = _.findWhere(this.shippingMethods, {
        id: this.selectedShippingMethod,
      });

      let cost = typeof match != "undefined" ? match.price : 0.0;

      return cost;
    },
    formattedShipping: function () {
      return formatCurrency(this.shipping);
    },
    tax: function () {
      let tax = this.subTotal * 0.0825;
      return tax;
    },
    formattedTax: function () {
      return formatCurrency(this.tax);
    },
    orderTotal: function () {
      let total = this.subTotal + this.tax + this.shipping;
      return total;
    },
    formattedOrderTotal: function () {
      return formatCurrency(this.orderTotal);
    },
    formattedSubTotal: function () {
      return formatCurrency(this.subTotal);
    },
    customerAddresses: {
      get: function () {
        if (this.customer != null) {
          return Object.keys(this.customer.address);
        }
        return null;
      },
      set: function (newAddress) {
        if (!Object.keys(this.customer.address).includes(newAddress)) {
          console.log("new address not included");
        }
      },
    },
    shippingAddress: function () {
      if (this.selectedShippingAddress && this.customer.address) {
        //let addr = _.pick(this.customer.address, this.selectedShippingAddress);
        //return addr;
        return this.customer.address[this.selectedShippingAddress];
      }
      return null;
    },
    billingAddress: function () {
      if (this.customer.address) {
        if (this.billingSameAsShipping && this.selectedShippingAddress) {
          return this.customer.address[this.selectedShippingAddress];
        } else if (this.selectedBillingAddress) {
          return this.customer.address[this.selectedBillingAddress];
        }
      }
      return null;
    },
    ...mapState({
      user: (state) => state.userStore.userInfo,
      message: (state) => state.userStore.message,
      customer: (state) => state.userStore.customerInfo,
      order: (state) => state.userStore.newOrder,
    }),
    ...mapGetters("userStore", {
      itemCount: "cartCount",
      subTotal: "newOrderSubTotal",
    }),
  },
};
</script>

<style scoped>
.no-items-msg {
  background-color: #eaecee;
  outline: 2px solid black;
  color: #000;
  min-height: 100px;
  position: relative;
  border-radius: 4px;
  margin-top: 5px;
}

.no-items-msg p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}

.row-top-border {
  border-top: 1px solid gray;
}

.full-height-div {
  height: 100%;
}

.bordered-column {
  border: 1px solid gray;
  border-radius: 5px;
}

.cart-purchase-col {
  margin-top: 12px;
  max-height: 200px;
}

div.v-input--checkbox.addr-chkbx {
  margin-top: 5px;
}

.purchase-btn {
  width: 100%;
}
</style>
