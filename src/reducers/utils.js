import moment from 'moment'
import { area, stack, stackOffsetNone, stackOffsetSilhouette, stackOffsetExpand, stackOffsetWiggle } from 'd3-shape'
import { extent, merge, shuffle } from 'd3-array'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { utcParse } from 'd3-time-format'
import { fruits } from '../data/'
import { bls_earnings_data } from '../data/bls-earnings'

const data = bls_earnings_data.map((item) => {
  if(item.sex === 'Men'){
    item.occupation = item.occupation + ' - 0'
    return item
  }
  else{
    item.occupation = item.occupation + ' - 1'
    return item
  }
})

const getItems = () => {
  map_years.map((year, idx1) => {
    years[year] = true
    let item = {year}
    item.total = 0

    data.map((oc, idx2) => {
      let label = oc.occupation
      let value = occupations[label][idx1]
      if(value === undefined) value = 0
      item[label] = value
      item.total += value
    })
  return item
  })
}

const getEarnings = (occupation) => {
    let earnings = []
    data.filter((item) => {
      if(item.occupation && item.occupation === occupation){
        if (item.earnings) earnings.push(item.earnings)
      }
    })
    return earnings
  }

export function getInitialValues () {
  let years = {}
  let occupations = {}

  const map_occupations =  [...new Set(data.map(item => item.occupation))]
  const map_years = [...new Set(data.map(item => item.year))]

  map_occupations.map((occupation, idx) => {
    occupations[occupation] = getEarnings(occupation)
  })

  const items = getItems()

  return [
    items,
    Object.keys(occupations).sort().map(d => ({name: d, show: true})),
    Object.keys(years).sort()
  ]
}

const getPath = (x, y, yVals, dates) => {
  return area()
    .x(d => x(d))
    .y0((d, i) => y(yVals[i][0]))
    .y1((d, i) => y(yVals[i][1]))(dates)
}

export function getPathsAndScales (dims, data, names, dates, offset) {
  names = names.filter(d => d.show === true).map(d => d.name)
  dates = dates.map(d => utcParse('%Y')(d))

  let layoutOffset = stackOffsetNone

  if (offset === 'stream') {
    layoutOffset = stackOffsetWiggle
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

