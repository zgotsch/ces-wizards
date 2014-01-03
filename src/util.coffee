_ = require 'underscore'

sum = (list) ->
    _.foldl list, ((s, x) -> s + x), 0

average = (list) ->
    sum(list) / list.length

keyForComponent = (component) ->
    component.constructor.name.toLowerCase()

exports.sum = sum
exports.average = average
exports.keyForComponent = keyForComponent
