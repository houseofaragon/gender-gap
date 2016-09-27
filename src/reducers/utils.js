import moment from 'moment'
import { area, stack, stackOffsetNone, stackOffsetSilhouette, stackOffsetExpand } from 'd3-shape'
import { extent, merge, shuffle } from 'd3-array'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { utcParse } from 'd3-time-format'
import { fruits } from '../data/'
import { income_data } from '../data/income-data'

let data = income_data

/*
const data = d.map((item) => {
  if(item.sex === 'Men'){
    item.occupation = item.occupation + ' - M'
    return item
  }
  else{
    item.occupation = item.occupation + ' - F'
    return item
  }
})
*/

export function getInitialValues () {
  let years = {}
  let occupations = {}

  const map_occupations =  [...new Set(data.map(item => item.occupation))]
  let map_years = [...new Set(data.map(item => item.year))]

  const getEarnings = (occupation) => {
    let earnings = []
    data.filter((item) => {
      if(item.occupation && item.occupation === occupation){
        if (item.earnings) earnings.push(item.earnings)
      }

    })
    return earnings
  }

  for (let i = 0; i < map_occupations.length; i++) {
    let occupation = map_occupations[i]
    occupations[occupation] = getEarnings(occupation)
  }

  let items = []
  
  for (let i = 0; i < map_years.length; i++) {
    let year = map_years[i]
    years[year] = true

    let item = {year}
    item.total = 0

    for (let j = 0; j < data.length; j++) {
      let label = data[j].occupation
      let value = occupations[label][i]
      item[label] = value
      item.total += value
    }
    items.push(item)
  }

  return [
    items,
    Object.keys(occupations).sort().map(d => ({name: d, show: true})),
    Object.keys(years).sort()
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
  }

  return [paths, x, y]
}

