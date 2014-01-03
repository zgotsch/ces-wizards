Input = do ->
    keys = {}

    setKey = (event, status) ->
        code = event.keyCode

        key = switch code
            when 32 then "SPACE"
            when 37 then "LEFT"
            when 38 then "UP"
            when 39 then "RIGHT"
            when 40 then "DOWN"
            when 187 then "+"
            when 189 then "-"
            else String.fromCharCode code

        keys[key] = status

    document.addEventListener 'keydown', (e) -> setKey e, true
    document.addEventListener 'keyup', (e) -> setKey e, false
    document.addEventListener 'blur', -> keys = {}

    mouse = {
        pos: [0, 0],
        posRelativeTo: (element) ->
            rect = element.getBoundingClientRect()
            return [@pos[0] - rect.left, @pos[1] - rect.top]
    }

    document.addEventListener 'mousemove', (e) ->
        mouse.pos[0] = e.x
        mouse.pos[1] = e.y

    {
        isDown: (key) -> keys[key.toUpperCase()],
        mouse: mouse
    }

module.exports = Input
