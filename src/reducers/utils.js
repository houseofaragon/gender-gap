import moment from 'moment'
import { area, stack, stackOffsetNone, stackOffsetSilhouette, stackOffsetExpand } from 'd3-shape'
import { extent, merge, shuffle } from 'd3-array'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { utcParse } from 'd3-time-format'
import { fruits } from '../data/'
import { income_data } from '../data/income-data'

const data = income_data

export function getInitialValues () {
  let timeNow = moment()

  let dates = {}
  var names = {}

  for (let i = 0; i < data.length; i++) {
    let name = data[i].name
    names[name] = data[i].earnings
  }

  console.log('Names: ', names)
  console.log('Names[name]', names[name])
  let items = []
  
  for (let i = 0; i < data.length; i++) {
    let date = data[i].date
    dates[date] = true

    let item = {date}
    item.total = 0

    for (let j = 0; j < data.length; j++) {
      let label = data[j].name
      let value = names[label].earnings
      item[label] = value
      item.total += value
    }

    items.push(item)
  }

  /*
  for (let i = 0; i < data.length; i++) {
    let date = data[i].date
    let total = 0
    dates[date] = true

    let item = {date}
    item.totl = 0
    let label = data[i].name
    let value = data[i].earnings
    item[label] = value
    item.total += value
    items.push(item)
  }
  */  

  return [
    items,
    Object.keys(names).sort().map(d => ({name: d, show: true})),
    Object.keys(dates).sort()
  ]
}

function getPath (x, y, yVals, dates) {
  console.log('x,y,yVals,dates: ', [x,y,yVals,dates])
  return area()
    .x(d => x(d))
    .y0((d, i) => y(yVals[i][0]))
    .y1((d, i) => y(yVals[i][1]))(dates)
}

export function getPathsAndScales (dims, data, names, dates, offset) {
  names = names.filter(d => d.show === true).map(d => d.name)
  dates = dates.map(d => utcParse('%Y-%m-%d')(d))

  let layoutOffset = stackOffsetNone

  if (offset === 'stream') {
    layoutOffset = stackOffsetSilhouette
  } else if (offset === 'expand') {
    layoutOffset = stackOffsetExpand
  }

  let layout = stack()
    .keys(names)
    .value((d, key) => d[key])
    .offset(layoutOffset)(data)

  let x = scaleUtc()
    .range([0, dims[0]])
    .domain([dates[0], dates[dates.length - 1]])

  let y = scaleLinear()
    .range([dims[1], 0])
    .domain(extent(merge(merge(layout))))

  let paths = {}

  for (let k = 0; k < names.length; k++) {
    paths[names[k]] = getPath(x, y, layout[k], dates)
    console.log('Paths: ', paths[names[k]])
  }

  return [paths, x, y]
}

