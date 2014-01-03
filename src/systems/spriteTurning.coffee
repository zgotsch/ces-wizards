_ = require 'underscore'
Input = require '../input.coffee'
system = require '../system.coffee'
vecutil = require '../vecutil.coffee'

center = (components) ->
    vecutil.add2d(
        components.position.pos,
        vecutil.scale((
            if _.has components, 'staticsprite'
                components.staticsprite.size
            else if _.has components, 'animatedsprite'
                components.animatedsprite.size
            else
                components.colorbox.size), 0.5))

class SpriteTurningSystem extends system.System
    satisfies: (components) ->
        _.has(components, 'turnable') and
        _.has(components, 'position') and
            (_.has(components, 'staticsprite') or
             _.has(components, 'animatedsprite') or
             _.has(components, 'colorbox'))

    action: (entity, dt) ->
        vector = vecutil.sub2d(Input.mouse.posRelativeTo(canvas), center(entity.components))
        theta = vecutil.angleOfIncidence vector
        theta += (Math.TAU / 16) % Math.TAU # offset

        index = Math.floor(theta / (Math.TAU / 8))

        sprite = entity.components.turnable.sprites[index]

        if sprite?
            if _.has entity.components, "staticsprite"
                components.staticsprite = sprite
            else if _.has entity.components, "animatedsprite"
                entity.components.animatedsprite = sprite
            else
                entity.components.colorbox = sprite

module.exports = SpriteTurningSystem
