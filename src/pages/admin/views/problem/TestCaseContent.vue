<template>
  <div class="test-case-content-page">
    <Panel :title="'Test Case: ' + filename">
      <div slot="header">
        <el-button type="primary" size="small" icon="el-icon-back" @click="goBack">Back</el-button>
      </div>
      <div v-loading="loading">
        <pre class="content-box">{{ content }}</pre>
      </div>
    </Panel>
  </div>
</template>

<script>
  import api from '../../api'

  export default {
    name: 'TestCaseContent',
    data () {
      return {
        content: '',
        filename: '',
        loading: true
      }
    },
    mounted () {
      this.filename = this.$route.params.filename
      let testCaseId = this.$route.params.testCaseId
      console.log('Loading test case:', testCaseId, this.filename)
      api.getTestCaseContent(testCaseId, this.filename).then(res => {
        this.content = res.data.data.content
        this.loading = false
      }).catch((err) => {
        console.error('Test case load error:', err)
        let msg = 'Failed to load test case content'
        if (err && err.response && err.response.data && err.response.data.data) {
          msg = err.response.data.data
        } else if (err && err.data && err.data.data) {
          msg = err.data.data
        }
        this.content = msg
        this.loading = false
      })
    },
    methods: {
      goBack () {
        this.$router.go(-1)
      }
    }
  }
</script>

<style lang="less" scoped>
  .test-case-content-page {
    .content-box {
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 16px;
      white-space: pre-wrap;
      word-wrap: break-word;
      min-height: 200px;
      max-height: 600px;
      overflow-y: auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.6;
    }
  }
</style>
