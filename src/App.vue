<template>
  <div id="app">
    <leapbox :img="'https://free-materials.com/adm/wp-content/uploads/2017/02/adtDSC_0944.jpg'">
    </leapbox>
    <div class="empty-box"></div>
  </div>
</template>

<script>
import Leapbox from './components/Leapbox.vue'

export default {
  name: 'app',
  components: {
    Leapbox
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.empty-box {
  height: 1500px;
  width: 100%;
}
</style>
