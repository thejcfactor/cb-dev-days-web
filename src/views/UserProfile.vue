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
    <v-row justify="center" v-if="loading">
      <Loader message="Getting customer..."></Loader>
    </v-row>
    <v-row
      justify="center"
      v-else-if="!loading && customer != null && showProfile"
    >
      <v-col cols="12" xl="8" lg="10">
        <v-card class="user-profile-card">
          <v-card-title> {{ customer.username }}'s profile </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  label="First Name"
                  v-model="customer.custName.firstName"
                  readonly
                  outlined
                  dense
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  label="Last Name"
                  v-model="customer.custName.lastName"
                  readonly
                  outlined
                  dense
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  label="Username"
                  v-model="customer.username"
                  readonly
                  outlined
                  dense
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  label="Email"
                  v-model="customer.email"
                  readonly
                  outlined
                  dense
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col>
                <v-card>
                  <v-card-title>Addresses</v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="user-addresses-card">
                    <v-row>
                      <v-col>
                        <v-data-iterator
                          :items="addresses"
                          :items-per-page="4"
                          hide-default-footer
                          :loading-text="`Looking up addresses...`"
                          disable-filtering
                          disable-pagination
                          disable-sort
                        >
                          <template v-slot:default="{ items }">
                            <v-row justify="center">
                              <v-col
                                v-for="item in items"
                                :key="item.name"
                                cols="12"
                                sm="6"
                                md="4"
                                lg="3"
                                xl="3"
                              >
                                <v-card>
                                  <v-card-title>
                                    <div class="d-flex flex-row address-header">
                                      <div>{{ item.name }}</div>
                                      <v-spacer></v-spacer>
                                      <div class="align-self-center">
                                        <v-tooltip top>
                                          <template v-slot:activator="{ on }">
                                            <v-btn
                                              icon
                                              x-small
                                              v-on="on"
                                              @click="onEditAddressClick(item)"
                                            >
                                              <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                          </template>
                                          <span>Edit address</span>
                                        </v-tooltip>
                                      </div>
                                    </div>
                                  </v-card-title>
                                  <v-divider></v-divider>
                                  <v-card-text>
                                    <div
                                      class="d-flex flex-column justify-start caption"
                                    >
                                      <div>
                                        {{ getAddressInfo("street", item) }}
                                      </div>
                                      <div
                                        v-show="
                                          getAddressInfo('street2', item) != ''
                                        "
                                      >
                                        {{ getAddressInfo("street2", item) }}
                                      </div>
                                      <div>
                                        {{
                                          getAddressInfo("cityStateZip", item)
                                        }}
                                      </div>
                                    </div>
                                  </v-card-text>
                                </v-card>
                              </v-col>
                            </v-row>
                          </template>
                        </v-data-iterator>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center" v-else>
      <v-col>
        <div class="no-customer-msg">
          <p>No Customer Found.</p>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showEditAddressForm" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">
          Edit Address: {{ selectedAddress.name }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field label="Address" v-model="selectedAddress.address">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                label="Address 2"
                v-model="selectedAddress.address2"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field label="City" v-model="selectedAddress.city">
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                label="State"
                v-model="selectedAddress.state"
                :items="states"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field label="Zipcode" v-model="selectedAddress.zipCode">
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditAddressForm = false">Close</v-btn>
          <v-btn text @click="onSaveAddressClick">Save</v-btn>
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
import Loader from "@/components/Loader";
import { states } from "@/logic/utilities";
export default {
  name: "UserProfile",
  components: {
    Loader
  },
  data: () => ({
    showPassword: false,
    loading: false,
    showAlert: false,
    alertMessage: "",
    alertType: undefined,
    addresses: [],
    resultsPerPage: 4,
    currentPage: 1,
    showEditAddressForm: false,
    infoAlert: false,
    infoAlertHeader: "Missing Information",
    infoAlertMessage: "",
    selectedAddress: {
      name: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zipCode: ""
    }
  }),
  created: function() {
    this.showAlert = false;
    let self = this;
    if (this.customer == null) {
      this.checkSession();
    } else {
      this.getCustomer();
    }
  },
  methods: {
    checkSession: function() {
      let self = this;
      this.checkForUserSession()
        .then(response => {
          if (self.customer == null) {
            this.$router.push({ path: "/login" }).catch(error => {});
          }
          if (!response) {
            self.showMessage();
          }
          self.getCustomer();
        })
        .catch(error => {
          console.log(error);
          self.showMessage();
          this.$router.push({ path: "/login" }).catch(error => {});
        });
    },
    getCustomer: function() {
      let self = this;
      this.getCustomerById()
        .then(response => {
          if (!response) {
            self.showMessage();
          } else {
            self.addresses = self.customerAddresses;
            self.checkOrder();
          }
        })
        .catch(error => {
          self.showMessage();
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
    showMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    getAddressInfo: function(infoType, address) {
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
    onEditAddressClick: function(address) {
      this.showEditAddressForm = true;
      this.selectedAddress.name = address.name;
      this.selectedAddress.address = address.address;
      this.selectedAddress.address2 = address.address2 ? address.address2 : "";
      this.selectedAddress.city = address.city;
      let match = states.find(s => s.abbr == address.state);
      if (match) {
        this.selectedAddress.state = match.name;
      }
      this.selectedAddress.zipCode = address.zipCode;
    },
    onSaveAddressClick: function() {
      this.showEditAddressForm = false;
      if (!this.validateAddress()) {
        this.infoAlertHeader = "Missing Information";
        this.infoAlertMessage =
          "Please provide all required address information.";
        this.infoAlert = true;
        return;
      }

      let match = states.find(s => s.name == this.selectedAddress.state);
      if (match) {
        this.selectedAddress.state = match.abbr;
      }

      let scope = this;
      this.showLoader = true;
      this.loaderMessage = "Updating address...";
      console.log(this.selectedAddress);
      this.updateAddress(this.selectedAddress)
        .then(response => {
          scope.showLoader = false;
          scope.showMessage();
          if (response) {
            scope.addresses = scope.customerAddresses;
          }
        })
        .catch(error => {
          scope.showLoader = false;
          scope.showMessage();
        });
    },
    validateAddress: function() {
      if (
        this.selectedAddress.address &&
        this.selectedAddress.address != "" &&
        this.selectedAddress.city &&
        this.selectedAddress.city != "" &&
        this.selectedAddress.state &&
        this.selectedAddress.state != "" &&
        this.selectedAddress.zipCode &&
        this.selectedAddress.zipCode != ""
      ) {
        return true;
      }
      return false;
    },
    ...mapActions("userStore", [
      "checkForUserSession",
      "getCustomerById",
      "checkForNewOrder",
      "updateAddress"
    ])
  },
  computed: {
    states: function() {
      return states.map(state => state.name);
    },
    ...mapState({
      customer: state => state.userStore.customerInfo,
      message: state => state.userStore.message,
      showProfile: state => state.userStore.showUserProfile
    }),
    ...mapGetters("userStore", {
      customerAddresses: "customerAddresses"
    })
  }
};
</script>

<style>
.no-customer-msg {
  background-color: #eaecee;
  outline: 2px solid black;
  color: #000;
  min-height: 100px;
  position: relative;
  border-radius: 4px;
  margin-top: 5px;
}

.no-customer-msg p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}

.user-profile-card {
  max-height: 750px;
  overflow-y: auto;
  overflow-x: hidden;
}

.user-addresses-card {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.address-header {
  width: 100%;
}
</style>
