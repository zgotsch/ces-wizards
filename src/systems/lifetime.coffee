system = require '../system.coffee'

class LifetimeSystem extends system.BasicSystem
    constructor: ->
        super ["lifetime"]

    action: (entity, dt) ->
        entity.components.lifetime.lifetime -= dt
        if entity.components.lifetime.lifetime <= 0
            entity.destroy = true

module.exports = LifetimeSystem
