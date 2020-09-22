import { api } from "@/logic/api";
import { _ } from "vue-underscore";

export const namespaced = true;

export const state = {
  userInfo: null,
  customerInfo: null,
  showUserProfile: true,
  message: null,
  showLoginMessage: false,
  productsInCart: [],
  newOrder: null,
  orders: [],
  orderDetailId: null,
  orderDetail: null
};

export const mutations = {
  SET_USER_INFO(state, user) {
    state.userInfo = user;
  },
  SET_CUSTOMER_INFO(state, customer) {
    state.customerInfo = customer;
  },
  CAN_SHOW_USER_PROFILE(state, value) {
    state.showUserProfile = value;
  },
  SET_MESSAGE(state, msg) {
    state.message = msg;
  },
  SET_LOGIN_MESSAGE(state, value) {
    state.showLoginMessage = value;
  },
  ADD_PRODUCTS_TO_CART(state, { product, count }) {
    if (state.newOrder == null) {
      state.newOrder = {
        doc: {
          type: "order",
          schema: "1.0.0"
        },
        custId: state.customerInfo.custId,
        orderStatus: "created",
        billingInfo: {},
        shippingInfo: {},
        shippingTotal: 0.0,
        tax: 0.0,
        lineItems: [],
        grandTotal: 0.0
      };
    }
    let index = -1;
    for (let i = 0; i < state.newOrder.lineItems.length; i++) {
      if (state.newOrder.lineItems[i].prodId == product.prodId) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      state.newOrder.lineItems[index].qty += count;
      state.newOrder.lineItems[index].subTotal =
        state.newOrder.lineItems[index].price *
        state.newOrder.lineItems[index].qty;
    } else {
      state.newOrder.lineItems.push({
        prodId: product.prodId,
        dispName: product.dispName,
        shortDescr: product.shortDescr,
        image: product.image,
        price: product.price,
        qty: count,
        subTotal: product.price * count
      });
    }
    let total = _.reduce(
      state.newOrder.lineItems,
      function(sum, li) {
        return sum + li.subTotal;
      },
      0
    );
    state.newOrder.grandTotal = total;
  },
  REMOVE_PRODUCT_FROM_CART(state, id) {
    let index = -1;
    for (let i = 0; i < state.newOrder.lineItems.length; i++) {
      if (state.newOrder.lineItems[i].prodId == id) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      state.newOrder.lineItems.splice(index, 1);
    }

    let total = _.reduce(
      state.newOrder.lineItems,
      function(sum, li) {
        return sum + li.subTotal;
      },
      0
    );
    state.newOrder.grandTotal = total;
  },
  UPDATE_NEW_ORDER(state, { order, justSaved }) {
    if (justSaved) {
      state.newOrder.orderId = order.orderId;
      state.newOrder._id = order._id;
      state.newOrder.doc = order.doc;
    } else {
      state.newOrder.billingInfo = order.billingInfo;
      state.newOrder.shippingInfo = order.shippingInfo;
      state.newOrder.shippingTotal = order.shippingTotal;
      state.newOrder.tax = order.tax;
      state.newOrder.grandTotal = order.grandTotal;
      state.newOrder.orderStatus = "processing";
      let timeStamp = Math.floor(Date.now());
      state.newOrder.doc.modified = timeStamp;
      state.newOrder.doc.modifiedBy = state.newOrder.custId;
      state.newOrder.orderDate = timeStamp;
    }
  },
  UPDATE_NEW_ORDER_LINE_ITEM_QTY(state, lineItem) {
    for (let i = 0; i < state.newOrder.lineItems.length; i++) {
      if (state.newOrder.lineItems[i].prodId == lineItem.prodId) {
        state.newOrder.lineItems[i].qty = lineItem.qty;
        state.newOrder.lineItems[i].subTotal =
          state.newOrder.lineItems[i].price * state.newOrder.lineItems[i].qty;
        break;
      }
    }

    let total = _.reduce(
      state.newOrder.lineItems,
      function(sum, li) {
        return sum + li.subTotal;
      },
      0
    );
    state.newOrder.grandTotal = total;
  },
  SET_NEW_ORDER(state, order) {
    state.newOrder = order;
  },
  SET_ORDERS(state, orders) {
    if (orders.length > 0) {
      state.orders = [];
    }
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].orderStatus == "created") {
        //For now only update the newOrder based on getNewOrder() results
        continue;
      }
      state.orders.push(orders[i]);
    }
  },
  SET_ORDER_DETAIL_ID(state, id) {
    state.orderDetailId = id;
  },
  SET_ORDER_DETAIL(state, order) {
    state.orderDetail = order;
  },
  ADD_NEW_ADDRESS(state, newAddress) {
    let { name, ...address } = newAddress["address"];
    state.customerInfo.address[name] = address;
  },
  UPDATE_ADDRESS(state, updatedAddress) {
    let { name, ...address } = updatedAddress;
    state.customerInfo.address[name] = address;
    let tmp = state.customerInfo.address;
    state.customerInfo.address = {};
    state.customerInfo.address = tmp;
  }
};

