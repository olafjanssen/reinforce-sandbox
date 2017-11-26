/**
 * An item is an inanimate object that floats around in the world and that Agents can interact with.
 *
 * @param x     horizontal starting position
 * @param y     vertical starting position
 * @param type  type of item (number: wall = 0, 1 = apple, 2 = poison)
 * @constructor
 */
var Item = function (x, y, type) {
    this.p = new Vec(x, y); // position
    this.v = new Vec(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5);
    this.type = type;
    this.rad = 10; // default radius
    this.age = 0;
};

/**
 * Draws the Item on the Canvas.
 * (Should be called every draw update)
 *
 * @param ctx   The Canvas context
 */
Item.prototype.draw = function (ctx) {
    ctx.strokeStyle = "rgb(0,0,0)";
    if (this.type === 1) {
        ctx.fillStyle = "rgb(255, 150, 150)";
    } else {
        ctx.fillStyle = "rgb(150, 255, 150)";
    }
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, this.rad, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
};

/**
 * Update the Item, which means detect collisions, moving it, or removing it or recreating new ones.
 * (Should be called every World update)
 *
 * @param world     The World context
 */
Item.prototype.update = function (world) {
    this.age += 1;

    // see if some agent gets lunch
    for (var j = 0, m = world.agents.length; j < m; j++) {
        var a = world.agents[j];
        var d = a.p.dist_from(this.p);
        if (d < this.rad + a.rad) {

            // ding! nom nom nom
            if (this.type === 1) {
                a.digestion_signal += 1.0; // mmm delicious apple
                a.apples++;
            }
            if (this.type === 2) {
                a.digestion_signal += -1.0; // ewww poison
                a.poison++;
            }

            this.kill(world);
            break;
        }
    }

    // move the items
    this.p.x += this.v.x;
    this.p.y += this.v.y;
    if (this.p.x < 1) {
        this.p.x = 1;
        this.v.x *= -1;
    }
    if (this.p.x > world.W - 1) {
        this.p.x = world.W - 1;
        this.v.x *= -1;
    }
    if (this.p.y < 1) {
        this.p.y = 1;
        this.v.y *= -1;
    }
    if (this.p.y > world.H - 1) {
        this.p.y = world.H - 1;
        this.v.y *= -1;
    }

    if (this.age > 5000 && world.clock % 100 === 0 && randf(0, 1) < 0.1) {
        this.kill(world);
    }
};

/**
 * Called when an Item is killed, it is removed from the world and spawned at a new random place.
 * (This is very specific behavior to this game and should be changed when the world rules change)
 *
 * @param world     The World context
 */
Item.prototype.kill = function (world) {
    // remove original item
    world.items.splice(world.items.indexOf(this), 1);

    // and create a new one
    var newitx = randf(20, world.W - 20);
    var newity = randf(20, world.H - 20);
    var newitt = randi(1, 3); // food or poison (1 and 2)
    var newit = new Item(newitx, newity, newitt);
    world.items.push(newit);
};