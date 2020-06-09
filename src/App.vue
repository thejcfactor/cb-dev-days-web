<template>
  <v-app>
    <v-navigation-drawer v-model="showDrawer" temporary app>
      <v-list dense>
        <v-list-item
          v-for="(item, index) in navigationMenuItems"
          :key="index"
          @click="onNavItemClick(item)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="(item, index) in userMenuItems"
          :key="index"
          @click="onNavItemClick(item)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app :collapse="$vuetify.breakpoint.xsOnly">
      <div class="d-flex align-center">
        <v-app-bar-nav-icon
          @click.stop="showDrawer = !showDrawer"
        ></v-app-bar-nav-icon>
        <v-toolbar-title class="toolbar-logo" @click.stop="onToolbarLogoClick">
          <v-img
            alt="Couchbase NoEqual Logo"
            class="mr-2"
            contain
            src="@/assets/couchbase_no_equal.png"
            width="200"
          />
        </v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <div v-show="!$vuetify.breakpoint.xsOnly">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text>
              <v-icon>mdi-account-circle</v-icon>
              <span class="text-none body-2"
                >Hello {{ firstName != null ? firstName : "" }}</span
              >
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in userMenuItems"
              :key="index"
              @click="onNavItemClick(item)"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-btn text v-show="!$vuetify.breakpoint.xsOnly" @click="onCartClick">
        <span class="text-none mr-2">Cart</span>
        <v-badge
          :content="itemsInCart != null ? itemsInCart : '0'"
          color="red"
          overlap
        >
          <v-icon>mdi-cart-minus</v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <v-content>
      <div class="d-flex flex-column wrapper">
        <div class="main-content">
          <router-view></router-view>
        </div>
        <div
          class="d-flex flex-column rr-wrapper"
          v-bind:class="{
            'rr-collapsed': !showRequestResponse,
            'rr-show': showRequestResponse
          }"
        >
          <div class="rr-toggle">
            <v-btn
              small
              outlined
              text
              v-on:click="showRequestResponse = !showRequestResponse"
            >
              <v-icon
                left
                medium
                class="rr-icon"
                v-bind:class="{ down: !showRequestResponse }"
                >mdi-chevron-up</v-icon
              >
              Under the hood
            </v-btn>
          </div>
          <div class="rr-content">
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="12" xl="10" lg="10" md="10">
                  <v-row>
                    <v-col cols="6">
                      <v-data-table
                        :headers="requestHeaders"
                        :items="requests"
                        item-key="requestId"
                        dense
                        fixed-header
                        single-select
                        v-model="selectedReq"
                        height="200px"
                        @click:row="onRequestClick"
                        @item-selected="onItemSelected"
                        show-select
                      >
                      </v-data-table>
                    </v-col>
                    <v-col cols="5">
                      <v-card>
                        <v-card-text>
                          <v-tabs>
                            <v-tab>Request</v-tab>
                            <v-tab>Response</v-tab>
                            <v-tab-item>
                              <v-card flat>
                                <v-card-text
                                  class="rr-scroll"
                                  v-if="
                                    selectedRequest &&
                                      selectedRequest.requestBody
                                  "
                                >
                                  <v-textarea
                                    :value="selectedRequest.requestBody"
                                    readonly
                                    dense
                                  >
                                  </v-textarea>
                                </v-card-text>
                                <v-card-text v-else>
                                  No request body.
                                </v-card-text>
                              </v-card>
                            </v-tab-item>
                            <v-tab-item>
                              <v-card flat>
                                <v-card-text
                                  class="rr-scroll"
                                  v-if="
                                    selectedRequest &&
                                      selectedRequest.responseObj
                                  "
                                >
                                  <v-textarea
                                    :value="selectedRequest.responseObj"
                                    readonly
                                    dense
                                  >
                                  </v-textarea>
                                </v-card-text>
                                <v-card-text v-else>
                                  No response body.
                                </v-card-text>
                              </v-card>
                            </v-tab-item>
                          </v-tabs>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </div>
      </div>
    </v-content>
  </v-app>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "App",

  components: {},

  data: () => ({
    showDrawer: false,
    searchTerm: "",
    showRequestResponse: false,
    selectedReq: []
  }),

  methods: {
    onToolbarLogoClick: function() {
      //eating possible route error
      this.$router.push({ path: "home" }).catch(error => {});
    },
    onNavItemClick: function(menuItem) {
      if (menuItem.path !== this.$route.path) {
        //eating possible route error
        let path = menuItem.path.substring(1, menuItem.path.length);
        if (menuItem.name === "signOut") {
          this.logout();
        }
        this.$router.push({ path: path }).catch(error => {});
      }
    },
    onCartClick: function() {
      //eating the route error if user tries to go to cart before logging in
      this.$router.push({ path: "cart" }).catch(error => {});
    },
    onRequestClick: function(request) {
      this.updateSelectedIndex(request.requestId);
      this.selectedReq = [];
      this.selectedReq.push(request);
    },
    onItemSelected: function(request) {
      if (request.value) {
        this.updateSelectedIndex(request.item.requestId);
      }
    },
    ...mapActions("userStore", ["logout"]),
    ...mapActions("requestStore", ["updateSelectedIndex"])
  },

  computed: {
    userMenuItems: function() {
      if (this.firstName) {
        return [
          {
            name: "signOut",
            label: "Sign Out",
            icon: "mdi-logout",
            path: "/login"
          },
          {
            name: "orders",
            label: "Orders",
            icon: "mdi-newspaper-variant-multiple-outline",
            path: "/orders"
          },
          {
            name: "cart",
            label: "Cart",
            icon: "mdi-cart-minus",
            path: "/cart"
          },
          {
            name: "userProfile",
            label: "User Profile",
            icon: "mdi-account-cog",
            path: "/userProfile"
          }
        ];
      }

      return [
        {
          name: "signIn",
          label: "Sign In",
          icon: "mdi-login",
          path: "/login"
        }
      ];
    },
    navigationMenuItems: function() {
      return [
        {
          name: "home",
          label: "Home",
          icon: "mdi-home",
          path: "/home"
        },
        {
          name: "about",
          label: "About",
          icon: "mdi-help-box",
          path: "/about"
        }
      ];
    },
    ...mapState({
      requestHeaders: state => state.requestStore.headers
    }),
    ...mapGetters({
      itemsInCart: "userStore/cartCount",
      requests: "requestStore/currentRequests",
      selectedRequest: "requestStore/selectedRequest",
      firstName: "userStore/firstName"
    })
  }
};
</script>

