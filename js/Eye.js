/**
 * Eye sensor that detects objects and is attached to an Agent.
 *
 * @param agent     The parent Agent
 * @param angle     The angle of the sensor relative to the Agent.
 * @constructor
 */
var Eye = function (agent, angle) {
    this.angle = angle; // angle relative to agent its on
    this.agent = agent; // an eye always belongs to an agent
    this.max_range = 120;
    this.sensed_proximity = 120; // how far the eye is seeing
    this.sensed_type = -1; // what does the eye see?
    this.vx = 0; // sensed velocity of the detected object
    this.vy = 0;
};

/**
 * Draws the Eye on the Canvas.
 * (Should be called every draw update)
 *
 * @param ctx   The Canvas context
 */
Eye.prototype.draw = function (ctx) {
    var sr = this.sensed_proximity;
    if (this.sensed_type === -1 || this.sensed_type === 0) {
        ctx.strokeStyle = "rgb(200,200,200)"; // wall or nothing
    }
    if (this.sensed_type === 1) {
        ctx.strokeStyle = "rgb(255,150,150)";
    } // apples
    if (this.sensed_type === 2) {
        ctx.strokeStyle = "rgb(150,255,150)";
    } // poison
    ctx.beginPath();
    ctx.moveTo(this.agent.op.x, this.agent.op.y);
    ctx.lineTo(this.agent.op.x + sr * Math.sin(this.agent.oangle + this.angle),
        this.agent.op.y + sr * Math.cos(this.agent.oangle + this.angle));
    ctx.stroke();
};

/**
 * Update the Eye, which means detect collisions and internally store the sensed information.
 * (Should be called every World update)
 *
 * @param world     The World context
 */
Eye.prototype.update = function (world) {
    // we have a line from p to p->eyep
    var eyep = new Vec(this.agent.p.x + this.max_range * Math.sin(this.agent.angle + this.angle),
        this.agent.p.y + this.max_range * Math.cos(this.agent.angle + this.angle));
    var res = this.stuff_collide_(world, this.agent.p, eyep, true, true);
    if (res) {
        // eye collided with wall
        this.sensed_proximity = res.up.dist_from(this.agent.p);
        this.sensed_type = res.type;
        if ('vx' in res) {
            this.vx = res.vx;
            this.vy = res.vy;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    } else {
        this.sensed_proximity = this.max_range;
        this.sensed_type = -1;
        this.vx = 0;
        this.vy = 0;
    }
};

/**
 * Detects the closest object colliding with Eye
 * @param world     the World context
 * @param p1        the first point in the Eye sight
 * @param p2        the second point in the Eye sight
 * @param check_walls   whether to test for hitting a wall
 * @param check_items   whether to test for hitting an item
 * @returns {*}   returns false if not colliding, or a minres object if colliding
 * @private
 */
Eye.prototype.stuff_collide_ = function (world, p1, p2, check_walls, check_items) {
    var minres = false;

    // collide with walls
    if (check_walls) {
        for (var i = 0, n = world.walls.length; i < n; i++) {
            var wall = world.walls[i];
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
        for (var i = 0, n = world.items.length; i < n; i++) {
            var it = world.items[i];
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
}
