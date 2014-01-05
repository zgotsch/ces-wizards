Input = require '../input.coffee'
system = require '../system.coffee'

class SpellcastingSystem extends system.BasicSystem
    constructor: ->
        super ["position", "spellcaster"]

    action: (entity, dt) ->
        if Input.mouse.isDown
            new entity.components.spellcaster.spells[0](entity,
                                                        Input.mouse.posRelativeTo(canvas))

module.exports = SpellcastingSystem
