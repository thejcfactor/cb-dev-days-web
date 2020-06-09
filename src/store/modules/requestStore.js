import { _ } from "vue-underscore";

export const namespaced = true;

export const state = {
  headers: [
    {
      text: "RequestId",
      sortable: true,
      class: "req-header",
      align: "start",
      value: "requestId"
    },
    {
      text: "URL",
      sortable: false,
      align: "start",
      class: "url-header",
      value: "path"
    },
    {
      text: "Auth Required",
      sortable: true,
      align: "start",
      class: "auth-header",
      value: "authRequired"
    },
    {
      text: "Response",
      sortable: true,
      align: "start",
      class: "resp-header",
      value: "status"
    }
  ],
  requests: [],
  selectedIndex: -1
};

export const mutations = {
  ADD_REQUEST(state, request) {
    state.requests.push(request);
  },
  RESET_REQUESTS(state) {
    state.requests = [];
  },
  ADD_RESPONSE_TO_REQUEST(state, response) {
    let data = response.data;
    //slightly annoying, but due to nature of array, need to remove req -> update -> add back
    //to get reactivity
    //https://stackoverflow.com/questions/40860592/vuex-getter-not-updating
    let index = -1;
    for (let i = 0; i < state.requests.length; i++) {
      if (state.requests[i].requestId == data.requestId) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      let req = state.requests[index];
      let responseObj = {
        status: response.status,
        statusText: response.statusText,
        data: data.data,
        error: data.error
      };
      req.response = responseObj;
      //Vue.set(state.requests,index,req);
      state.requests.splice(index, 1, req);
      /*let removedReq = state.requests.splice(index, 1)[0];
        let req = {
            requestId: removedReq.requestId,
            path: removedReq.path,
            authRequired: removedReq.authRequired,
            status: response.status,
            response: {
                status: response.status,
                statusText: response.statusText,
                data: data.data,
                error: data.error
            }
          };
        state.requests.push(req);*/
    }
  },
  UPDATE_SELECTED_INDEX(state, requestId) {
    let index = -1;
    for (let i = 0; i < state.requests.length; i++) {
      if (state.requests[i].requestId == requestId) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      state.selectedIndex = index;
    }
  }
};

export const actions = {
  addRequest({ commit }, request) {
    commit("ADD_REQUEST", request);
  },
  addResponseToRequest({ commit }, response) {
    commit("ADD_RESPONSE_TO_REQUEST", response);
  },
  updateSelectedIndex({ commit }, requestId) {
    commit("UPDATE_SELECTED_INDEX", requestId);
  },
  resetRequests({ commit }) {
    commit("RESET_REQUESTS");
  }
};

export const getters = {
  currentRequests: state => {
    if (state.requests == null || state.requests.length == 0) {
      return [];
    }

    return _.map(state.requests, function(req) {
      return {
        requestId: req.requestId,
        path: req.path,
        authRequired: req.authRequired,
        status: req.response ? req.response.status : ""
      };
    });
  },
  selectedRequest: state => {
    if (
      state.selectedIndex < 0 ||
      state.requests.length <= state.selectedIndex
    ) {
      return null;
    }
    let req = state.requests[state.selectedIndex];
    return {
      requestBody: req.body ? JSON.stringify(req.body, null, 2) : "",
      responseObj: req.response ? JSON.stringify(req.response, null, 2) : ""
    };
  }
};
