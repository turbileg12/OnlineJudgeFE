<template>
  <div class="problem">

    <Panel :title="title">
      <el-form ref="form" :model="problem" :rules="rules" label-position="top" label-width="70px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item prop="_id" :label="$t('m.Display_ID')"
                          :required="this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem'">
              <el-input :placeholder="$t('m.Display_ID')" v-model="problem._id"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item prop="title" :label="$t('m.Title')" required>
              <el-input :placeholder="$t('m.Title')" v-model="problem.title"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Description Mode">
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-radio-group v-model="descriptionMode">
                  <el-radio label="editor">Editor</el-radio>
                  <el-radio label="pdf">PDF Upload</el-radio>
                </el-radio-group>
                <el-upload
                  v-if="descriptionMode === 'pdf'"
                  action="/api/admin/upload_file"
                  name="file"
                  accept=".pdf"
                  :show-file-list="false"
                  :on-success="pdfUploadSuccess"
                  :on-error="pdfUploadError"
                  :before-upload="beforePdfUpload"
                  style="display: inline-block;">
                  <el-button size="small" type="primary" icon="el-icon-upload">File Upload</el-button>
                </el-upload>
              </div>
              <div v-if="descriptionMode === 'pdf' && problem.description_pdf" class="pdf-preview">
                <div class="pdf-info">
                  <i class="el-icon-document"></i>
                  <span>PDF uploaded</span>
                  <el-button type="text" size="small" @click="viewPdf">View</el-button>
                  <el-button type="text" size="small" style="color: #f56c6c;" @click="removePdf">Remove</el-button>
                </div>
                <iframe :src="problem.description_pdf" class="pdf-frame"></iframe>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="descriptionMode === 'editor'">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="description" :label="$t('m.Description')" required>
                <Simditor v-model="problem.description"></Simditor>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="input_description" :label="$t('m.Input_Description')" required>
                <Simditor v-model="problem.input_description"></Simditor>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="output_description" :label="$t('m.Output_Description')" required>
                <Simditor v-model="problem.output_description"></Simditor>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('m.Time_Limit') + ' (ms)' " required>
              <el-input type="Number" :placeholder="$t('m.Time_Limit')" v-model="problem.time_limit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Memory_limit') + ' (MB)' " required>
              <el-input type="Number" :placeholder="$t('m.Memory_limit')" v-model="problem.memory_limit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Difficulty')">
              <el-select class="difficulty-select" size="small" :placeholder="$t('m.Difficulty')" v-model="problem.difficulty">
                <el-option :label="$t('m.Low')" value="Low"></el-option>
                <el-option :label="$t('m.Mid')" value="Mid"></el-option>
                <el-option :label="$t('m.High')" value="High"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item :label="$t('m.Visible')">
              <el-switch
                v-model="problem.visible"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.ShareSubmission')">
              <el-switch
                v-model="problem.share_submission"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Tag')" :error="error.tags" required>
              <span class="tags">
                <el-tag
                  v-for="tag in problem.tags"
                  :closable="true"
                  :close-transition="false"
                  :key="tag"
                  type="success"
                  @close="closeTag(tag)"
                >{{tag}}</el-tag>
              </span>
              <el-autocomplete
                v-if="inputVisible"
                size="mini"
                class="input-new-tag"
                popper-class="problem-tag-poper"
                v-model="tagInput"
                :trigger-on-focus="false"
                @keyup.enter.native="addTag"
                @select="addTag"
                :fetch-suggestions="querySearch">
              </el-autocomplete>
              <el-button class="button-new-tag" v-else size="small" @click="inputVisible = true">+ {{$t('m.New_Tag')}}</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Languages')" :error="error.languages" required>
              <el-checkbox-group v-model="problem.languages">
                <el-tooltip class="spj-radio" v-for="lang in allLanguage.languages" :key="'spj'+lang.name" effect="dark"
                            :content="lang.description" placement="top-start">
                  <el-checkbox :label="lang.name"></el-checkbox>
                </el-tooltip>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-form-item v-for="(sample, index) in problem.samples" :key="'sample'+index">
            <Accordion :title="'Sample' + (index + 1)">
              <el-button type="warning" size="small" icon="el-icon-delete" slot="header" @click="deleteSample(index)">
                Delete
              </el-button>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="$t('m.Input_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Input_Samples')"
                      v-model="sample.input">
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('m.Output_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Output_Samples')"
                      v-model="sample.output">
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </Accordion>
          </el-form-item>
        </div>
        <div class="add-sample-btn">
          <button type="button" class="add-samples" @click="addSample()"><i class="el-icon-plus"></i>{{$t('m.Add_Sample')}}
          </button>
        </div>
        <el-form-item style="margin-top: 20px" :label="$t('m.Hint')">
          <Simditor v-model="problem.hint" placeholder=""></Simditor>
        </el-form-item>
        <el-form-item :label="$t('m.Code_Template')">
          <el-row>
            <el-col :span="24" v-for="(v, k) in template" :key="'template'+k">
              <el-form-item>
                <el-checkbox v-model="v.checked">{{ k }}</el-checkbox>
                <div v-if="v.checked">
                  <code-mirror v-model="v.code" :mode="v.mode"></code-mirror>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="$t('m.Special_Judge')" :error="error.spj">
          <el-col :span="24">
            <el-checkbox v-model="problem.spj" @click.native.prevent="switchSpj()">{{$t('m.Use_Special_Judge')}}</el-checkbox>
          </el-col>
        </el-form-item>
        <el-form-item v-if="problem.spj">
          <Accordion :title="$t('m.Special_Judge_Code')">
            <template slot="header">
              <span>{{$t('m.SPJ_language')}}</span>
              <el-radio-group v-model="problem.spj_language">
                <el-tooltip class="spj-radio" v-for="lang in allLanguage.spj_languages" :key="lang.name" effect="dark"
                            :content="lang.description" placement="top-start">
                  <el-radio :label="lang.name">{{ lang.name }}</el-radio>
                </el-tooltip>
              </el-radio-group>
              <el-button type="primary" size="small" icon="el-icon-fa-random" @click="compileSPJ"
                         :loading="loadingCompile">
                {{$t('m.Compile')}}
              </el-button>
            </template>
            <code-mirror v-model="problem.spj_code" :mode="spjMode"></code-mirror>
          </Accordion>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="4">
            <el-form-item :label="$t('m.Type')">
              <el-radio-group v-model="problem.rule_type" :disabled="disableRuleType">
                <el-radio label="ACM">ACM</el-radio>
                <el-radio label="OI">OI</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="$t('m.TestCase')" :error="error.testcase">
              <el-upload
                action="/api/admin/test_case"
                name="file"
                :data="{spj: problem.spj}"
                :show-file-list="true"
                :on-success="uploadSucceeded"
                :on-error="uploadFailed">
                <el-button size="small" type="primary" icon="el-icon-fa-upload">Choose File</el-button>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="24" style="margin-top: 10px;">
            <el-form-item label="Manual Test Cases">
              <div v-for="(tc, index) in manualTestCases" :key="'tc'+index" style="margin-bottom: 15px; border: 1px solid #dcdfe6; padding: 15px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong>Test Case {{ index + 1 }}</strong>
                  <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeManualTestCase(index)">Delete</el-button>
                </div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Input">
                      <el-input type="textarea" :rows="4" placeholder="Input" v-model="tc.input"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Output">
                      <el-input type="textarea" :rows="4" placeholder="Output" v-model="tc.output"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
              <div>
                <el-button type="primary" size="small" icon="el-icon-plus" @click="addManualTestCase">Add Test Case</el-button>
                <el-button type="success" size="small" icon="el-icon-upload2" @click="submitManualTestCases" :loading="uploadingManual" :disabled="manualTestCases.length === 0">Upload Test Cases</el-button>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item :label="$t('m.IOMode')">
              <el-radio-group v-model="problem.io_mode.io_mode">
                <el-radio label="Standard IO">Standard IO</el-radio>
                <el-radio label="File IO">File IO</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="4" v-if="problem.io_mode.io_mode == 'File IO'">
            <el-form-item :label="$t('m.InputFileName')" required>
              <el-input type="text" v-model="problem.io_mode.input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="problem.io_mode.io_mode == 'File IO'">
            <el-form-item :label="$t('m.OutputFileName')" required>
              <el-input type="text" v-model="problem.io_mode.output"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-table
              :data="problem.test_case_score"
              style="width: 100%">
              <el-table-column
                prop="input_name"
                :label="$t('m.Input')">
              </el-table-column>
              <el-table-column
                prop="output_name"
                :label="$t('m.Output')">
              </el-table-column>
              <el-table-column
                prop="score"
                :label="$t('m.Score')">
                <template slot-scope="scope">
                  <el-input
                    size="small"
                    :placeholder="$t('m.Score')"
                    v-model="scope.row.score"
                    :disabled="problem.rule_type !== 'OI'">
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column
                label="Actions"
                width="300">
                <template slot-scope="scope">
                  <div class="tc-actions">
                    <router-link class="tc-btn tc-btn-in" :to="{name: 'test-case-content', params: {testCaseId: problem.test_case_id, filename: scope.row.input_name}}" target="_blank">
                      <i class="el-icon-document"></i> {{ scope.row.input_name }}
                    </router-link>
                    <router-link v-if="scope.row.output_name && scope.row.output_name !== '-'" class="tc-btn tc-btn-out" :to="{name: 'test-case-content', params: {testCaseId: problem.test_case_id, filename: scope.row.output_name}}" target="_blank">
                      <i class="el-icon-document"></i> {{ scope.row.output_name }}
                    </router-link>
                    <span class="tc-btn tc-btn-delete" @click="deleteTestCase(scope.row)">
                      <i class="el-icon-delete"></i> Delete
                    </span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-form-item :label="$t('m.Source')">
          <el-input :placeholder="$t('m.Source')" v-model="problem.source"></el-input>
        </el-form-item>
        <save @click.native="submit()">Save</save>
      </el-form>
    </Panel>
  </div>
