Input = require '../input.coffee'
system = require '../system.coffee'

class PlayerControlSystem extends system.BasicSystem
    constructor: ->
        super ["playercontrol", "velocity"]

    action: (entity, dt) ->
        velocity = entity.components.velocity
        playerSpeed = entity.components.playercontrol.playerSpeed

        if Input.isDown('LEFT') || Input.isDown('a')
            velocity.vector[0] = -playerSpeed
        else if Input.isDown('RIGHT') || Input.isDown('d')
            velocity.vector[0] = playerSpeed
        else
            velocity.vector[0] = 0

        if Input.isDown('UP') || Input.isDown('w')
            velocity.vector[1] = -playerSpeed
        else if Input.isDown('DOWN') || Input.isDown('s')
            velocity.vector[1] = playerSpeed
        else
            velocity.vector[1] = 0

module.exports = PlayerControlSystem
