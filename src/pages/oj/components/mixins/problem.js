import utils from '@/utils/utils'

export default {
  data () {
    return {
      statusColumn: false
    }
  },
  methods: {
    getACRate (ACCount, TotalCount) {
      return utils.getACRate(ACCount, TotalCount)
    },
    addStatusColumn (tableColumns, dataProblems) {
      if (this.statusColumn) return
      tableColumns.splice(0, 0, {
        width: 50,
        title: ' ',
        align: 'center',
        render: (h, params) => {
          let status = params.row.my_status
          if (status === null || status === undefined) {
            return h('div', { style: { color: '#c0c0c0' } }, '—')
          }
          let icon = status === 0
            ? h('Icon', { props: { type: 'checkmark-round', size: '18' }, style: { color: '#19be6b' } })
            : h('Icon', { props: { type: 'close-round', size: '18' }, style: { color: '#ed3f14' } })
          return h('div', { style: { overflow: 'hidden', textOverflow: 'clip', lineHeight: '1' } }, [icon])
        }
      })
      this.statusColumn = true
    }
  }
}
