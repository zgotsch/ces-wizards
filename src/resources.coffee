_ = require 'underscore'

window.imgs = []
Resources = do ->
    resources = {}
    callbacks = []

    ready = ->
        _.all _.values(resources)

    _load = (url) ->
        if resources[url]
            return resources[url]
        else
            img = new Image()
            window.imgs.push img
            img.onload = ->
                resources[url] = img
                if ready()
                    cb() for cb in callbacks
            resources[url] = false
            _.defer(-> img.src = url)

    load = (urlOrArray) ->
        if urlOrArray instanceof Array
            _load url for url in urlOrArray
        else
            _load urlOrArray

    get = (url) -> resources[url]

    onReady = (callback) ->
        callbacks.push callback
        if ready() and ! _.isEmpty resources
            callback()

    {
        load: load,
        get: get,
        onReady: onReady
    }

module.exports = Resources
