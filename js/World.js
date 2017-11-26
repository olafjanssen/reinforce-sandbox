/**
 * The sandbox World context that controls all objects.
 *
 * @constructor
 */
var World = function () {
    this.agents = [];
    this.W = canvas.width;
    this.H = canvas.height;

    this.clock = 0;

    // set up walls in the world
    this.walls = [];
    util_add_box(this.walls, 0, 0, this.W, this.H);

    // set up food and poison
    this.items = [];
    for (var k = 0; k < 50; k++) {
        var x = randf(20, this.W - 20);
        var y = randf(20, this.H - 20);
        var t = randi(1, 3); // food or poison (1 and 2)
        var it = new Item(x, y, t);
        this.items.push(it);
    }
};

World.prototype = {
    /**
     * Draws the world by calling the draw method of all objects.
     * (Should be called every draw update)
     *
     * @param ctx   The Canvas context
     */
    draw: function (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        var agents = this.agents;

        // draw walls in environment
        for (var i = 0, n = this.walls.length; i < n; i++) {
            var q = this.walls[i];
            q.draw(ctx);
        }

        // draw agents
        for (var i = 0, n = agents.length; i < n; i++) {
            var a = agents[i];
            a.draw(ctx);
        }

        // draw items
        for (var i = 0, n = this.items.length; i < n; i++) {
            var it = this.items[i];
            it.draw(ctx);
        }
    },
    /**
     * Update the World by calling the update method of every object.
     * (Should be called every World update)
     *
     * @param world     The World context
     */
    update: function () {
        // tick the environment
        this.clock++;

        // update all agents
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].update(this);
        }

        // update all items
        for (var i = 0, n = this.items.length; i < n; i++) {
            this.items[i].update(this);
        }

        // agents are given the opportunity to learn based on feedback of their action on environment
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].backward();
        }
    }
};