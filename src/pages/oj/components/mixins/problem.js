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
        className: 'status-column',
        render: (h, params) => {
          let status = params.row.my_status
          let boxStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            lineHeight: '1'
          }
          if (status === null || status === undefined) {
            boxStyle.backgroundColor = '#f5f5f5'
            boxStyle.border = '1px solid #e0e0e0'
            return h('div', { style: boxStyle }, [h('span', { style: { color: '#c0c0c0', fontSize: '14px' } }, '—')])
          }
          if (status === 0) {
            boxStyle.backgroundColor = '#e8f5e9'
            boxStyle.border = '1px solid #a5d6a7'
          } else {
            boxStyle.backgroundColor = '#fbe9e7'
            boxStyle.border = '1px solid #ef9a9a'
          }
          let icon = status === 0
            ? h('Icon', { props: { type: 'checkmark-round', size: '16' }, style: { color: '#19be6b' } })
            : h('Icon', { props: { type: 'close-round', size: '16' }, style: { color: '#ed3f14' } })
          return h('div', { style: boxStyle }, [icon])
        }
      })
      this.statusColumn = true
    }
  }
}
