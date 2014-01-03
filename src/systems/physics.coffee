system = require '../system.coffee'

class PhysicsSystem extends system.BasicSystem
    constructor: ->
        super ["position", "velocity"]

    action: (entity, dt) ->
        position = entity.components.position
        velocity = entity.components.velocity

        position.pos[0] += velocity.vector[0] * dt
        position.pos[1] += velocity.vector[1] * dt

module.exports = PhysicsSystem
