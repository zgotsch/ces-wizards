_ = require 'underscore'

class System
    constructor: ->
        @cache = {}

    buildCache: (entities) ->
        @clearCache()
        @updateCache entity for id, entity of entities

    clearCache: ->
        @cache = {}

    updateCache: (entity) ->
        # if components is falsey, we need to delete the entity
        if !entity.components or !@satisfies entity.components
            if _.has @cache, entity.id
                delete @cache[entity.id]
        else
            @cache[entity.id] = true

    run: (entities, dt) ->
        @action entities[id], dt, entities for id in _.keys(@cache)

    action: (entity, dt, entities)->

    satisfies: -> false


class BasicSystem extends System
    constructor: (@requiredComponents) ->
        super()

    satisfies: (components) ->
        _.every @requiredComponents, (required) -> _.has components, required


class CompsiteSystem extends System
    constructor: (@systems...) ->

    buildCache: (entities) ->
        system.buildCache entities for system in @systems

    updateCache: (entity) ->
        system.updateCache entity for system in @systems

    run: (entities, dt) ->
        system.run entities, dt for system in @systems

    action: (entity, dt, entities) ->
        system.action entity, dt, entities for system in @systems

exports.BasicSystem = BasicSystem
exports.System = System
exports.CompsiteSystem = CompsiteSystem
