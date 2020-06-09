<template>
  <div class="d-flex flex-column justify-center align-stretch loading-wrapper">
    <div class="align-self-center waiting-to-connect-spinner">
      <hollow-dots-spinner
        :animation-duration="1000"
        :dot-size="30"
        :dots-num="3"
        color="#070999"
      />
    </div>
    <div class="align-self-center loader-text mt-1">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { HollowDotsSpinner } from "epic-spinners";

export default {
  name: "Loader",
  components: {
    HollowDotsSpinner
  },
  props: {
    message: {
      type: String,
      required: false,
      default: "Loading..."
    }
  }
};
</script>

<style scoped>
.loading-wrapper {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100%;
  height: 100%;
  /*padding: 20px 0 0 20px;*/
  margin: 20px 0 0 20px;
  background-color: #fff;
  z-index: 3001;
  opacity: 0.9;
}

.loader-text {
  font-size: 24px;
  font-weight: bold;
  color: #070999;
}
</style>
