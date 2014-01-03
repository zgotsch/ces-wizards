_ = require 'underscore'
QuadTree = require '../quadtree.coffee'
system = require('../system.coffee')
vecutil = require '../vecutil.coffee'

drawQuadTreeNode = (ctx, node) ->
    drawQuadTreeNode(ctx, n) for n in node.nodes
    rect = node.rect
    ctx.strokeRect rect.x, rect.y, rect.width, rect.height
    ctx.strokeText node.children.length, rect.x + rect.width/2, rect.y + rect.height/2

makeQuadTreeItem = (entity) ->
    {
        x: entity.components.position.pos[0],
        y: entity.components.position.pos[1],
        width: entity.components.collision.boundingBoxSize[0],
        height: entity.components.collision.boundingBoxSize[1]
        id: entity.id
    }

class CollisionSystem extends system.BasicSystem
    constructor: (@canvasSize) ->
        super ['collision', 'position']

        @quadTree = new QuadTree.BoundQuadTree({
            x: 0, y: 0, width: @canvasSize[0], height: @canvasSize[1]
        }, 5, 10)

    action: (entity, dt, entities) ->
            position = entity.components.position
            collision = entity.components.collision

            for item in @quadTree.retrieve({
                x: position.pos[0],
                y: position.pos[1],
                width: collision.boundingBoxSize[0],
                height: collision.boundingBoxSize[1]
            })
                otherEntity = entities[item.id]
                if otherEntity.id != entity.id
                    if vecutil.rectIntersect(
                        [position.pos, collision.boundingBoxSize],
                        [otherEntity.components.position.pos,
                         otherEntity.components.collision.boundingBoxSize]
                    )
                        if collision.shouldCollide entity, otherEntity
                            collision.didCollide entity, otherEntity

    run: (entities, dt) ->
        @quadTree.clear()
        @quadTree.insert makeQuadTreeItem(entities[i]) for i in _.keys(@cache)
        super entities, dt

module.exports = CollisionSystem
module.exports.drawQuadTreeNode = drawQuadTreeNode
