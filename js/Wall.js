// Wall is made up of two points
var Wall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    console.log(this.draw);
};

Wall.prototype.draw = function (ctx) {
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
};

// World object contains many agents and walls and food and stuff
var util_add_box = function (lst, x, y, w, h) {
    lst.push(new Wall(new Vec(x, y), new Vec(x + w, y)));
    lst.push(new Wall(new Vec(x + w, y), new Vec(x + w, y + h)));
    lst.push(new Wall(new Vec(x + w, y + h), new Vec(x, y + h)));
    lst.push(new Wall(new Vec(x, y + h), new Vec(x, y)));
};

