<template>
  <div>
    <NavBar></NavBar>
    <div class="content-app">
      <transition name="fadeInUp" mode="out-in">
        <router-view></router-view>
      </transition>
      <div class="footer">
        <div class="footer-brand">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;">
            <rect x="2" y="2" width="36" height="36" rx="8" fill="#1e88e5"/>
            <text x="20" y="27" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff" font-family="monospace">&lt;/&gt;</text>
          </svg>
          <span style="color:#1e88e5;font-weight:600;">Online</span><span style="color:#0d47a1;font-weight:700;">Judge</span>
        </div>
        <p style="margin-top: 8px; color: #999; font-size: 12px;">Developed by Turbileg</p>
      </div>
    </div>
    <BackTop></BackTop>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import NavBar from '@oj/components/NavBar.vue'

  export default {
    name: 'app',
    components: {
      NavBar
    },
    data () {
      return {
        version: process.env.VERSION
      }
    },
    created () {
      try {
        document.body.removeChild(document.getElementById('app-loader'))
      } catch (e) {
      }
    },
    mounted () {
      this.getWebsiteConfig()
    },
    methods: {
      ...mapActions(['getWebsiteConfig', 'changeDomTitle'])
    },
    computed: {
      ...mapState(['website'])
    },
    watch: {
      'website' () {
        this.changeDomTitle()
      },
      '$route' () {
        this.changeDomTitle()
      }
    }
  }
</script>

<style lang="less">

  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    background-color: transparent;
    &:active, &:hover {
      outline-width: 0;
    }
  }


  @media screen and (max-width: 1200px) {
  .content-app {
    margin-top: 160px;
    padding: 0 2%;
  }
}

@media screen and (min-width: 1200px) {
  .content-app {
    margin-top: 80px;
    padding: 0 2%;
  }
}

  .footer {
    margin-top: 40px;
    margin-bottom: 10px;
    text-align: center;
    font-size: small;
    padding: 20px 0;
    border-top: 1px solid #e8e8e8;
    .footer-brand {
      margin-bottom: 8px;
    }
  }

  .fadeInUp-enter-active {
    animation: fadeInUp .8s;
  }


</style>
