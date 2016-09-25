const React = require('react')
const { func, number } = React.PropTypes
const XAxisTick = require('./XAxisTick')

const XAxis = React.createClass({
  getInitialState () {
    return {
      mounted: {},
      xScale0: null,
      xScale1: null
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
    if (this.props.xScale !== next.xScale) {
      this.update(next, props, state)
    }
  },
  update ({xScale, format}, props, {mounted}) {
    let nodes = {}
    let ticks = xScale.ticks()

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
      xScale0: props.xScale,
      xScale1: xScale
    })
  },

  removeTick (udid) {
    this.removed[udid] = true
  },

  render () {
    let {state: {mounted, xScale0, xScale1}, props: {duration, yScale}} = this

    let ticks = Object.keys(mounted).map(key => {
      let tick = mounted[key]
      return (
        <XAxisTick
          key={key} tick={tick}
          xScale0={xScale0} xScale1={xScale1}
          yHeight={yScale.range()[0]}
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

module.exports = XAxis
