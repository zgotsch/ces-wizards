_ = require 'underscore'
util = require './util.coffee'

class Entity
    constructor: (@id, @components, @engine) ->

    addComponent: (component) ->
        if @components
            componentObject = {}
            componentObject[util.keyForComponent(component)] = component
            _.extend @components, componentObject
            @engine.updateEntity this

    removeComponent: (componentName) ->
        if @components
            if _.has @components, componentName
                delete @components[componentName]
                @engine.updateEntity this

    destroy: ->
        @components.destroy = true

    toJSON: ->
        {id: @id, components: @components}


module.exports = Entity
