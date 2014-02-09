util = require './util.coffee'
Entity = require './entity.coffee'

class Engine
    constructor: (@tickFunction) ->
        @entities = {}
        @systems = []

        @lastEntityId = 0

        @running = false
        @lastFrameTime = null

    createEntity: (components) ->
        # there has to be a prettier way to do this
        componentsObject = {}
        componentsObject[util.keyForComponent(c)] = c for c in components

        id = @lastEntityId
        entity = new Entity id, componentsObject, this
        @entities[id] = entity
        system.updateCache entity for system in @systems
        @lastEntityId += 1

        return entity

    updateEntity: (entity) ->
        # This needs to be called or the systems' caches won't be updated
        system.updateCache entity for system in @systems

    addSystem: (system) ->
        @systems.push system
        system.buildCache @entities

    tick: (dt) ->
        system.run @entities, dt for system in @systems
        @tickFunction.call this, dt

    removeDeadEntities: ->
        for id, entity of @entities
            if entity.components.destroy?
                entity.components = null
                system.updateCache entity for system in @systems
                delete @entities[id]

    start: ->
        @running = true
        @lastFrameTime = null
        requestAnimationFrame @gameLoop

    stop: -> 
        @running = false

    reset: ->
        # Not sure if the cancel and rerequest is necessary, otherwise it's
        # sufficient to just reset @entities
        if @rafId?
            cancelAnimationFrame @rafId
        @entities = {}
        system.buildCache() for system in @systems
        @start()

    gameLoop: (paintTime) =>
        if @lastFrameTime == null
            @lastFrameTime = paintTime
        else
            dt = (paintTime - @lastFrameTime) / 1000.0
            @lastFrameTime = paintTime

            @beforeTick?(dt)
            @tick dt
            @removeDeadEntities()
            @afterTick?(dt)

            renderer.ctx.strokeText Object.keys(@entities).length, 400, 100

        @rafId = requestAnimationFrame @gameLoop if @running

module.exports = Engine