<style>
.wrapper {
  height: 100%;
}

.main-content {
  flex: 1 1 auto;
  height: 100%;
}

.rr-collapsed {
  height: 0px;
}

.rr-show {
  height: 300px;
}

.rr-icon {
  transition: all 500ms linear;
}

.rr-icon.down {
  transform: rotate(180deg);
}

.rr-wrapper {
  transition: height 500ms ease-in-out;
  position: relative;
  display: flex;
  flex-direction: column;
  border-top: 2px solid gray;
}

.rr-toggle {
  position: absolute;
  top: -28px;
  left: 80%;
  transform: translateX(-50%);
  height: 20px;
  z-index: 1001;
  background-color: #fff;
}

.rr-content {
  height: 100%;
  overflow: hidden;
}

.req1-header {
  width: 15%;
}

.url-header {
  width: 50%;
}

.auth-header {
  width: 20%;
}
.resp-header {
  width: 15%;
}

.rr-scroll {
  height: 200px;
  overflow-y: auto;
}

.search-box {
  line-height: 1.5;
  vertical-align: center;
  width: 600px;
  height: 48px;
}

.toolbar-logo {
  cursor: pointer;
}

.user-menu-title {
  text-transform: none;
}

.out-of-stock {
  color: red;
}
.in-stock {
  color: green;
}

.cart-count-input {
  max-width: 40px;
  border: 1px solid gray;
  border-radius: 4px;
  outline: none;
  text-align: center;
}

input.cart-count-input:read-only {
  background-color: #ccc;
  color: #646363;
}

.cart-adj-div {
  margin: 5px 0px;
}
</style>
