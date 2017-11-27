var WaterWorld = (function () {
    var world; // global world object
    var canvas, ctx;
    var simSpeed = 2;

    var humanControls = false;
    var humanAction = -1;
    var current_interval_id;
    var skipDraw = false;
    var lastKey = null;

    // Statistics variables
    var smooth_reward_history = []; // [][];
    var smooth_reward = [];
    var flott = 0;
    var nflot = 100;

    /**
     * Create the World and start the simulation.
     */
    function start() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        eval($("#agentspec").val());

        // Creates a new World context with agents.
        world = new World();
        world.agents = [];
        for (var k = 0; k < 1; k++) {
            var a = new Agent();
            env = a;
            a.brain = new RL.DQNAgent(env, spec); // give agent a TD brain
            world.agents.push(a);
            smooth_reward_history.push([]);
        }


        // update interface with slider (only updates first Agent)
        var slider = $("#slider");
        slider.slider({
            min: 0,
            max: 1,
            value: world.agents[0].brain.epsilon,
            step: 0.01,
            slide: function (event, ui) {
                world.agents[0].brain.epsilon = ui.value;
                $("#eps").html(ui.value.toFixed(2));
            }
        });
        $("#eps").html(world.agents[0].brain.epsilon.toFixed(2));
        slider.slider('value', world.agents[0].brain.epsilon);

        initFlot();

        // start simulation at normal speed
        gonormal();
    }

    /**
     * Update the World
     */
    function update() {
        // when speed is very fast, update the simulation 50 times, before drawing it
        if (simSpeed === 3) {
            for (var k = 0; k < 50; k++) {
                world.update();
            }
        } else {
            world.update();
        }

        // draw the World
        world.draw(ctx);

        updateStats();
        updateFlot();

        // Show errors if they occur
        var agent = world.agents[0];
        if (typeof agent.expi !== 'undefined') {
            $("#expi").html(agent.expi);
        }
        if (typeof agent.tderror !== 'undefined') {
            $("#tde").html(agent.tderror.toFixed(3));
        }
    }

    /////// INTERFACE FUNCTIONS

    function goveryfast() {
        window.clearInterval(current_interval_id);
        current_interval_id = setInterval(update, 0);
        skipDraw = true;
        simSpeed = 3;
    }

    function gofast() {
        window.clearInterval(current_interval_id);
        current_interval_id = setInterval(update, 0);
        skipDraw = true;
        simSpeed = 2;
    }

    function gonormal() {
        window.clearInterval(current_interval_id);
        current_interval_id = setInterval(update, 30);
        skipDraw = false;
        simSpeed = 1;
    }

    function goslow() {
        window.clearInterval(current_interval_id);
        current_interval_id = setInterval(update, 200);
        skipDraw = false;
        simSpeed = 0;
    }

    function saveAgent() {
        var brain = world.agents[0].brain;
        $("#mysterybox").val(JSON.stringify(brain.toJSON()));
    }

    function resetAgent() {
        eval($("#agentspec").val());
        world.agents[0].brain = new RL.DQNAgent(env, spec);
    }

    function loadAgent() {
        $.getJSON("trained-agents/wateragent.json", function (data) {
            var agent = world.agents[0].brain;
            agent.fromJSON(data); // corss your fingers...
            // set epsilon to be much lower for more optimal behavior
            agent.epsilon = 0.05;
            $("#slider").slider('value', agent.epsilon);
            $("#eps").html(agent.epsilon.toFixed(2));
            // kill learning rate to not learn
            agent.alpha = 0;
        });
    }

    function toggleAgentView() {
        world.agentView = !world.agentView;
    }

    document.onkeydown = function (e) {
        var event = window.event ? window.event : e;
        lastKey = event.keyCode;
        if (lastKey === 37 || lastKey === 38 || lastKey === 39 || lastKey === 40) {
            enableHuman();
            e.preventDefault();
            if (lastKey === 37) {
                humanAction = 0;
            }
            if (lastKey === 39) {
                humanAction = 1;
            }
            if (lastKey === 38) {
                humanAction = 2;
            }
            if (lastKey === 40) {
                humanAction = 3;
            }
        }
    };

    function enableHuman() {
        if (!humanControls) {
            humanControls = true;
            var a = new Agent();
            a.forward = function () {
                this.action = humanAction;
                humanAction = -1;
            };
            a.brain = {
                learn: function (reward) {
                    // Do nothing;
                }
            };
            world.agents.push(a);
            smooth_reward_history.push([]);
        }
    }

    ////// STATS FUNCTIONS

    function initFlot() {
        var container = $("#flotreward");
        var res = getFlotRewards(0);
        var res1 = getFlotRewards(1);
        series = [{
            data: res,
            lines: {fill: true}
        }, {
            data: res1,
            lines: {fill: true}
        }];
        var plot = $.plot(container, series, {
            grid: {
                borderWidth: 1,
                minBorderMargin: 20,
                labelMargin: 10,
                backgroundColor: {
                    colors: ["#FFF", "#e4f4f4"]
                },
                margin: {
                    top: 10,
                    bottom: 10,
                    left: 10
                }
            },
            xaxis: {
                min: 0,
                max: nflot
            },
            yaxis: {
                min: -0.1,
                max: 0.1
            }
        });
        setInterval(function () {
            for (var i = 0; i < world.agents.length; i++) {
                series[i].data = getFlotRewards(i);
            }
            plot.setData(series);
            plot.draw();
        }, 100);
    }

    function getFlotRewards(agentId) {
        // zip rewards into flot data
        var res = [];
        if (agentId >= world.agents.length || !smooth_reward_history[agentId]) {
            return res;
        }
        for (var i = 0, n = smooth_reward_history[agentId].length; i < n; i++) {
            res.push([i, smooth_reward_history[agentId][i]]);
        }
        return res;
    }

    function updateStats() {
        var stats = "<ul>";
        for (var i = 0; i < world.agents.length; i++) {
            stats += "<li>Player " + (i + 1) + ": " + world.agents[i].apples + " apples, " + world.agents[i].poison + " poison</li>";
        }
        stats += "</ul>";
        $("#apples_and_poison").html(stats);
    }

    function updateFlot() {
        flott += 1;
        for (i = 0; i < world.agents.length; i++) {
            var rew = world.agents[i].last_reward;
            if (!smooth_reward[i]) {
                smooth_reward[i] = 0;
            }
            smooth_reward[i] = smooth_reward[i] * 0.999 + rew * 0.001;
            if (flott === 50) {
                // record smooth reward
                if (smooth_reward_history[i].length >= nflot) {
                    smooth_reward_history[i] = smooth_reward_history[i].slice(1);
                }
                smooth_reward_history[i].push(smooth_reward[i]);
            }
        }
        if (flott === 50) {
            flott = 0;
        }
    }

    return {
        start: start,

        goFast: gofast,
        goVeryFast: goveryfast,
        goNormal: gonormal,
        goSlow: goslow,
        saveAgent: saveAgent,
        resetAgent: resetAgent,
        loadAgent: loadAgent,
        toggleAgentView: toggleAgentView,
        enableHuman: enableHuman
    }

})();