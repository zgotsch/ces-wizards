Math.TAU = 2 * Math.PI

magnitude = (v) ->
    Math.sqrt(v[0] * v[0] + v[1] * v[1])

normalize = (v) ->
    m = magnitude v
    [v[0] / m, v[1] / m]

add2d = (v1, v2) ->
    [v1[0] + v2[0], v1[1] + v2[1]]

sub2d = (v1, v2) ->
    [v1[0] - v2[0], v1[1] - v2[1]]

scale = (v, s) ->
    [v[0] * s, v[1] * s]

scaleTo = (v, s) ->
    scale(normalize(v), s)

distance = (v1, v2) ->
    magnitude(sub2d(v1, v2))

direction = (to, from) ->
    normalize(sub2d to, from)

angleOfIncidence = (v, flipy = true) ->
    theta = Math.atan2 (if flipy then -v[1] else v[1]), v[0]
    # force theta positive
    theta += Math.TAU if theta < 0
    return theta

Math.radToDeg = (r) ->
    r / Math.TAU * 360

alongPerimeter = (rect, along) ->
    [[x, y], [width, height]] = rect
    perimeter = 2 * (width + height)
    along = perimeter * along
    if along < width
        [x + along, y]
    else if along < width + height
        [x + width, y + along - width]
    else if along < 2 * width + height
        [x + along - (width + height), y + height]
    else
        [x, y + along - 2 * width - height]

rectIntersect = (rect1, rect2) ->
    (Math.abs(rect1[0][0] + rect1[1][0]/2 - rect2[0][0] - rect2[1][0]/2) * 2 < (rect1[1][0] + rect2[1][0])) and
        (Math.abs(rect1[0][1] + rect1[1][1]/2 - rect2[0][1] - rect2[1][1]/2) * 2 < (rect1[1][1] + rect2[1][1]))

exports.magnitude = magnitude
exports.normalize = normalize
exports.add2d = add2d
exports.sub2d = sub2d
exports.scale = scale
exports.scaleTo = scaleTo
exports.distance = distance
exports.direction = direction
exports.angleOfIncidence = angleOfIncidence
exports.alongPerimeter = alongPerimeter
exports.rectIntersect = rectIntersect
