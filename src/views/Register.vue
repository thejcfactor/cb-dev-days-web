<template>
  <v-container fluid>
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
      <Loader message="Registering user..."></Loader>
    </v-row>
    <v-row justify="center" v-else>
      <v-col cols="12" xl="3" lg="4" md="6" sm="8">
        <v-card>
          <v-card-title>
            <h1 class="display-1">Register User</h1>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="firstName"
                :rules="[rules.required]"
                v-on:keyup.enter="registerClick"
              >
                <template v-slot:label>
                  <div>First Name<sup>*</sup></div>
                </template>
              </v-text-field>
              <v-text-field
                v-model="lastName"
                :rules="[rules.required]"
                v-on:keyup.enter="registerClick"
              >
                <template v-slot:label>
                  <div>Last Name<sup>*</sup></div>
                </template>
              </v-text-field>
              <v-text-field
                v-model="username"
                :rules="[rules.required]"
                v-on:keyup.enter="registerClick"
              >
                <template v-slot:label>
                  <div>Username<sup>*</sup></div>
                </template>
              </v-text-field>
              <v-text-field
                v-model="email"
                :rules="[rules.required, rules.email]"
                v-on:keyup.enter="registerClick"
              >
                <template v-slot:label>
                  <div>Email<sup>*</sup></div>
                </template>
              </v-text-field>
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                :rules="[rules.required]"
                v-on:keyup.enter="registerClick"
              >
                <template v-slot:label>
                  <div>Password<sup>*</sup></div>
                </template>
              </v-text-field>
            </v-form>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="registerClick">Register</v-btn>
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
  name: "Register",
  components: {
    Loader
  },
  data: () => ({
    showPassword: false,
    loading: false,
    showAlert: false,
    alertMessage: "",
    alertType: undefined,
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    rules: {
      required: value => !!value || "Required.",
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      }
    }
  }),
  methods: {
    showMessage: function() {
      this.alertMessage = this.message.msg;
      this.alertType = this.message.msgType;
      this.showAlert = true;
    },
    validateUserInput: function() {
      if (
        this.firstName &&
        this.firstName != "" &&
        this.lastName &&
        this.lastName != "" &&
        this.username &&
        this.username &&
        this.email &&
        this.email != "" &&
        this.password &&
        this.password != ""
      ) {
        return true;
      }
      return false;
    },
    registerClick: function() {
      if (!this.validateUserInput()) {
        this.alertMessage =
          "Missing information.  Please fill in all required fields.";
        this.alertType = "error";
        this.showAlert = true;
        return;
      }

      let newUser = {
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        email: this.email,
        password: this.password
      };

      let self = this;
      this.loading = true;
      this.register(newUser)
        .then(response => {
          self.loading = false;
          if (response) {
            this.$router.push({ path: "/login" }).catch(error => {});
          } else {
            self.showMessage();
          }
        })
        .catch(error => {
          self.loading = false;
          self.showMessage();
        });
    },
    ...mapActions("userStore", ["register"])
  },
  computed: {
    ...mapState({
      message: state => state.userStore.message
    })
  }
};
</script>

<style></style>
