const React = require('react')
const { func, array, object, string } = React.PropTypes
import { connect } from 'react-redux'
import { updatePaths, toggleName, removeNode, changeOffset } from '../actions'
const { Table, TableRow, TableRowColumn, TableBody } = require('material-ui/table')
import { Card, CardHeader } from 'material-ui/Card'
import Slider from 'material-ui/Slider'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'
const Chart = require('../components/Chart')
const XAxis = require('../components/XAxis')
const YAxis = require('../components/YAxis')
const Path = require('../components/Path')
const { utcFormat } = require('d3-time-format')
const dateFormat = utcFormat('%-d/%-m/%Y')
const { format } = require('d3-format')
const numberFormat = format(',')
const percentFormat = format('.1p')
const { scaleOrdinal } = require('d3-scale')

const App = React.createClass({
  getInitialState () {
    let colors = scaleOrdinal()
      .domain(this.props.names.map(d => d.name))
      .range(['#9C6744', '#C9BEB9', '#CFA07E', '#C4BAA1', '#C2B6BF', '#8FB5AA', '#85889E', '#9C7989', '#91919C', '#99677B', '#918A59', '#6E676C', '#6E4752', '#6B4A2F', '#998476', '#8A968D', '#968D8A', '#968D96', '#CC855C', '#967860', '#929488', '#949278', '#A0A3BD', '#BD93A1', '#65666B', '#6B5745', '#6B6664', '#695C52', '#56695E', '#69545C', '#565A69', '#696043', '#63635C', '#636150', '#333131', '#332820', '#302D30', '#302D1F', '#2D302F', '#CFB6A3'])
    return { duration: 1000, colorMap: colors, activeName: '' }
  },

  propTypes: {
    view: array.isRequired,
    trbl: array.isRequired,
    names: array.isRequired,
    offset: string.isRequired,
    xScale: func.isRequired,
    yScale: func.isRequired,
    mounted: object.isRequired,
    dispatch: func.isRequired
  },

  componentDidMount () {
    let { dispatch } = this.props
    dispatch(updatePaths())
  },

  removeItem (key) {
    let {dispatch} = this.props
    dispatch(removeNode(key))
  },

  setDuration (e, value) {
    this.setState({
      duration: Math.floor(value * 10000)
    })
  },

  setActiveName (name) {
    this.setState({
      activeName: name
    })
  },

  toggleName (index) {
    let { dispatch } = this.props
    dispatch(toggleName(index))
  },

  render () {
    let {view, trbl, names, mounted, dispatch, offset, xScale, yScale} = this.props
    let {duration, colorMap, activeName} = this.state

    let pathNodes = Object.keys(mounted).map(key => {
      let node = mounted[key]
      return (
        <Path
          key={key} node={node} duration={duration}
          fill={key === activeName ? '#FF4C4C' : colorMap(key)}
          xScale={xScale} yScale={yScale}
          removeNode={this.removeItem}
          makeActive={this.setActiveName.bind(this, key)}
        />
      )
    })

    let tableRows = names.map(item => {
      return (
        <TableRow
          key={item.name}
          selected={item.show === true}
          onMouseOver={this.setActiveName.bind(this, item.name)}
          style={{
            cursor: 'pointer',
            backgroundColor: item.name === activeName ? 'red' : 'rgba(0,0,0,0)'
          }}
        >
          <TableRowColumn>{item.name}</TableRowColumn>
        </TableRow>
      )
    })

    let yAxis = null
    let xAxis = null

    if (yScale.ticks && xScale.ticks) {
      xAxis = (
        <XAxis
          xScale={xScale}
          yScale={yScale}
          format={dateFormat}
          duration={duration}
        />
      )
      yAxis = (
        <YAxis
          xScale={xScale}
          yScale={yScale}
          format={offset === 'expand' ? percentFormat : numberFormat}
          duration={duration}
        />
      )
    }

    return (
      <Card>
        <CardHeader
          title='Gender Gap'
          subtitle='Test'
          actAsExpander={false}
          showExpandableButton={false}
        />
        <div className='row' style={{marginLeft: 0, marginRight: 0}}>
          <div className='col-md-5 col-sm-5'>
            <div className='row'>
              <div className='col-md-5 col-sm-5'style={{paddingLeft: 20}}>
                <span>Chart Offset:</span>
                <RadioButtonGroup
                  name='offsets'
                  valueSelected={offset}
                  onChange={(e, d) => dispatch(changeOffset(d))}
                >
                  <RadioButton
                    value='stacked'
                    label='Stacked'
                  />
                  <RadioButton
                    value='stream'
                    label='Stream'
                  />
                  <RadioButton
                    value='expand'
                    label='Expand'
                  />
                </RadioButtonGroup>
              </div>
              <div className='col-md-7 col-sm-7'>
                <span>Transition Duration: {(duration / 1000).toFixed(1)}</span>
                <Slider
                  style={{marginTop: 10, marginBottom: 10}}
                  defaultValue={0.1}
                  onChange={this.setDuration}
                />
              </div>
            </div>
          </div>
          <div className='col-md-7 col-sm-7'>
            <h4 style={{margin: 0}}>Hello</h4>
            <p>fake data</p>
          </div>
        </div>
        <div className='row' style={{marginTop: 10, marginBottom: 50}}>
          <div
            className='col-md-3 col-sm-3'
            onMouseLeave={this.setActiveName.bind(this, '')}
          >
            <Table
              height={'500px'}
              multiSelectable
              wrapperStyle={{width: '100%'}}
              onCellClick={d => this.toggleName(d)}
            >
              <TableBody deselectOnClickaway={false} >
                {tableRows}
              </TableBody>
            </Table>
          </div>
          <div
            className='col-md-9 col-sm-9'
            style={{padding: 0}}
            onMouseLeave={this.setActiveName.bind(this, '')}
          >
            <Chart view={view} trbl={trbl}>
              {pathNodes}{xAxis}{yAxis}
              <text
                x={5} y={15}
                fill='#fff'
                style={{pointerEvents: 'none'}}
              >{activeName}</text>
            </Chart>
          </div>
        </div>
      </Card>
    )
  }
})

function mapStateToProps (state) {
  let {view, trbl, names, mounted, offset, xScale, yScale} = state
  return {view, trbl, names, mounted, offset, xScale, yScale}
}

module.exports = connect(mapStateToProps)(App)
