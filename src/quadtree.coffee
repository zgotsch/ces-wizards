rectCenter = (rect) ->
    [rect.x + rect.width / 2, rect.y + rect.height / 2]

rectCorners = (rect) ->
    [
        [x, y],
        [x + width, y],
        [x, y + height],
        [x + width, y + height]
    ]

rectIntersect = (rect1, rect2) ->
    (Math.abs(rect1.x + rect1.width/2 - rect2.x - rect2.width/2) * 2 < (rect1.width + rect2.width)) and
        (Math.abs(rect1.y + rect1.height/2 - rect2.y - rect2.height/2) * 2 < (rect1.height + rect2.height))

qTreeUniq = (arr) ->
    seen = {}
    uniques = []

    for x in arr
        if !seen[x._qtreeid]
            uniques.push x
            seen[x._qtreeid] = true
    uniques

class Node
    NE = 0
    NW = 1
    SW = 2
    SE = 3

    constructor: (@rect, @depth, @maxDepth, @maxChildren) ->
        @children = []
        @nodes = []

        @myClass = Node

        @nextId = 0

    _bin: (item) ->
        center = rectCenter @rect

        if item.x < center[0]
            if item.y < center[1]
                NW
            else
                SW
        else
            if item.y < center[1]
                NE
            else
                SE

    insert: (item) ->
        item._qtreeid = @nextId++
        if @nodes.length
            @nodes[@_bin(item)].insert item
        else
            @children.push item

            if @children.length > @maxChildren and @depth < @maxDepth
                @subdivide()

                @insert item for item in @children

                @children.length = 0

    retrieve: (item) ->
        if @nodes.length
            @nodes[@_bin(item)].retrieve item
        else
            @children

    subdivide: ->
        halfWidth = @rect.width / 2
        halfHeight = @rect.height / 2
        [centerX, centerY] = rectCenter @rect

        @nodes[NE] = new @myClass(
            {x: centerX, y: @rect.y, width: halfWidth, height: halfHeight},
            @depth + 1, @maxDepth, @maxChildren)
        @nodes[NW] = new @myClass(
            {x: @rect.x, y: @rect.y, width: halfWidth, height: halfHeight},
            @depth + 1, @maxDepth, @maxChildren)
        @nodes[SW] = new @myClass(
            {x: @rect.x, y: centerY, width: halfWidth, height: halfHeight},
            @depth + 1, @maxDepth, @maxChildren)
        @nodes[SE] = new @myClass(
            {x: centerX, y: centerY, width: halfWidth, height: halfHeight},
            @depth + 1, @maxDepth, @maxChildren)

    clear: ->
        @children.length = 0
        node.clear() for node in @nodes
        @nodes.length = 0


class BoundNode extends Node
    constructor: (rect, depth, maxDepth, maxChildren) ->
        super rect, depth, maxDepth, maxChildren
        @myClass = BoundNode

    insert: (item) ->
        if item._qtreeid == undefined
            item._qtreeid = @nextId++
        if @nodes.length
            for node in @nodes
                if rectIntersect node.rect, item
                    node.insert item
        else
            @children.push item

            if @children.length > @maxChildren and @depth < @maxDepth
                @subdivide()

                @insert item for item in @children

                @children.length = 0

    retrieve: (item) ->
        if @nodes.length
            items = []
            for node in @nodes
                if rectIntersect node.rect, item
                    items.push.apply items, node.retrieve(item)
            qTreeUniq items
        else
            @children


class QuadTree
    constructor: (rect, maxDepth = 10, maxChildren = 10) ->
        @root = new Node rect, 0, maxDepth, maxChildren

    insert: (itemOrArray) ->
        if itemOrArray instanceof Array
            @root.insert item for item in itemOrArray
        else
            @root.insert itemOrArray

    clear: ->
        @root.clear()

    retrieve: (item) ->
        @root.retrieve(item).slice(0)


class BoundQuadTree extends QuadTree
    constructor: (rect, maxDepth = 10, maxChildren = 10) ->
        @root = new BoundNode rect, 0, maxDepth, maxChildren

exports.QuadTree = QuadTree
exports.BoundQuadTree = BoundQuadTree
