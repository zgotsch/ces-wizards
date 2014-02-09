_ = require 'underscore'
Resources = require './resources.coffee'
system = require './system.coffee'
util = require './util.coffee'
vecutil = require './vecutil.coffee'

class Renderer
    constructor: (canvas) ->
        @canvas = canvas
        @ctx = canvas.getContext '2d'

        class StaticRenderingSystem extends system.BasicSystem
            constructor: (@ctx) ->
                super ['position', 'staticsprite']

            action: (entity, dt) ->
                position = entity.components.position
                staticSprite = entity.components.staticsprite

                @ctx.drawImage Resources.get(staticSprite.url),
                                staticSprite.pos[0], staticSprite.pos[1],
                                staticSprite.size[0], staticSprite.size[1],
                                position.pos[0], position.pos[1],
                                staticSprite.size[0], staticSprite.size[1]


        class AnimatedRenderingSystem extends system.BasicSystem
            constructor: (@ctx) ->
                super ['position', 'animatedsprite']

            action: (entity, dt) ->
                position = entity.components.position
                animatedSprite = entity.components.animatedsprite

                if animatedSprite.speed > 0
                    idx = Math.floor(
                        animatedSprite.index += animatedSprite.speed * dt)
                    max = animatedSprite.frameIndices.length
                    frameIndex = animatedSprite.frameIndices[idx % max]

                    if animatedSprite.once and idx > max
                        animatedSprite.done = true
                        # Don't draw
                        return
                else
                    frameIndex = 0

                spritePosition = animatedSprite.pos.slice()
                xySwitch = if animatedSprite.dir == 'vertical' then 1 else 0
                spritePosition[xySwitch] +=
                    frameIndex * animatedSprite.size[xySwitch]

                @ctx.drawImage Resources.get(animatedSprite.url),
                    spritePosition[0], spritePosition[1],
                    animatedSprite.size[0], animatedSprite.size[1],
                    position.pos[0], position.pos[1]
                    animatedSprite.size[0], animatedSprite.size[1]


        class ColorBoxRenderingSystem extends system.BasicSystem
            constructor: (@ctx) ->
                super ['position', 'colorbox']

            action: (entity) ->
                position = entity.components.position
                colorbox = entity.components.colorbox

                @ctx.save()
                @ctx.setFillColor(colorbox.color)
                @ctx.fillRect(position.pos[0], position.pos[1],
                              colorbox.size[0], colorbox.size[1])
                @ctx.restore()

        class UIRenderingSystem extends system.BasicSystem
            constructor: (@ctx, @canvasSize) ->
                super ['player', 'health', 'spellcaster']

            action: (entity) ->
                health = entity.components.health
                maxWidth = 200
                height = 20

                @ctx.save()
                @ctx.setFillColor "red"
                @ctx.fillRect 0, 0, maxWidth * health.hp / health.maxHp, height

                # draw spell icons
                spellcaster = entity.components.spellcaster

                spellIconSize = [50, 50]
                spellIconY = @canvasSize[1] - spellIconSize[1]
                for spell, i in spellcaster.spells
                    topLeft = [i * spellIconSize[0], spellIconY]
                    @ctx.drawImage Resources.get('resources/fireball.jpeg'),
                        topLeft...,
                        spellIconSize...
                    # draw clock
                    if !spell.canCast()
                        centerTop = vecutil.add2d topLeft, [spellIconSize[0]/2, 0]
                        center = vecutil.add2d topLeft, [spellIconSize[0]/2
                                                         spellIconSize[1]/2]
                        corners = vecutil.rectCorners topLeft, spellIconSize...
                        corners = util.rotateArray corners, -1
                        completion = spell.timer / spell.castDelay
                        theta = Math.TAU * completion - Math.TAU/8
                        cornersIndex = Math.floor((theta) / (Math.TAU / 4)) + 1
                        #correct completion to be from upper left
                        completion = (completion + 1/8) % 1.0
                        intersectPoint = vecutil.alongPerimeter(
                            [topLeft, spellIconSize], completion)

                        vecutil.polygon(@ctx, centerTop, center, intersectPoint,
                                        corners.slice(cornersIndex)...)
                        @ctx.setFillColor(0, 0, 0, .5)
                        @ctx.fill()

                # highlight active
                @ctx.setLineWidth 2
                @ctx.setStrokeColor 'white'
                @ctx.strokeRect spellcaster.active * spellIconSize[0],
                               spellIconY,
                               spellIconSize...

                @ctx.restore()


        @system = new system.CompsiteSystem(
            new StaticRenderingSystem(@ctx),
            new AnimatedRenderingSystem(@ctx),
            new ColorBoxRenderingSystem(@ctx),
            new UIRenderingSystem(@ctx, [canvas.width, canvas.height])
        )

        @clearCanvas = (dt) =>
            @ctx.fillStyle = "lightgrey"
            @ctx.fillRect 0, 0, @canvas.width, @canvas.height

        @drawFramerate = (dt) =>
            @updateAndDrawFramerate dt if @showFramerate

        @framerates = []
        @showFramerate = true

    toggleFramerate: ->
        @showFramerate = !@showFramerate

    updateAndDrawFramerate: (dt) ->
        drawFramerate = =>
            @ctx.save()
            @ctx.fillStyle = "black"
            @ctx.font = "30px sans-serif"
            @ctx.fillText util.average(@framerates).toFixed(1), 50, 50
            @ctx.restore()
        @framerates.push(1/dt)
        while @framerates.length > 10
            @framerates.shift()
        drawFramerate()

    drawQuadTreeNode: (node) ->
        @drawQuadTreeNode n for n in node.nodes
        rect = node.rect
        @ctx.strokeRect rect.x, rect.y, rect.width, rect.height
        @ctx.strokeText node.children.length, rect.x + rect.width/2, rect.y + rect.height/2

module.exports = Renderer
