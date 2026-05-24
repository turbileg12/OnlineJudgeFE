<template>
  <Row type="flex" justify="space-around">
    <Col :span="22">
    <Panel :padding="10">
      <div slot="title">{{$t('m.OI_Ranklist')}}</div>
      <Table :data="dataRank" :columns="columns" size="large"></Table>
      <Pagination :total="total" :page-size.sync="limit" :current.sync="page"
                  @on-change="getRankData"
                  show-sizer @on-page-size-change="getRankData(1)"></Pagination>
    </Panel>
    </Col>
  </Row>
</template>

<script>
  import api from '@oj/api'
  import Pagination from '@oj/components/Pagination'
  import utils from '@/utils/utils'
  import { RULE_TYPE } from '@/utils/constants'

  export default {
    name: 'acm-rank',
    components: {
      Pagination
    },
    data () {
      return {
        page: 1,
        limit: 30,
        total: 0,
        dataRank: [],
        columns: [
          {
            align: 'center',
            width: 60,
            render: (h, params) => {
              return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
            }
          },
          {
            title: this.$i18n.t('m.User_User'),
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  'display': 'inline-block',
                  'max-width': '200px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.user.username}
                      })
                  }
                }
              }, params.row.user.username)
            }
          },
          {
            title: this.$i18n.t('m.mood'),
            align: 'center',
            key: 'mood'
          },
          {
            title: this.$i18n.t('m.Score'),
            align: 'center',
            key: 'total_score'
          },
          {
            title: this.$i18n.t('m.AC'),
            align: 'center',
            key: 'accepted_number'
          },
          {
            title: this.$i18n.t('m.Total'),
            align: 'center',
            key: 'submission_number'
          },
          {
            title: this.$i18n.t('m.Rating'),
            align: 'center',
            render: (h, params) => {
              return h('span', utils.getACRate(params.row.accepted_number, params.row.submission_number))
            }
          }
        ]
      }
    },
    mounted () {
      this.getRankData(1)
    },
    methods: {
      getRankData (page) {
        let offset = (page - 1) * this.limit
        api.getUserRank(offset, this.limit, RULE_TYPE.OI).then(res => {
          this.total = res.data.data.total
          this.dataRank = res.data.data.results
        })
      }
    }
  }
</script>
