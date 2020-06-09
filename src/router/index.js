import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Cart from "../views/Cart.vue";
import Orders from "../views/Orders.vue";
import UserProfile from "../views/UserProfile.vue";
import OrderDetail from "../views/OrderDetail.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    alias: "/home"
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: Register
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart
  },
  {
    path: "/orders",
    name: "Orders",
    component: Orders
  },
  {
    path: "/orderDetail",
    name: "OrderDetail",
    component: OrderDetail
  },
  {
    path: "/userProfile",
    name: "UserProfile",
    component: UserProfile
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  //console.log("beforeEach", to.path);
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ["/login", "/", "/register", "/home"];
  const authRequired = !publicPages.includes(to.path);
  //console.log("authRequired", authRequired);
  const loggedIn = localStorage.getItem("user");
  //console.log("loggedIn", loggedIn);

  if (authRequired && !loggedIn) {
    return next("/login");
  }

  next();
});

export default router;
