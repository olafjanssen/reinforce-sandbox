// A 2D vector utility
var Vec = function (x, y) {
    this.x = x;
    this.y = y;
};

Vec.prototype = {

    // utilities
    dist_from: function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    },
    length: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    },

    // new vector returning operations
    add: function (v) {
        return new Vec(this.x + v.x, this.y + v.y);
    },
    sub: function (v) {
        return new Vec(this.x - v.x, this.y - v.y);
    },
    rotate: function (a) {  // CLOCKWISE
        return new Vec(this.x * Math.cos(a) + this.y * Math.sin(a),
            -this.x * Math.sin(a) + this.y * Math.cos(a));
    },

    // in place operations
    scale: function (s) {
        this.x *= s;
        this.y *= s;
    },
    normalize: function () {
        var d = this.length();
        this.scale(1.0 / d);
    }
};

// line intersection helper function: does line segment (p1,p2) intersect segment (p3,p4) ?
var line_intersect = function (p1, p2, p3, p4) {
    var denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0.0) {
        return false;
    } // parallel lines
    var ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    var ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
    if (ua > 0.0 && ua < 1.0 && ub > 0.0 && ub < 1.0) {
        var up = new Vec(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
        return {ua: ua, ub: ub, up: up}; // up is intersection point
    }
    return false;
};

var line_point_intersect = function (p1, p2, p0, rad) {
    var v = new Vec(p2.y - p1.y, -(p2.x - p1.x)); // perpendicular vector
    var d = Math.abs((p2.x - p1.x) * (p1.y - p0.y) - (p1.x - p0.x) * (p2.y - p1.y));
    d = d / v.length();
    if (d > rad) {
        return false;
    }

    v.normalize();
    v.scale(d);
    var up = p0.add(v);
    if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
        var ua = (up.x - p1.x) / (p2.x - p1.x);
    } else {
        var ua = (up.y - p1.y) / (p2.y - p1.y);
    }
    if (ua > 0.0 && ua < 1.0) {
        return {ua: ua, up: up};
    }
    return false;
};

var randf = function (lo, hi) {
    return Math.random() * (hi - lo) + lo;
};
var randi = function (lo, hi) {
    return Math.floor(randf(lo, hi));
};
