<template>
  <v-container fluid>
    <v-row justify="center" v-show="showAlertMessage">
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
      <Loader message="Logging in..."></Loader>
    </v-row>
    <v-row justify="center" v-else>
      <v-col cols="12" xl="3" lg="4" md="6" sm="8">
        <v-card>
          <v-card-title>
            <h1 class="display-1">Login</h1>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Username"
                prepend-icon="mdi-account-circle"
                v-model="username"
                v-on:keyup.enter="loginClick"
                tabindex="0"
              />
              <v-text-field
                label="Password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                v-on:keyup.enter="loginClick"
                tabindex="0"
              />
              <div class="d-flex flex-row-reverse">
                <div class="forgot-pw">
                  <a
                    class="link-no-underline"
                    href="#"
                    @click.prevent="forgotPasswordClick"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="registerUserClick">Register</v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="loginClick">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Loader from "@/components/Loader";

export default {
  name: "Login",
  components: {
    Loader
  },
  data: () => ({
    showPassword: false,
    showAlert: false,
    alertMessage: "",
    alertType: undefined,
    username: "",
    password: "",
    loading: false
  }),
  created: function() {
    this.username = "";
    this.password = "";
  },
  methods: {
    forgotPasswordClick: function() {},
    showMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    loginClick: function() {
      if (!this.username || !this.password) {
        this.alertMessage = "Missing username and/or password";
        this.alertType = "error";
        this.showAlert = true;
        return;
      }

      let user = {
        username: this.username,
        password: this.password
      };
      let self = this;
      this.loading = true;
      this.setLoginMessage(false);
      this.login(user)
        .then(response => {
          self.loading = false;
          if (response) {
            this.$router.push({ path: "/home" }).catch(error => {});
          } else {
            this.showMessage();
          }
        })
        .catch(error => {
          self.loading = false;
          self.showMessage();
        });
    },
    registerUserClick: function() {
      //eating possible route error
      this.setLoginMessage(false);
      this.$router.push({ path: "register" }).catch(error => {});
    },
    setMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
    },
    ...mapActions("userStore", ["login", "setLoginMessage"])
  },
  computed: {
    showAlertMessage: function() {
      if (this.showLoginMessage) {
        this.showMessage();
      }
      return this.showLoginMessage || this.showAlert;
    },
    ...mapState({
      message: state => state.userStore.message,
      showLoginMessage: state => state.userStore.showLoginMessage
    })
  }
};
</script>

<style scoped>
.forgot-pw {
  font-size: 0.75em;
  margin: -10px 0 5px 0;
}
.link-no-underline {
  text-decoration: none;
}
</style>
