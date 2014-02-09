_ = require 'underscore'

sum = (list) ->
    _.foldl list, ((s, x) -> s + x), 0

average = (list) ->
    sum(list) / list.length

keyForComponent = (component) ->
    component.constructor.name.toLowerCase()

rotateArray = (arr, offset) ->
    newArr = arr.slice()
    for x, i in arr
        index = (i + arr.length + offset) % arr.length
        newArr[index] = x
    newArr

exports.sum = sum
exports.average = average
exports.keyForComponent = keyForComponent
exports.rotateArray = rotateArray
