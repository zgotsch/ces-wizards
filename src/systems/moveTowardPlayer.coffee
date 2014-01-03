_ = require 'underscore'
system = require('../system.coffee')
vecutil = require '../vecutil.coffee'

class MoveTowardPlayerSystem extends system.BasicSystem
    constructor: ->
        super ['velocity', 'position', 'movetowardplayer']
        @player = null

    action: (entity, dt) ->
        if @player
            direction = vecutil.direction(@player.components.position.pos,
                                          entity.components.position.pos)
            entity.components.velocity.vector = (
                vecutil.scale direction, entity.components.movetowardplayer.speed)

    updateCache: (entity) ->
        super entity
        if entity.components == null
            if @player?.id == entity.id
                @player = null
        else
            if _.has entity.components, 'player'
                @player = entity

module.exports = MoveTowardPlayerSystem
