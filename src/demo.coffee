_ = require 'underscore'
Engine = require './engine.coffee'
Renderer = require './renderer.coffee'
Resources = require './resources.coffee'
components = require './components.coffee'
vecutil = require './vecutil.coffee'

PlayerControlSystem = require './systems/playerControl.coffee'
SpriteTurningSystem = require './systems/spriteTurning.coffee'
StopAfterSystem = require './systems/stopAfter.coffee'
PhysicsSystem = require './systems/physics.coffee'
LifetimeSystem = require './systems/lifetime.coffee'
MoveTowardPlayerSystem = require './systems/moveTowardPlayer.coffee'
CollisionSystem = require './systems/collision.coffee'
SpellcastingSystem = require './systems/spellcasting.coffee'

createEnemy = (position) ->
    enemyShouldCollide = (me, them) ->
        _.has them.components, 'player'

    enemyDidCollide = _.throttle (me, them) ->
        me.components.colorbox.color = 'green'
        if _.has them.components, 'health'
            them.components.health.hp -= 1
    , 100, {trailing: false}

    engine.createEntity [
        new components.Position(position),
        new components.ColorBox([50, 50], 'magenta'),
        new components.Velocity(),
        new components.MoveTowardPlayer(10),
        new components.Collision(enemyShouldCollide, enemyDidCollide),
        new components.Enemy()
    ]

engineTick = (dt) ->
    if Math.random() < dt and Math.random() < 0.5
        pos = vecutil.alongPerimeter [[0, 0], vecutil.sub2d([canvas.width, canvas.height], [20, 20])], Math.random()
        createEnemy pos

createEngine = (canvas) ->
    window.canvas = canvas #deleteme
    engine = new Engine engineTick
    window.renderer = new Renderer canvas

    engine.addSystem renderer.system

    engine.beforeTick = renderer.clearCanvas
    engine.afterTick = renderer.drawFramerate

    window.collisionSystem = new CollisionSystem([canvas.width, canvas.height])
    engine.addSystem(collisionSystem)
    engine.addSystem(new PhysicsSystem())
    engine.addSystem(new PlayerControlSystem())
    engine.addSystem(new SpriteTurningSystem())
    engine.addSystem(new StopAfterSystem())
    engine.addSystem(new LifetimeSystem())
    engine.addSystem(new MoveTowardPlayerSystem())
    engine.addSystem(new SpellcastingSystem())

    Resources.onReady ->
        engine.start()

        # engine.createEntity [
        #     new components.Position([200, 200]),
        #     new components.StaticSprite()
        # ]

        # engine.createEntity [
        #     new components.Position([200, 200]),
        #     new components.AnimatedSprite('resources/dragonsprites.gif',
        #         [0, 0], [75, 70], 10, 'horiz', false,
        #         [0, 1, 2, 3, 4, 5, 6, 7, 8]),
        #     new components.Turnable([
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 0 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 7 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 6 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 5 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 4 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 3 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 2 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8],
        #         new components.AnimatedSprite 'resources/dragonsprites.gif',
        #             [0, 1 * 70], [75, 70], 10, 'horiz', false,
        #             [0, 1, 2, 3, 4, 5, 6, 7, 8]]),
        #     new components.PlayerControl(),
        #     new components.Velocity(),
        #     new components.Lifetime(10)
        # ]
        
        class Spell
            constructor: (@iconUrl, @castDelay) ->
                @timer = @castDelay

            update: (dt) ->
                @timer += dt

            canCast: ->
                @timer >= @castDelay

            didCast: ->
                @timer = 0


        class Fireball extends Spell
            constructor: ->
                super 'resources/fireball.jpeg', 10

            cast: (caster, target) =>
                if !@canCast()
                    return

                speed = 300
                vector = vecutil.sub2d target, caster.components.position.pos
                vector = vecutil.scaleTo vector, speed

                shouldCollide = (me, them) ->
                    _.has them.components, 'enemy'

                didCollide = (me, them) ->
                    me.destroy()
                    them.destroy()

                engine.createEntity [
                    new components.Position(caster.components.position.pos.slice(0)),
                    new components.ColorBox([20, 20], 'red'),
                    new components.Velocity(vector),
                    new components.Collision(shouldCollide, didCollide, [20, 20]),
                    new components.Lifetime(5)
                ]
                @didCast()

        player = engine.createEntity [
            new components.Position([canvas.width / 2, canvas.height / 2]),
            new components.ColorBox([50, 50], 'blue'),
            new components.Velocity(),
            new components.PlayerControl(),
            new components.Player(),
            new components.Health(25, 25),
            new components.Collision(),
            new components.Spellcaster([new Fireball()])
        ]

    Resources.load ['resources/sun.gif', 'resources/dragonsprites.gif',
                    'resources/fireball.jpeg']

    return engine

window.createEngine = createEngine
