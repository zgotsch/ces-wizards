_ = require 'underscore'

Resources = require './resources.coffee'
Renderer = require './renderer.coffee'

Engine = require './engine.coffee'
Renderer = require './renderer.coffee'

loadResources = ->
    Resources.load 'resources/sun.gif'

createEngine = (canvas) ->
    engine = new Engine()
    renderer = new Renderer canvas

    engine.addSystem renderer.system
    engine.beforeTick = renderer.clearCanvas
    engine.afterTick = renderer.drawFramerate

    Resources.onReady ->
        engine.start()

    loadResources()

    return engine

window.createEngine = createEngine
