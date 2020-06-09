import { api } from "@/logic/api";

export const namespaced = true;

export const state = {
  products: null,
  itemsPerPage: 4,
  itemsPerPageList: [4, 8, 12, 16],
  message: null
};

export const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products;
  },
  SET_MESSAGE(state, msg) {
    state.message = msg;
  },
  SET_ITEMS_PER_PAGE(state, numItems) {
    state.itemsPerPage = numItems;
  }
};

export const actions = {
  searchProducts({ commit }, { productSearchTerm, fuzziness }) {
    return api
      .searchProducts(productSearchTerm, fuzziness)
      .then(response => {
        console.log(response);
        let success = false;
        let msg = "Unable to search for products.";
        let msgType = "warning";
        let products = null;

        if (response.data && response.data.length > 0) {
          products = response.data;
          msg = `Found ${products.length} products with term: ${productSearchTerm}`;
          msgType = "success";
          success = true;
        } else if (
          (!response.data &&
            response.message.includes("No search term provided.")) ||
          response.message.includes("Successfully")
        ) {
          msg = "No products found.";
          msgType = "info";
          success = true;
        } else if (
          !response.data &&
          response.message == "Operation not built yet."
        ) {
          msg = "/product/searchProducts operation not built yet.";
          msgType = "info";
        }
        commit("SET_PRODUCTS", products);
        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return products;
      })
      .catch(error => {
        commit("SET_PRODUCTS", null);
        commit("SET_MESSAGE", {
          msg: `Error searching for products. Error: ${error}`,
          msgType: "error"
        });
        return null;
      });
  },
  updateResultsPerPage({ commit }, num) {
    commit("SET_ITEMS_PER_PAGE", num);
  }
};
