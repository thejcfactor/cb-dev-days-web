import Vue from "vue";
import Vuex from "vuex";

import * as userStore from "@/store/modules/userStore.js";
import * as productStore from "@/store/modules/productStore.js";
import * as requestStore from "@/store/modules/requestStore.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    userStore,
    productStore,
    requestStore
  }
});
