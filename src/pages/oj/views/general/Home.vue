<template>
  <div>
    <div class="hero-section">
      <div class="hero-content">
        <svg class="hero-logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="72" height="72" rx="16" fill="#1e88e5"/>
          <text x="40" y="52" text-anchor="middle" font-size="38" font-weight="bold" fill="#fff" font-family="monospace">&lt;/&gt;</text>
        </svg>
        <h1 class="hero-title">Online<span>Judge</span></h1>
        <p class="hero-subtitle">Програмчлалын бодлого бодож, чадвараа сорь!</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <Icon type="ios-keypad" size="24"></Icon>
            <span>{{$t('m.NavProblems')}}</span>
          </div>
          <div class="hero-stat">
            <Icon type="trophy" size="24"></Icon>
            <span>{{$t('m.Contests')}}</span>
          </div>
          <div class="hero-stat">
            <Icon type="podium" size="24"></Icon>
            <span>{{$t('m.Rank')}}</span>
          </div>
        </div>
        <Button type="primary" size="large" class="hero-btn" @click="$router.push('/problem')">
          Бодлого бодох
          <Icon type="arrow-right-c"></Icon>
        </Button>
      </div>
    </div>
    <Row type="flex" justify="space-around">
      <Col :span="22">
      <panel shadow v-if="contests.length" class="contest">
        <div slot="title">
          <Icon type="trophy" style="color: #1e88e5; margin-right: 6px;"></Icon>
          <Button type="text" class="contest-title" @click="goContest">{{contests[index].title}}</Button>
        </div>
        <Carousel v-model="index" trigger="hover" autoplay :autoplay-speed="6000" class="contest">
          <CarouselItem v-for="(contest, index) of contests" :key="index">
            <div class="contest-content">
              <div class="contest-content-tags">
                <Button type="info" shape="circle" size="small" icon="calendar">
                  {{contest.start_time | localtime('YYYY-M-D HH:mm') }}
                </Button>
                <Button type="success" shape="circle" size="small" icon="android-time">
                  {{getDuration(contest.start_time, contest.end_time)}}
                </Button>
                <Button type="warning" shape="circle" size="small" icon="trophy">
                  {{contest.rule_type}}
                </Button>
              </div>
              <div class="contest-content-description">
                <blockquote v-html="contest.description"></blockquote>
              </div>
            </div>
          </CarouselItem>
        </Carousel>
      </panel>
      <Announcements class="announcement"></Announcements>
      </Col>
    </Row>
  </div>
</template>

<script>
  import Announcements from './Announcements.vue'
  import api from '@oj/api'
  import time from '@/utils/time'
  import { CONTEST_STATUS } from '@/utils/constants'

  export default {
    name: 'home',
    components: {
      Announcements
    },
    data () {
      return {
        contests: [],
        index: 0
      }
    },
    mounted () {
      let params = {status: CONTEST_STATUS.NOT_START}
      api.getContestList(0, 5, params).then(res => {
        this.contests = res.data.data.results
      })
    },
    methods: {
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      goContest () {
        this.$router.push({
          name: 'contest-details',
          params: {contestID: this.contests[this.index].id}
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .hero-section {
    background: linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%);
    border-radius: 12px;
    padding: 60px 20px;
    margin-bottom: 30px;
    text-align: center;
    color: #fff;
    position: relative;
    overflow: hidden;
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
    }
  }
  .hero-content {
    position: relative;
    z-index: 1;
  }
  .hero-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  }
  .hero-title {
    font-size: 48px;
    font-weight: 300;
    margin-bottom: 10px;
    letter-spacing: -1px;
    span {
      font-weight: 700;
    }
  }
  .hero-subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 30px;
  }
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 30px;
    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      opacity: 0.85;
      font-size: 14px;
    }
  }
  .hero-btn {
    font-size: 16px;
    padding: 8px 32px;
    height: auto;
    border-radius: 24px;
  }

  .contest {
    &-title {
      font-style: italic;
      font-size: 21px;
    }
    &-content {
      padding: 0 70px 40px 70px;
      &-description {
        margin-top: 25px;
      }
    }
  }

  .announcement {
    margin-top: 20px;
  }
</style>
