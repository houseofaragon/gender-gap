import moment from 'moment'
import { area, stack, stackOffsetNone, stackOffsetSilhouette, stackOffsetExpand } from 'd3-shape'
import { extent, merge, shuffle } from 'd3-array'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { utcParse } from 'd3-time-format'
import { fruits } from '../data/'
import { income_data } from '../data/income-data'

const data = income_data

export function getInitialValues () {
  let dates = {}
  let names = {}
  const map_names =  [...new Set(data.map(item => item.name))]
  const map_dates = [...new Set(data.map(item => item.date))]

  const getEarnings = (occupation) => {
    let earnings = []
    data.filter((item) => {
      if(item.name === occupation){
        earnings.push(item.earnings)
      }
    })
    return earnings
  }

  for (let i = 0; i < map_names.length; i++) {
    let name = map_names[i]
    names[name] = getEarnings(name)
  }

  let items = []
  
  for (let i = 0; i < map_dates.length; i++) {
    let date = map_dates[i]
    dates[date] = true

    let item = {date}
    item.total = 0

    for (let j = 0; j < data.length; j++) {
      let label = data[j].name
      let value = names[label][i]
      item[label] = value
      item.total += value
    }
    items.push(item)
  }

  return [
    items,
    Object.keys(names).sort().map(d => ({name: d, show: true})),
    Object.keys(dates).sort()
  ]
}

function getPath (x, y, yVals, dates) {
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

