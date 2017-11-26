/**
 * An agent is an object in the world that has a neural network as a brain and eyes as input.
 *
 * @constructor
 */
var Agent = function () {

    // positional information
    this.p = new Vec(300, 300);
    this.v = new Vec(0, 0);
    this.op = this.p; // old position
    this.angle = 0; // direction facing

    this.actions = [];
    //this.actions.push([0,0]);
    this.actions.push(0);
    this.actions.push(1);
    this.actions.push(2);
    this.actions.push(3);

    // properties
    this.rad = 10;
    this.eyes = [];
    for (var k = 0; k < 30; k++) {
        this.eyes.push(new Eye(this, k * 0.21));
    }

    this.brain = null; // set from outside

    this.reward_bonus = 0.0;
    this.digestion_signal = 0.0;

    this.apples = 0;
    this.poison = 0;

    // outputs on world
    this.action = 0;

    this.prevactionix = -1;
    this.num_states = this.eyes.length * 5 + 2;
};

Agent.prototype = {
    /**
     * Returns the number of states, i.e. the number of input nodes of the neural network.
     *
     * @returns {number|*}
     */
    getNumStates: function () {
        return this.num_states;
    },

    /**
     * Returns the number of actions, i.e. the number of output nodes of the neural network.
     *
     * @returns {number}
     */
    getMaxNumActions: function () {
        return this.actions.length;
    },

    /**
     * Draw the agent in the Canvas context.
     *
     * @param ctx   the Canvas context
     */
    draw: function (ctx) {
        ctx.fillStyle = "rgb(" + 0 + ", 150, 150)";
        ctx.strokeStyle = "rgb(0,0,0)";

        // draw agents body
        ctx.beginPath();
        ctx.arc(this.op.x, this.op.y, this.rad, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();

        // draw agents sight
        for (var ei = 0, ne = this.eyes.length; ei < ne; ei++) {
            var e = this.eyes[ei];
            e.draw(ctx);
        }
    },

    /**
     * Update the Agent in the given World context.
     *
     * This means updating the input nodes of the neural network, activating the network and turn the output of
     * the network into action (moving the Agent).
     *
     * @param world     The World context
     */
    update: function (world) {
        for (var ei = 0, ne = this.eyes.length; ei < ne; ei++) {
            var e = this.eyes[ei];
            e.update(world);
        }

        // activate the neural network
        this.forward();

        this.op = this.p; // back up old position
        this.oangle = this.angle; // and angle

        // execute agent's desired action
        var speed = 1;
        if (this.action === 0) {
            this.v.x += -speed;
        }
        if (this.action === 1) {
            this.v.x += speed;
        }
        if (this.action === 2) {
            this.v.y += -speed;
        }
        if (this.action === 3) {
            this.v.y += speed;
        }

        // forward the agent by velocity
        this.v.x *= 0.95;
        this.v.y *= 0.95;
        this.p.x += this.v.x;
        this.p.y += this.v.y;

        // handle boundary conditions.. bounce agent
        if (this.p.x < 1) {
            this.p.x = 1;
            this.v.x = 0;
            this.v.y = 0;
        }
        if (this.p.x > world.W - 1) {
            this.p.x = world.W - 1;
            this.v.x = 0;
            this.v.y = 0;
        }
        if (this.p.y < 1) {
            this.p.y = 1;
            this.v.x = 0;
            this.v.y = 0;
        }
        if (this.p.y > world.H - 1) {
            this.p.y = world.H - 1;
            this.v.x = 0;
            this.v.y = 0;
        }

        // reset digestion reward
        this.digestion_signal = 0; // important - reset this!
    },

    /**
     * Called to compute the neural network in a forward direction and capturing the output.
     */
    forward: function () {
        // in forward pass the agent simply behaves in the environment
        // create input to brain
        var num_eyes = this.eyes.length;
        var ne = num_eyes * 5;
        var input_array = new Array(this.num_states);
        for (var i = 0; i < num_eyes; i++) {
            var e = this.eyes[i];
            input_array[i * 5] = 1.0;
            input_array[i * 5 + 1] = 1.0;
            input_array[i * 5 + 2] = 1.0;
            input_array[i * 5 + 3] = e.vx; // velocity information of the sensed target
            input_array[i * 5 + 4] = e.vy;
            if (e.sensed_type !== -1) {
                // sensed_type is 0 for wall, 1 for food and 2 for poison.
                // lets do a 1-of-k encoding into the input array
                input_array[i * 5 + e.sensed_type] = e.sensed_proximity / e.max_range; // normalize to [0,1]
            }
        }
        // proprioception and orientation
        input_array[ne + 0] = this.v.x;
        input_array[ne + 1] = this.v.y;

        this.action = this.brain.act(input_array);
    },

    /**
     * Let the network learn from an activation signal, the learning phase.
     */
    backward: function () {
        var reward = this.digestion_signal;
        this.last_reward = reward; // for vis
        this.brain.learn(reward);
    }
};