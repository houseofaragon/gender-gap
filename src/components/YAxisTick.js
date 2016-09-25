const React = require('react')
const { func, number, string, shape } = React.PropTypes
const { interpolateNumber, interpolateTransformSvg } = require('d3-interpolate')
const { timer } = require('d3-timer')

const YAxisTick = React.createClass({
  propTypes: {
    tick: shape({
      udid: string.isRequired,
      type: string.isRequired,
      data: number.isRequired,
      text: string.isRequired
    }).isRequired,
    yScale0: func.isRequired,
    yScale1: func.isRequired,
    xLength: number.isRequired,
    duration: number.isRequired,
    removeTick: func.isRequired
  },
  componentDidMount () {
    this.isEntering(this.props, this.refs)
  },

  componentWillReceiveProps (next) {
    let {props, refs} = this

    if (props.tick !== next.tick) {
      this.transition.stop()

      switch (next.tick.type) {
        case 'ENTERING':
          return this.isEntering(next, refs)
        case 'UPDATING':
          return this.isUpating(next, refs)
        case 'EXITING':
          return this.isExiting(next, refs)
        default:
          throw new Error('Invalid Tick Type!')
      }
    }
  },

  isEntering ({yScale0, yScale1, tick: {data}, duration}, {tick}) {
    let beg = `translate(0,${yScale0(data)})`
    let end = `translate(0,${yScale1(data)})`

    let interp0 = interpolateTransformSvg(beg, end)
    let interp1 = interpolateNumber(1e-6, 1)

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration) : 1
      tick.setAttribute('transform', interp0(t))
      tick.setAttribute('opacity', interp1(t))
      if (t === 1) {
        this.transition.stop()
      }
    })
  },

  isUpating ({yScale0, yScale1, tick: {data}, duration}, {tick}) {
    let beg = `translate(0,${yScale0(data)})`
    let end = `translate(0,${yScale1(data)})`

    let interp0 = interpolateTransformSvg(beg, end)
    let interp1 = interpolateNumber(tick.getAttribute('opacity'), 1)

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration) : 1
      tick.setAttribute('transform', interp0(t))
      tick.setAttribute('opacity', interp1(t))
      if (t === 1) {
        this.transition.stop()
      }
    })
  },

  isExiting ({yScale0, yScale1, tick: {udid, data}, removeTick, duration}, {tick}) {
    let beg = `translate(0,${yScale0(data)})`
    let end = `translate(0,${yScale1(data)})`

    let interp0 = interpolateTransformSvg(beg, end)
    let interp1 = interpolateNumber(tick.getAttribute('opacity'), 1e-6)

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration) : 1
      tick.setAttribute('transform', interp0(t))
      tick.setAttribute('opacity', interp1(t))
      if (t === 1) {
        this.transition.stop()
        removeTick(udid)
      }
    })
  },

  componentWillUnmount () {
    this.transition.stop()
  },

  render () {
    let {xLength, tick: {text}} = this.props

    return (
      <g ref='tick' opacity={1e-6}>
        <line
          style={{pointerEvents: 'none'}}
          x1={0} y1={0}
          x2={xLength} y2={0}
          opacity={0.2}
          stroke='#fff'
        />
        <text
          fontSize={'9px'}
          textAnchor='end'
          dy='.35em'
          fill='white'
          x={-5} y={0}
        >{text}</text>
      </g>
    )
  }
})

module.exports = YAxisTick
