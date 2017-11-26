
// Eye sensor has a maximum range and senses walls
var Eye = function (agent, angle) {
    this.angle = angle; // angle relative to agent its on
    this.agent = agent; // an eye always belongs to an agent
    this.max_range = 120;
    this.sensed_proximity = 120; // what the eye is seeing. will be set in world.tick()
    this.sensed_type = -1; // what does the eye see?
    this.vx = 0; // sensed velocity
    this.vy = 0;
};

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

Eye.prototype.update = function (world) {
    // we have a line from p to p->eyep
    var eyep = new Vec(this.agent.p.x + this.max_range * Math.sin(this.agent.angle + this.angle),
        this.agent.p.y + this.max_range * Math.cos(this.agent.angle + this.angle));
    var res = world.stuff_collide_(this.agent.p, eyep, true, true);
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