export const actions = {
  login({ commit }, { username, password }) {
    return api
      .login(username, password)
      .then(response => {
        let success = true;
        let msg = "";
        let msgType = "";
        let userInfo = null;
        let customerInfo = null;

        if (!response.data) {
          if (response.message == "Operation not built yet.") {
            success = false;
            userInfo = null;
            customerInfo = null;
            msg = response.message;
            msgType = "info";
          } else if (response.error) {
            success = false;
            userInfo = null;
            customerInfo = null;
            msg = `${response.message}  Error: ${JSON.stringify(
              response.error
            )}`;
            msgType = "error";
          }
        } else {
          if (response.authorized) {
            success = true;
            userInfo = response.data.userInfo;
            customerInfo = response.data.customerInfo;
            msg = response.message;
            msgType = "success";
          } else {
            //unauthorized
            success = false;
            userInfo = null;
            customerInfo = null;
            msg = response.message;
            msgType = "warning";
          }
        }

        commit("SET_USER_INFO", userInfo);
        commit("SET_CUSTOMER_INFO", customerInfo);
        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return success;
      })
      .catch(error => {
        commit("SET_USER_INFO", null);
        commit("SET_CUSTOMER_INFO", null);
        let msg = error.message;
        let msgType = "";
        if (error.message == "Operation not built yet.") {
          msgType = "info";
        } else {
          msgType = "error";
        }
        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return false;
      });
  },
  sessionExpired({ commit }) {
    commit("SET_USER_INFO", null);
    commit("SET_CUSTOMER_INFO", null);
    commit("SET_ORDERS", []);
    commit("SET_NEW_ORDER", null);
    commit("SET_ORDER_DETAIL_ID", null);
    commit("SET_ORDER_DETAIL", null);
    commit("SET_MESSAGE", {
      msg: "Session expired.",
      msgType: "info"
    });
    commit("SET_LOGIN_MESSAGE", true);
  },
  logout({ commit }) {
    api.logout();
    commit("SET_USER_INFO", null);
    commit("SET_CUSTOMER_INFO", null);
    commit("SET_ORDERS", []);
    commit("SET_NEW_ORDER", null);
    commit("SET_ORDER_DETAIL_ID", null);
    commit("SET_ORDER_DETAIL", null);
    commit("SET_MESSAGE", {
      msg: "Successfully logged out.",
      msgType: "success"
    });
    commit("SET_LOGIN_MESSAGE", true);
  },
  setLoginMessage({ commit }, value) {
    commit("SET_LOGIN_MESSAGE", value);
  },
  register({ commit }, user) {
    return api
      .register(user)
      .then(response => {
        let success = true;
        if (!response.data && response.message == "Operation not built yet.") {
          commit("SET_MESSAGE", {
            msg: "Registration operation not built yet.",
            msgType: "info"
          });
          success = false;
        } else {
          let acct = response.data;
          commit("SET_USER_INFO", acct.userInfo);
          commit("SET_CUSTOMER_INFO", acct.customerInfo);
          commit("SET_MESSAGE", {
            msg: "Successfully registered user.  Please login.",
            msgType: "success"
          });
          commit("SET_LOGIN_MESSAGE", true);
        }
        return success;
      })
      .catch(error => {
        commit("SET_USER_INFO", null);
        commit("SET_CUSTOMER_INFO", null);
        if (error.status != 401) {
          let msg = !error.data
            ? "Error trying to register user."
            : error.message;
          commit("SET_MESSAGE", {
            msg: msg,
            msgType: "error"
          });
        }

        return false;
      });
  },
  checkForUserSession({ commit }) {
    let user = JSON.parse(localStorage.getItem("user"));

    if (user && user.token) {
      return api
        .verifyUserSession()
        .then(response => {
          if (
            !response.data &&
            response.message == "Operation not built yet."
          ) {
            commit("SET_USER_INFO", null);
            commit("SET_CUSTOMER_INFO", null);
            commit("SET_MESSAGE", {
              msg: "/user/verifyUserSession operation not built yet.",
              msgType: "info"
            });
            api.logout();
          } else if (response.message.includes("Could not find")) {
            commit("SET_USER_INFO", null);
            commit("SET_CUSTOMER_INFO", null);
            commit("SET_MESSAGE", {
              msg: response.message,
              msgType: "info"
            });
            api.logout();
          } else {
            let acct = response.data;
            console.log(acct);
            commit("SET_USER_INFO", acct.userInfo);
            commit("SET_CUSTOMER_INFO", acct.customerInfo);
            commit("SET_MESSAGE", {
              msg: "Successfully verified user from session.",
              msgType: "success"
            });
          }
          return true;
        })
        .catch(error => {
          commit("SET_USER_INFO", null);
          commit("SET_CUSTOMER_INFO", null);
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    } else {
      commit("SET_USER_INFO", null);
      commit("SET_CUSTOMER_INFO", null);
      commit("SET_MESSAGE", {
        msg: "No user session found.",
        msgType: "info"
      });
      return Promise.resolve(true);
    }
  },
  removeProductFromCart({ state, commit }, id) {
    if (state.newOrder.lineItems.length == 1) {
      console.log("deleting order");
      return api
        .deleteOrder(state.newOrder._id, true)
        .then(response => {
          commit("SET_MESSAGE", {
            msg: "Successfully deleted order",
            msgType: "success"
          });
          commit("REMOVE_PRODUCT_FROM_CART", id);
          commit("SET_NEW_ORDER", null);
          return response.message;
        })
        .catch(error => {
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    } else {
      console.log("updating order");
      return api
        .saveOrUpdateOrder(state.newOrder, true)
        .then(response => {
          commit("REMOVE_PRODUCT_FROM_CART", id);
          commit("SET_MESSAGE", {
            msg: "Successfully updated new order",
            msgType: "success"
          });
          return response.message;
        })
        .catch(error => {
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    }
  },
  updateProductQty({ state, commit }, lineItem) {
    commit("UPDATE_NEW_ORDER_LINE_ITEM_QTY", lineItem);
    return api
      .saveOrUpdateOrder(state.newOrder, true)
      .then(response => {
        commit("SET_MESSAGE", {
          msg: "Successfully updated new order",
          msgType: "success"
        });
        return response != null;
      })
      .catch(error => {
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  getCustomerById({ state, commit }) {
    return api
      .getCustomer(state.customerInfo.custId)
      .then(response => {
        let msg = "Successfully retrieved customer details";
        let msgType = "success";
        let success = true;

        if (response.data) {
          commit("SET_CUSTOMER_INFO", response.data);
        }
        if (!response.data && response.message == "Operation not built yet.") {
          msg = "/user/getCustomerById operation not built yet.";
          msgType = "info";
          success = false;
          commit("CAN_SHOW_USER_PROFILE", false);
        }

        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return success;
      })
      .catch(error => {
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  getCustomerOrders({ state, commit }) {
    //TODO:  shouldn't have to always get customer orders, but okay for now
    // if (state.orderDetailId && state.orders && state.orders.length > 0) {
    //   return Promise.resolve(true);
    // }

    return api
      .getCustomerOrders(state.customerInfo.custId)
      .then(response => {
        let success = false;
        let msg = "Unable to retrieve customer orders.";
        let msgType = "warning";
        let orders = [];
        if (response.data && response.data.length > 0) {
          orders = response.data;
          msg = "Successfully retrieved customer orders.";
          msgType = "success";
          success = true;
        } else if (response.data && response.data.length == 0) {
          msg = "Customer has no orders.";
          msgType = "success";
          success = true;
        } else if (
          !response.data &&
          response.message == "Operation not built yet."
        ) {
          msg = "/user/getCustomerOrders operation not built yet.";
          msgType = "info";
        }

        commit("SET_ORDERS", orders);
        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return success;
      })
      .catch(error => {
        commit("SET_ORDERS", []);
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  checkForNewOrder({ state, commit }) {
    if (state.newOrder == null && state.customerInfo != null) {
      let custId = state.customerInfo.custId;
      return api
        .getNewOrder(custId)
        .then(response => {
          let success = false;
          let msg = "Unable to retrieve order details.";
          let msgType = "warning";
          let newOrder = null;
          if (response.data && response.data.length > 0) {
            newOrder = response.data[0];
            msg = "Successfully retrieved new order details.";
            msgType = "success";
            success = true;
          } else if (response.data && response.data.length == 0) {
            msg = "No new/pending orders.";
            msgType = "success";
            success = true;
          } else if (
            !response.data &&
            response.message == "Operation not built yet."
          ) {
            msg = "/user/checkForNewOrder operation not built yet.";
            msgType = "info";
          }

          commit("SET_NEW_ORDER", newOrder);
          commit("SET_MESSAGE", {
            msg: msg,
            msgType: msgType
          });
          return success;
        })
        .catch(error => {
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    } else {
      return Promise.resolve(true);
    }
  },
  setOrderDetailId({ commit }, id) {
    commit("SET_ORDER_DETAIL_ID", id);
  },
  getOrder({ state, commit }) {
    //TODO:  check if same orderDetailId as last
    return api
      .getOrder(state.orderDetailId)
      .then(response => {
        let msg = "Successfully retrieved order details";
        let msgType = "success";
        let success = true;
        commit("SET_ORDER_DETAIL_ID", null);
        if (response.data) {
          commit("SET_ORDER_DETAIL", response.data);
        }
        if (!response.data && response.message == "Operation not built yet.") {
          msg = "/user/getOrderById operation not built yet.";
          msgType = "info";
          success = false;
        }

        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return success;
      })
      .catch(error => {
        commit("SET_ORDER_DETAIL_ID", null);
        commit("SET_ORDER_DETAIL", null);
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  saveOrUpdateNewOrder({ state, commit }, { product, count }) {
    commit("ADD_PRODUCTS_TO_CART", { product, count });

    if (state.newOrder.orderId != null) {
      return api
        .saveOrUpdateOrder(state.newOrder, true)
        .then(response => {
          commit("SET_MESSAGE", {
            msg: "Successfully updated new order",
            msgType: "success"
          });
          return response;
        })
        .catch(error => {
          commit("REMOVE_PRODUCT_FROM_CART", product.prodId);
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    } else {
      return api
        .saveOrUpdateOrder(state.newOrder, false)
        .then(response => {
          commit("UPDATE_NEW_ORDER", { order: response.data, justSaved: true });
          commit("SET_MESSAGE", {
            msg: "Successfully saved new order",
            msgType: "success"
          });
          return true;
        })
        .catch(error => {
          commit("REMOVE_PRODUCT_FROM_CART", product.prodId);
          if (error.status != 401) {
            commit("SET_MESSAGE", {
              msg: error.message,
              msgType: "error"
            });
          }
          return false;
        });
    }
  },
  saveNewAddress({ commit, state }, newAddress) {
    let addrNames = Object.keys(state.customerInfo.address);
    let matchCount = 0;

    if (!newAddress.name || newAddress.name == "") {
      newAddress.name = "default";
    }

    for (let i = 0; i < addrNames.length; i++) {
      if (addrNames[i].includes(newAddress.name)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      let rootName = newAddress.name.match(/[a-zA-Z]+/g);
      newAddress.name = rootName + `${matchCount + 1}`;
    }

    let address;
    if (!newAddress.address2 || newAddress.address == "") {
      let { address2, ...addr } = newAddress;
      address = addr;
    } else {
      let { name, ...addr } = newAddress;
      address = addr;
    }

    return api
      .saveOrUpdateAddress(state.customerInfo.custId, address, "address", false)
      .then(response => {
        let msg = "Successfully saved new address";
        let msgType = "success";
        let success = true;
        if (response.data) {
          commit("ADD_NEW_ADDRESS", { address: address, justSaved: true });
        }

        if (!response.data && response.message == "Operation not built yet.") {
          msg = "/user/saveOrUpdateAddress operation not built yet.";
          msgType = "info";
          success = false;
        }

        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });
        return success ? address : null;
      })
      .catch(error => {
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  updateAddress({ commit, state }, newAddress) {
    let path = `address.${newAddress.name}`;

    let address;
    if (!newAddress.address2 || newAddress.address == "") {
      let { address2, name, ...addr } = newAddress;
      address = addr;
    } else {
      let { name, ...addr } = newAddress;
      address = addr;
    }

    return api
      .saveOrUpdateAddress(state.customerInfo.custId, address, path, true)
      .then(response => {
        let msg = "Successfully updated address";
        let msgType = "success";
        let success = true;
        if (response.data) {
          commit("UPDATE_ADDRESS", newAddress);
        }
        if (!response.data && response.message == "Operation not built yet.") {
          msg = "/user/saveOrUpdateAddress operation not built yet.";
          msgType = "info";
          success = false;
        }

        commit("SET_MESSAGE", {
          msg: msg,
          msgType: msgType
        });

        return success;
      })
      .catch(error => {
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  },
  placeOrder({ commit }, orderUpdates) {
    commit("UPDATE_NEW_ORDER", { order: orderUpdates, justSaved: false });
    return api
      .saveOrUpdateOrder(state.newOrder, true)
      .then(response => {
        commit("SET_NEW_ORDER", null);
        commit("SET_MESSAGE", {
          msg: "Successfully processed new order",
          msgType: "success"
        });
        return true;
      })
      .catch(error => {
        if (error.status != 401) {
          commit("SET_MESSAGE", {
            msg: error.message,
            msgType: "error"
          });
        }
        return false;
      });
  }
};

export const getters = {
  firstName: state => {
    if (!state.customerInfo || !state.customerInfo.custName) {
      return null;
    }
    return state.customerInfo.custName.firstName;
  },
  cartCount: state => {
    if (state.newOrder == null) {
      return "0";
    }

    let count = _.reduce(
      state.newOrder.lineItems,
      function(memo, prd) {
        return memo + prd.qty;
      },
      0
    );

    return `${count}`;
  },
  newOrderSubTotal: state => {
    if (state.newOrder == null) {
      return 0;
    }

    let subTotal = _.reduce(
      state.newOrder.lineItems,
      function(sum, prd) {
        return sum + prd.subTotal;
      },
      0
    );

    return subTotal;
  },
  customerAddresses: state => {
    let addresses = [];
    if (state.customerInfo != null) {
      for (let [key, value] of Object.entries(state.customerInfo.address)) {
        let addr = value;
        addr.name = key;
        addresses.push(addr);
      }
    }
    return addresses;
  }
};