</template>

<script>
  import Simditor from '../../components/Simditor'
  import Accordion from '../../components/Accordion'
  import CodeMirror from '../../components/CodeMirror'
  import api from '../../api'

  export default {
    name: 'Problem',
    components: {
      Simditor,
      Accordion,
      CodeMirror
    },
    data () {
      return {
        rules: {
          _id: {required: true, message: 'Display ID is required', trigger: 'blur'},
          title: {required: true, message: 'Title is required', trigger: 'blur'},
          input_description: {required: true, message: 'Input Description is required', trigger: 'blur'},
          output_description: {required: true, message: 'Output Description is required', trigger: 'blur'}
        },
        loadingCompile: false,
        mode: '',
        contest: {},
        problem: {
          languages: [],
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'}
        },
        reProblem: {
          languages: [],
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'}
        },
        descriptionMode: 'editor',
        testCaseUploaded: false,
        manualTestCases: [],
        uploadingManual: false,
        allLanguage: {},
        inputVisible: false,
        tagInput: '',
        template: {},
        title: '',
        spjMode: '',
        disableRuleType: false,
        routeName: '',
        error: {
          tags: '',
          spj: '',
          languages: '',
          testCase: ''
        }
      }
    },
    mounted () {
      this.routeName = this.$route.name
      if (this.routeName === 'edit-problem' || this.routeName === 'edit-contest-problem') {
        this.mode = 'edit'
      } else {
        this.mode = 'add'
      }
      api.getLanguages().then(res => {
        this.problem = this.reProblem = {
          _id: '',
          title: '',
          description: '',
          input_description: '',
          output_description: '',
          time_limit: 1000,
          memory_limit: 256,
          difficulty: 'Low',
          visible: true,
          share_submission: false,
          tags: [],
          languages: [],
          template: {},
          samples: [{input: '', output: ''}],
          spj: false,
          spj_language: '',
          spj_code: '',
          spj_compile_ok: false,
          test_case_id: '',
          test_case_score: [],
          rule_type: 'ACM',
          hint: '',
          source: '',
          io_mode: {'io_mode': 'Standard IO', 'input': 'input.txt', 'output': 'output.txt'},
          description_pdf: ''
        }
        let contestID = this.$route.params.contestId
        if (contestID) {
          this.problem.contest_id = this.reProblem.contest_id = contestID
          this.disableRuleType = true
          api.getContest(contestID).then(res => {
            this.problem.rule_type = this.reProblem.rule_type = res.data.data.rule_type
            this.contest = res.data.data
          })
        }

        this.problem.spj_language = 'C'

        let allLanguage = res.data.data
        this.allLanguage = allLanguage

        // get problem after getting languages list to avoid find undefined value in `watch problem.languages`
        if (this.mode === 'edit') {
          this.title = this.$i18n.t('m.Edit_Problem')
          let funcName = {'edit-problem': 'getProblem', 'edit-contest-problem': 'getContestProblem'}[this.routeName]
          api[funcName](this.$route.params.problemId).then(problemRes => {
            let data = problemRes.data.data
            if (!data.spj_code) {
              data.spj_code = ''
            }
            data.spj_language = data.spj_language || 'C'
            this.problem = data
            this.testCaseUploaded = true
            if (data.description_pdf) {
              this.descriptionMode = 'pdf'
            }
          })
        } else {
          this.title = this.$i18n.t('m.Add_Problem')
          for (let item of allLanguage.languages) {
            this.problem.languages.push(item.name)
          }
        }
      })
    },
    watch: {
      '$route' () {
        this.$refs.form.resetFields()
        this.problem = this.reProblem
      },
      'problem.languages' (newVal) {
        let data = {}
        // use deep copy to avoid infinite loop
        let languages = JSON.parse(JSON.stringify(newVal)).sort()
        for (let item of languages) {
          if (this.template[item] === undefined) {
            let langConfig = this.allLanguage.languages.find(lang => {
              return lang.name === item
            })
            if (this.problem.template[item] === undefined) {
              data[item] = {checked: false, code: langConfig.config.template, mode: langConfig.content_type}
            } else {
              data[item] = {checked: true, code: this.problem.template[item], mode: langConfig.content_type}
            }
          } else {
            data[item] = this.template[item]
          }
        }
        this.template = data
      },
      'problem.spj_language' (newVal) {
        this.spjMode = this.allLanguage.spj_languages.find(item => {
          return item.name === this.problem.spj_language
        }).content_type
      }
    },
    methods: {
      beforePdfUpload (file) {
        const isPdf = file.type === 'application/pdf'
        if (!isPdf) {
          this.$error('Only PDF files are allowed')
        }
        return isPdf
      },
      pdfUploadSuccess (response) {
        console.log('PDF upload response:', response)
        if (response.success) {
          this.problem.description_pdf = response.file_path
          this.$success('PDF uploaded successfully')
        } else {
          this.$error(response.msg || 'Upload failed')
        }
      },
      pdfUploadError (err) {
        console.error('PDF upload error:', err)
        this.$error('PDF upload failed')
      },
      viewPdf () {
        window.open(this.problem.description_pdf, '_blank')
      },
      removePdf () {
        this.problem.description_pdf = ''
      },
      switchSpj () {
        if (this.testCaseUploaded) {
          this.$confirm('If you change problem judge method, you need to re-upload test cases', 'Warning', {
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.problem.spj = !this.problem.spj
            this.resetTestCase()
          }).catch(() => {
          })
        } else {
          this.problem.spj = !this.problem.spj
        }
      },
      querySearch (queryString, cb) {
        api.getProblemTagList({ keyword: queryString }).then(res => {
          let tagList = []
          for (let tag of res.data.data) {
            tagList.push({value: tag.name})
          }
          cb(tagList)
        }).catch(() => {
        })
      },
      resetTestCase () {
        this.testCaseUploaded = false
        this.problem.test_case_score = []
        this.problem.test_case_id = ''
      },
      addTag () {
        let inputValue = this.tagInput
        if (inputValue) {
          this.problem.tags.push(inputValue)
        }
        this.inputVisible = false
        this.tagInput = ''
      },
      closeTag (tag) {
        this.problem.tags.splice(this.problem.tags.indexOf(tag), 1)
      },
      addSample () {
        this.problem.samples.push({input: '', output: ''})
      },
      deleteSample (index) {
        this.problem.samples.splice(index, 1)
      },
      uploadSucceeded (response) {
        if (response.error) {
          this.$error(response.data)
          return
        }
        let fileList = response.data.info
        for (let file of fileList) {
          file.score = (100 / fileList.length).toFixed(0)
          if (!file.output_name && this.problem.spj) {
            file.output_name = '-'
          }
        }
        this.problem.test_case_score = fileList
        this.testCaseUploaded = true
        this.problem.test_case_id = response.data.id
      },
      uploadFailed () {
        this.$error('Upload failed')
      },
      addManualTestCase () {
        this.manualTestCases.push({input: '', output: ''})
      },
      removeManualTestCase (index) {
        this.manualTestCases.splice(index, 1)
      },
      submitManualTestCases () {
        for (let tc of this.manualTestCases) {
          if (!tc.input.trim() || (!this.problem.spj && !tc.output.trim())) {
            this.$error('Test case input and output cannot be empty')
            return
          }
        }
        this.uploadingManual = true
        let payload = {
          test_cases: this.manualTestCases,
          spj: this.problem.spj
        }
        if (this.problem.test_case_id) {
          payload.test_case_id = this.problem.test_case_id
        }
        api.uploadManualTestCase(payload).then(res => {
          this.uploadingManual = false
          let fileList = res.data.data.info
          for (let file of fileList) {
            file.score = (100 / fileList.length).toFixed(0)
            if (!file.output_name && this.problem.spj) {
              file.output_name = '-'
            }
          }
          this.problem.test_case_score = fileList
          this.testCaseUploaded = true
          this.problem.test_case_id = res.data.data.id
          this.manualTestCases = []
        }, () => {
          this.uploadingManual = false
        })
      },
      deleteTestCase (row) {
        this.$confirm('Are you sure you want to delete this test case?', 'Warning', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          api.deleteTestCase({
            test_case_id: this.problem.test_case_id,
            input_name: row.input_name
          }).then(res => {
            let fileList = res.data.data.info
            for (let file of fileList) {
              file.score = (100 / fileList.length).toFixed(0)
              if (!file.output_name && this.problem.spj) {
                file.output_name = '-'
              }
            }
            this.problem.test_case_score = fileList
            if (fileList.length === 0) {
              this.testCaseUploaded = false
              this.problem.test_case_id = ''
            }
          })
        }).catch(() => {})
      },
      compileSPJ () {
        let data = {
          id: this.problem.id,
          spj_code: this.problem.spj_code,
          spj_language: this.problem.spj_language
        }
        this.loadingCompile = true
        api.compileSPJ(data).then(res => {
          this.loadingCompile = false
          this.problem.spj_compile_ok = true
          this.error.spj = ''
        }, err => {
          this.loadingCompile = false
          this.problem.spj_compile_ok = false
          const h = this.$createElement
          this.$msgbox({
            title: 'Compile Error',
            type: 'error',
            message: h('pre', err.data.data),
            showCancelButton: false,
            closeOnClickModal: false,
            customClass: 'dialog-compile-error'
          })
        })
      },
      submit () {
        if (this.descriptionMode === 'pdf') {
          if (!this.problem.description_pdf) {
            this.$error('Please upload a PDF file')
            return
          }
          if (!this.problem.description) {
            this.problem.description = 'See PDF'
          }
          if (!this.problem.input_description) {
            this.problem.input_description = 'See PDF'
          }
          if (!this.problem.output_description) {
            this.problem.output_description = 'See PDF'
          }
        }
        if (!this.problem.tags.length) {
          this.error.tags = 'Please add at least one tag'
          this.$error(this.error.tags)
          return
        }
        if (this.problem.spj) {
          if (!this.problem.spj_code) {
            this.error.spj = 'Spj code is required'
            this.$error(this.error.spj)
          } else if (!this.problem.spj_compile_ok) {
            this.error.spj = 'SPJ code has not been successfully compiled'
          }
          if (this.error.spj) {
            this.$error(this.error.spj)
            return
          }
        }
        if (!this.problem.languages.length) {
          this.error.languages = 'Please choose at least one language for problem'
          this.$error(this.error.languages)
          return
        }
        if (!this.testCaseUploaded) {
          this.error.testCase = 'Test case is not uploaded yet'
          this.$error(this.error.testCase)
          return
        }
        if (this.problem.rule_type === 'OI') {
          for (let item of this.problem.test_case_score) {
            try {
              if (parseInt(item.score) <= 0) {
                this.$error('Invalid test case score')
                return
              }
            } catch (e) {
              this.$error('Test case score must be an integer')
              return
            }
          }
        }
        this.problem.languages = this.problem.languages.sort()
        this.problem.template = {}
        for (let k in this.template) {
          if (this.template[k].checked) {
            this.problem.template[k] = this.template[k].code
          }
        }
        let funcName = {
          'create-problem': 'createProblem',
          'edit-problem': 'editProblem',
          'create-contest-problem': 'createContestProblem',
          'edit-contest-problem': 'editContestProblem'
        }[this.routeName]
        // edit contest problem 时, contest_id会被后来的请求覆盖掉
        if (funcName === 'editContestProblem') {
          this.problem.contest_id = this.contest.id
        }
        api[funcName](this.problem).then(res => {
          if (this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem') {
            this.$router.push({name: 'contest-problem-list', params: {contestId: this.$route.params.contestId}})
          } else {
            this.$router.push({name: 'problem-list'})
          }
        }).catch(() => {
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .problem {
    .difficulty-select {
      width: 120px;
    }
    .spj-radio {
      margin-left: 10px;
      &:last-child {
        margin-right: 20px;
      }
    }
    .input-new-tag {
      width: 78px;
    }
    .button-new-tag {
      height: 24px;
      line-height: 22px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .tags {
      .el-tag {
        margin-right: 10px;
      }
    }
    .accordion {
      margin-bottom: 10px;
    }
    .add-samples {
      width: 100%;
      background-color: #fff;
      border: 1px dashed #aaa;
      outline: none;
      cursor: pointer;
      color: #666;
      height: 35px;
      font-size: 14px;
      &:hover {
        background-color: #f9fafc;
      }
      i {
        margin-right: 10px;
      }
    }
    .add-sample-btn {
      margin-bottom: 10px;
    }
    .tc-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tc-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;
    }
    .tc-btn-in {
      background-color: #ecf5ff;
      color: #409eff;
      border: 1px solid #d9ecff;
      &:hover {
        background-color: #409eff;
        color: #fff;
      }
    }
    .tc-btn-out {
      background-color: #f0f9eb;
      color: #67c23a;
      border: 1px solid #e1f3d8;
      &:hover {
        background-color: #67c23a;
        color: #fff;
      }
    }
    .pdf-preview {
      margin-top: 12px;
    }
    .pdf-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      padding: 8px 12px;
      background-color: #f0f9eb;
      border: 1px solid #e1f3d8;
      border-radius: 4px;
      color: #67c23a;
      font-weight: 500;
      i {
        font-size: 18px;
      }
    }
    .pdf-frame {
      width: 100%;
      height: 500px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
    }
    .tc-btn-delete {
      background-color: #fef0f0;
      color: #f56c6c;
      border: 1px solid #fde2e2;
      &:hover {
        background-color: #f56c6c;
        color: #fff;
      }
    }

  }
</style>

<style>
  .problem-tag-poper {
    width: 200px !important;
  }
  .dialog-compile-error {
    width: auto;
    max-width: 80%;
    overflow-x: scroll;
  }
</style>

