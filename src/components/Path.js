const React = require('react')
const { string, func, number, shape } = React.PropTypes
const { timer } = require('d3-timer')
const { interpolateNumber, interpolateString } = require('d3-interpolate')

const Path = React.createClass({
  propTypes: {
    fill: string.isRequired,
    node: shape({
      udid: string.isRequired,
      type: string.isRequired,
      path: string.isRequired
    }).isRequired,
    xScale: func.isRequired,
    yScale: func.isRequired,
    duration: number.isRequired,
    removeNode: func.isRequired,
    makeActive: func.isRequired
  },
  componentDidMount () {
    this.isEntering(this.props, this.refs)
  },
  componentWillReceiveProps (next) {
    let {props, refs} = this

    if (props.node !== next.node) {
      this.transition.stop()

      switch (next.node.type) {
        case 'ENTERING':
          return this.isEntering(next, refs)
        case 'UPDATING':
          return this.isUpating(next, refs)
        case 'EXITING':
          return this.isExiting(props, refs)
        default:
          throw new Error('Invalid Node Type!')
      }
    }
  },
  isEntering ({node: {path}, duration}, {node}) {
    node.setAttribute('opacity', 1e-6)
    node.setAttribute('d', path)
    node.style['cursor'] = 'pointer'
    node.style['pointer-events'] = 'all'
    let interp = interpolateNumber(1e-6, 0.8)

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration) : 1
      node.setAttribute('opacity', interp(t))
      if (t === 1) {
        this.transition.stop()
      }
    })
  },

  isUpating ({node: {path}, duration}, {node}) {
    node.setAttribute('opacity', 0.8)

    let interp = interpolateString(node.getAttribute('d'), path)

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration) : 1
      node.setAttribute('d', interp(t))
      if (t === 1) {
        this.transition.stop()
      }
    })
  },

  isExiting ({node: {udid}, removeNode}, {node}) {
    node.setAttribute('opacity', 1e-6)
    node.style['pointer-events'] = 'none'

    this.transition.stop()
    removeNode(udid)
  },

  componentWillUnmount () {
    this.transition.stop()
  },
  shouldComponentUpdate (next) {
    return next.fill !== this.props.fill
  },

  render () {
    let {fill, makeActive} = this.props

    return (
      <path
        ref='node'
        onMouseOver={makeActive}
        className='node-path'
        fill={fill}
      />
    )
  }
})

module.exports = Path
