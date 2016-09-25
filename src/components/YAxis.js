const React = require('react')
const { func, number } = React.PropTypes
const YAxisTick = require('./YAxisTick')

const YAxis = React.createClass({
  getInitialState () {
    return {
      mounted: {},
      yScale0: null,
      yScale1: null
    }
  },
  propTypes: {
    xScale: func.isRequired,
    yScale: func.isRequired,
    format: func.isRequired,
    duration: number.isRequired
  },

  componentDidMount () {
    let {props, state} = this
    this.removed = {}
    this.update(props, props, state)
  },

  componentWillReceiveProps (next) {
    let {props, state} = this
    if (this.props.yScale !== next.yScale) {
      this.update(next, props, state)
    }
  },
  update ({yScale, format}, props, {mounted}) {
    let nodes = {}
    let ticks = yScale.ticks()

    for (let i = 0; i < ticks.length; i++) {
      let val = ticks[i]
      let key = `tick-${val}`

      nodes[key] = {
        udid: key,
        data: val
      }

      if (mounted[key] && !this.removed[key]) {
        nodes[key].text = mounted[key].text
        nodes[key].type = 'UPDATING'
      } else {
        nodes[key].text = format(val)
        nodes[key].type = 'ENTERING'
      }
    }

    for (let key in mounted) {
      if (!nodes[key] && !this.removed[key]) {
        nodes[key] = {
          udid: mounted[key].udid,
          data: mounted[key].data,
          text: mounted[key].text,
          type: 'EXITING'
        }
      }
    }

    this.removed = {}

    this.setState({
      mounted: nodes,
      yScale0: props.yScale,
      yScale1: yScale
    })
  },
  removeTick (udid) {
    this.removed[udid] = true
  },
  render () {
    let {state: {mounted, yScale0, yScale1}, props: {duration, xScale}} = this

    let ticks = Object.keys(mounted).map(key => {
      let tick = mounted[key]
      return (
        <YAxisTick
          key={key} tick={tick}
          yScale0={yScale0} yScale1={yScale1}
          xLength={xScale.range()[1]}
          duration={duration}
          removeTick={this.removeTick}
        />
      )
    })
    return (
      <g>{ticks}</g>
    )
  }
})

module.exports = YAxis

