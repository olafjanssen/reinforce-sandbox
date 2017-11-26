// A 2D vector utility


/**
 * Utility class to perform simple Vector calculations, with a single 2D vector as starting point.
 *
 * @param x     x-coordinate
 * @param y     y-coordinate
 * @constructor
 */
var Vec = function (x, y) {
    this.x = x;
    this.y = y;
};

Vec.prototype = {

    /**
     * Compute the distance between two Vec points.
     *
     * @param v     the other Vec to compute the distance to
     * @returns {number}    the distance in pixels
     */
    dist_from: function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    },

    /**
     * The magnitude or length of the Vec (distance to the origin)
     *
     * @returns {number} the length of the vector
     */
    length: function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    },

    /**
     * Add two Vec objects.
     *
     * @param v     the Vec to add
     * @returns {Vec}   the new Vec
     */
    add: function (v) {
        return new Vec(this.x + v.x, this.y + v.y);
    },

    /**
     * Subtract two Vec objects
     *
     * @param v     the Vec to subtract
     * @returns {Vec}   the new Vec
     */
    sub: function (v) {
        return new Vec(this.x - v.x, this.y - v.y);
    },

    /**
     * Rotate the vector clockwise by an anle.
     * @param a     the angle in radians (360 deg = 2*Math.PI rad)
     * @returns {Vec}   the rotated Vec
     */
    rotate: function (a) {  // CLOCKWISE
        return new Vec(this.x * Math.cos(a) + this.y * Math.sin(a),
            -this.x * Math.sin(a) + this.y * Math.cos(a));
    },

    /**
     * Scale the Vec by a scalar number.
     *
     * @param s     the number to scale the Vec with
     */
    scale: function (s) {
        this.x *= s;
        this.y *= s;
    },

    /**
     * Normalize the Vec (so that its length is always 1)
     */
    normalize: function () {
        var d = this.length();
        this.scale(1.0 / d);
    }
};

/**
 * Utility function for line intersections: does line segment (p1,p2) intersect segment (p3,p4) ?
 * @param p1    point 1 of line-section (p1,p2)
 * @param p2    point 2 of line-section (p1,p2)
 * @param p3    point 1 of line-section (p3,p4)
 * @param p4    point 2 of line-section (p3,p4)
 * @returns {*} false if no intersection, else the intersection information
 */
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

/**
 * Utility function to the detect the intersection of a point with a line (p1,p2).
 *
 * @param p1    point 1 of line-section (p1,p2)
 * @param p2    point 2 of line-section (p1,p2)
 * @param p0    point to detect if it intersects the line segment
 * @param rad   maximum radius to detect
 * @returns {*}
 */
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

/**
 * Compute a random floating point number within the given boundaries.
 *
 * @param lo    lower boundary
 * @param hi    upper boundary
 * @returns {number} random floating point
 */
var randf = function (lo, hi) {
    return Math.random() * (hi - lo) + lo;
};

/**
 * Compute a random integer within the given boundaries.
 *
 * @param lo    lower boundary
 * @param hi    upper boundary
 * @returns {number}    random integer number
 */
var randi = function (lo, hi) {
    return Math.floor(randf(lo, hi));
};
