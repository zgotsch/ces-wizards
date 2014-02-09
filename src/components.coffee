class Position
    constructor: (@pos = [0, 0]) ->

class StaticSprite
    constructor: (@url = "resources/sun.gif",
                  @pos = [0, 0],
                  @size = [128, 128]) ->

class AnimatedSprite
    constructor: (@url = "resources/sun.gif",
                  @pos = [0, 0],
                  @size = [128, 128],
                  @speed = 1
                  @dir = 'vertical',
                  @once = false,
                  @frameIndices = [0]) ->
        @index = 0

class ColorBox
    constructor: (@size = [50, 50], @color = 'red') ->

class Velocity
    constructor: (@vector = [0, 0]) ->

class PlayerControl
    constructor: (@playerSpeed=100) ->

class Turnable
    constructor: (@sprites) ->

class CreatedAt
    constructor: () ->
        @createdAt = Date.now()

class StopsAfter
    constructor: (@time = 1000) ->

class Lifetime
    constructor: (@lifetime = 10) ->

class Player
class Enemy

class MoveTowardPlayer
    constructor: (@speed = 10) ->

class Collision
    constructor: (@shouldCollide = (-> true), @didCollide = (->), @boundingBoxSize = [50, 50]) ->

class Spellcaster
    constructor: (@spells) ->
        @active = 0

class Health
    constructor: (@hp, @maxHp) ->

exports.Position = Position
exports.StaticSprite = StaticSprite
exports.AnimatedSprite = AnimatedSprite
exports.ColorBox = ColorBox
exports.Velocity = Velocity
exports.PlayerControl = PlayerControl
exports.Turnable = Turnable
exports.CreatedAt = CreatedAt
exports.StopsAfter = StopsAfter
exports.Lifetime = Lifetime
exports.Player = Player
exports.MoveTowardPlayer = MoveTowardPlayer
exports.Collision = Collision
exports.Spellcaster = Spellcaster
exports.Enemy = Enemy
exports.Health = Health
