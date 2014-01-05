_ = require 'underscore'
QuadTree = require '../quadtree.coffee'
system = require('../system.coffee')
vecutil = require '../vecutil.coffee'

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

        @shouldDrawQuadTree = false
        @shouldDrawCollisionBoxes = false
        document.addEventListener 'keypress', (e) =>
            e.key ?= String.fromCharCode e.charCode
            switch e.key
                when "q" then @shouldDrawQuadTree = !@shouldDrawQuadTree
                when "c" then @shouldDrawCollisionBoxes =
                    !@shouldDrawCollisionBoxes

    action: (entity, dt, entities) ->
        position = entity.components.position
        collision = entity.components.collision

        didCollide = false
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
                    didCollide = true
                    if collision.shouldCollide entity, otherEntity
                        collision.didCollide entity, otherEntity

        @drawCollisionBox entity, didCollide if @shouldDrawCollisionBoxes

    run: (entities, dt) ->
        @quadTree.clear()
        @quadTree.insert makeQuadTreeItem(entities[i]) for i in _.keys(@cache)
        super entities, dt
        @drawQuadTree() if @shouldDrawQuadTree

    drawQuadTree: ->
        renderer.drawQuadTreeNode @quadTree.root

    drawCollisionBox: (entity, colliding) ->
        renderer.ctx.save()
        renderer.ctx.setStrokeColor(if colliding then 'red' else 'green')
        renderer.ctx.strokeRect entity.components.position.pos...,
                                entity.components.collision.boundingBoxSize...
        renderer.ctx.restore()

module.exports = CollisionSystem
