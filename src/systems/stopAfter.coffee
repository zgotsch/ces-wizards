system = require '../system.coffee'

class StopAfterSystem extends system.BasicSystem
    constructor: ->
        super ["velocity", "createdat", "stopsafter"]

    action: (entity, dt) ->
        if Date.now() - entity.components.createdat.createdAt > entity.components.stopsafter.time
            entity.destroy()
            entity.components.velocity.vector[0] = 0
            entity.components.velocity.vector[1] = 0

module.exports = StopAfterSystem
