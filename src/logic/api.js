import axios from "axios";
import router from "../router";
import store from "../store/index";

export const api = {
  login,
  logout,
  register,
  verifyUserSession,
  searchProducts,
  getNewOrder,
  getCustomer,
  getCustomerOrders,
  getOrder,
  saveOrUpdateOrder,
  deleteOrder,
  saveOrUpdateAddress
};

const urls = {
  login: "/user/login",
  register: "/user/register",
  verifyUserSession: "/user/verifyUserSession",
  productSearch: "/product/searchProducts",
  getNewOrder: "/user/getNewOrder",
  getCustomer: "/user/getCustomer",
  getCustomerOrders: "/user/getCustomerOrders",
  getOrder: "/user/getOrder",
  saveOrUpdateOrder: "/user/saveOrUpdateOrder",
  deleteOrder: "/user/deleteOrder",
  saveOrUpdateAddress: "/user/saveOrUpdateAddress"
};

const apiClient = axios.create({
  //baseURL: process.env.VUE_APP_API_URL,
  baseURL: "http://localhost:3000",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

const authHeader = function() {
  // return authorization header with jwt token
  let user = JSON.parse(localStorage.getItem("user"));

  if (user && user.token) {
    return `Bearer ${user.token}`;
  } else {
    return null;
  }
};

function register(user) {
  let url = `${urls.register}`;
  let payload = {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    password: user.password
  };

  let reqId = addRequest(url, payload, false);

  //this is only for purpose of logging req/resp
  payload.requestId = reqId;

  return apiClient
    .post(url, payload)
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function verifyUserSession() {
  let url = `${urls.verifyUserSession}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `?requestId=${reqId}`;

  return apiClient
    .get(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function login(username, password) {
  let url = `${urls.login}`;
  let payload = {
    username: username,
    password: password
  };

  let reqId = addRequest(url, payload, false);

  //this is only for purpose of logging req/resp
  payload.requestId = reqId;

  return apiClient
    .post(url, payload)
    .then(handleResponse)
    .then(response => {
      let acct = response.data;
      if (acct && acct.userInfo.token) {
        localStorage.setItem("user", JSON.stringify(acct.userInfo));
      }
      return response;
    })
    .catch(handleErrorResponse);
}

function logout() {
  localStorage.removeItem("user");
}

function searchProducts(productSearchTerm, fuzziness) {
  let url = `${urls.productSearch}?product=${productSearchTerm}&fuzziness=${fuzziness}`;

  let reqId = addRequest(url, null, false);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .get(url)
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function getNewOrder(customerId) {
  let url = `${urls.getNewOrder}?customerId=${customerId}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .get(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function getCustomer(customerId) {
  let url = `${urls.getCustomer}?customerId=${customerId}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .get(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function getCustomerOrders(customerId) {
  let url = `${urls.getCustomerOrders}?customerId=${customerId}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .get(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function getOrder(orderId) {
  let url = `${urls.getOrder}?orderId=${orderId}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .get(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function saveOrUpdateOrder(order, update) {
  let url = `${urls.saveOrUpdateOrder}`;
  let payload = {
    order: order,
    update: update
  };

  let reqId = addRequest(url, payload, true);

  //this is only for purpose of logging req/resp
  payload.requestId = reqId;

  return apiClient
    .post(url, payload, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      let result = response;
      return result;
    })
    .catch(handleErrorResponse);
}

function deleteOrder(orderId) {
  let url = `${urls.deleteOrder}?orderId=${orderId}`;

  let reqId = addRequest(url, null, true);

  //this is only for purpose of logging req/resp
  url += `&requestId=${reqId}`;

  return apiClient
    .delete(url, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      return response;
    })
    .catch(handleErrorResponse);
}

function saveOrUpdateAddress(custId, address, path, update) {
  let url = `${urls.saveOrUpdateAddress}`;
  let payload = {
    customerId: custId,
    address: address,
    path: path,
    update: update
  };

  let reqId = addRequest(url, payload, true);

  //this is only for purpose of logging req/resp
  payload.requestId = reqId;

  return apiClient
    .post(url, payload, {
      headers: {
        Authorization: authHeader()
      }
    })
    .then(handleResponse)
    .then(response => {
      let result = response;
      return result;
    })
    .catch(handleErrorResponse);
}

function addRequest(url, reqBody, authRequired) {
  let request = {
    requestId: store.state.requestStore.requests.length,
    path: url,
    authRequired: authRequired
  };

  if (reqBody) {
    request.body = reqBody;
  }

  store.dispatch("requestStore/addRequest", request);

  return request.requestId;
}

function handleResponse(response) {
  store.dispatch("requestStore/addResponseToRequest", response);
  if (response.status === 200) {
    return Promise.resolve(response.data);
  } else {
    if (response.status === 401) {
      console.log("unauthorized user.");
      logout();
      store.dispatch("userStore/sessionExpired");
      if (!["/login", "/home"].includes(router.currentRoute.path)) {
        router.push("/login");
      }
    }
    const error = response.data || response.statusText;
    return Promise.reject(error);
  }
}

function handleErrorResponse(error) {
  //TODO:  always logout on error?

  if (!error || !error.response) {
    console.log("API unresponsive.");
    logout();
    store.dispatch("requestStore/resetRequests");
    store.dispatch("userStore/sessionExpired");
    if (!["/login", "/home"].includes(router.currentRoute.path)) {
      router.push("/login");
    }
    let errorOutput = {
      data: { message: "API unresponsive." }
    };
    return Promise.reject(errorOutput);
  } else if (error.response.status === 404) {
    console.log("API not found.");
    logout();
    store.dispatch("requestStore/resetRequests");
    store.dispatch("userStore/sessionExpired");
    if (!["/login", "/home"].includes(router.currentRoute.path)) {
      router.push("/login");
    }
    let errorOutput = {
      data: { message: "API not found." }
    };
    return Promise.reject(errorOutput);
  } else {
    let response = error.response;
    console.log("api - ERROR: ", response);
    store.dispatch("requestStore/addResponseToRequest", response);
    if (response.status === 401) {
      console.log("unauthorized user.");
      logout();
      store.dispatch("userStore/sessionExpired");
      if (!["/login", "/home"].includes(router.currentRoute.path)) {
        router.push("/login");
      }
    }
    //const errorOutput = response.data || response.statusText;
    let errorOutput = {
      data: response.data.error,
      message: response.data.message,
      status: response.status
    };
    return Promise.reject(errorOutput);
  }
}
