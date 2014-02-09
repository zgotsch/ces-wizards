Input = require '../input.coffee'
system = require '../system.coffee'

class SpellcastingSystem extends system.BasicSystem
    constructor: ->
        super ["position", "spellcaster"]

    action: (entity, dt) ->
        spell.update dt for spell in entity.components.spellcaster.spells
        if Input.mouse.isDown
            new entity.components.spellcaster.spells[0].cast(
                entity, Input.mouse.posRelativeTo(canvas))

module.exports = SpellcastingSystem
