
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
    // helper function to get closest colliding walls/items
    stuff_collide_: function (p1, p2, check_walls, check_items) {
        var minres = false;

        // collide with walls
        if (check_walls) {
            for (var i = 0, n = this.walls.length; i < n; i++) {
                var wall = this.walls[i];
                var res = line_intersect(p1, p2, wall.p1, wall.p2);
                if (res) {
                    res.type = 0; // 0 is wall
                    if (!minres) {
                        minres = res;
                    }
                    else {
                        // check if its closer
                        if (res.ua < minres.ua) {
                            // if yes replace it
                            minres = res;
                        }
                    }
                }
            }
        }

        // collide with items
        if (check_items) {
            for (var i = 0, n = this.items.length; i < n; i++) {
                var it = this.items[i];
                var res = line_point_intersect(p1, p2, it.p, it.rad);
                if (res) {
                    res.type = it.type; // store type of item
                    res.vx = it.v.x; // velocty information
                    res.vy = it.v.y;
                    if (!minres) {
                        minres = res;
                    }
                    else {
                        if (res.ua < minres.ua) {
                            minres = res;
                        }
                    }
                }
            }
        }

        return minres;
    },
    update: function () {
        // tick the environment
        this.clock++;

        // update all agents
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].update(this);
        }

        // tick all items
        for (var i = 0, n = this.items.length; i < n; i++) {
            this.items[i].update(this);
        }

        // agents are given the opportunity to learn based on feedback of their action on environment
        for (var i = 0, n = this.agents.length; i < n; i++) {
            this.agents[i].backward();
        }
    }
};