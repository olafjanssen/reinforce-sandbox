/**
 * A Wall object that acts as a boundary to the World objects.
 *
 * @param p1    a Vec 2d point as wall start
 * @param p2    a Vec 2d point as wall end
 * @constructor
 */
var Wall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
};

/**
 * Draws the Wall on the Canvas.
 * (Should be called every draw update)
 *
 * @param ctx   The Canvas context
 */
Wall.prototype.draw = function (ctx) {
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
};

/**
 * Utility function to create a rectangular box of walls.
 *
 * @param lst   list to add the walls to
 * @param x     left boundary of the wall
 * @param y     bottom boundary of the wall
 * @param w     width of the wall
 * @param h     height of the wall
 */
var util_add_box = function (lst, x, y, w, h) {
    lst.push(new Wall(new Vec(x, y), new Vec(x + w, y)));
    lst.push(new Wall(new Vec(x + w, y), new Vec(x + w, y + h)));
    lst.push(new Wall(new Vec(x + w, y + h), new Vec(x, y + h)));
    lst.push(new Wall(new Vec(x, y + h), new Vec(x, y)));
};

