function Point (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.arrForm = [this.x,this.y,this.z];
}

function Line (point, vector) {
    this.p = point || new Point();
    this.v = vector || getVectorBetweenTwoPoints(new Point().arrForm, this.p.arrForm);
    this.getPointAtT = function (t) {
        // l(t) = p + tv
        return new Point(...addPoints(this.p.arrForm, scalarMultiply(t, this.v)));
    };
}

function scalarMultiply (scalar, vector) {
    return vector.map(elem => elem * scalar);
}

function addPoints (point1, point2) {
    return point1.map((point, index) => point + point2[index]);
}

function getVectorBetweenTwoPoints (r, q) {
    // v = q-r
    return q.map((point, index) => point - r[index]);
}

function getLineFunction (point1, point2) {
    return new Line(point1, getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm));
}

function getMagOfVector (vector) {
    return getDotProduct(vector, vector);
}

function getDotProduct (vector1, vector2) {
    return Math.sqrt(vector1.reduce((total, current, index) => total + current*vector2[index], 0));
}

function toRadians (degrees) {
    return degrees * (Math.PI/180);
}

function toDegrees (radians) {
    return radians * (180/Math.PI);
}

function computeDistance (point1, point2) {
    return getMagOfVector(getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm));
}

function computeSpeed (point1, point2, time1, time2, projectileRadius) {
    // top/bottom relative to Z-axis
    var [topPoint, bottomPoint] = [point1, point2].sort((a, b) => b.z - a.z);
    var vector = getVectorBetweenTwoPoints(bottomPoint.arrForm, topPoint.arrForm);
    console.log(vector);

    var t = 2*projectileRadius / getMagOfVector(vector);

    //line fn
    var topLineEquation = new Line(topPoint, vector);
    var bottomLineEquation = new Line(bottomPoint, vector);

    // get max points - getPointAtT w/+2r
    // get min points - getPointAtT w/-2r
    var maxPoint1 = topLineEquation.getPointAtT(t);
    var maxPoint2 = bottomLineEquation.getPointAtT(-t);
    var minPoint1 = topLineEquation.getPointAtT(-t);
    var minPoint2 = bottomLineEquation.getPointAtT(t);

    console.log(...[maxPoint1, maxPoint2, minPoint1, minPoint2].map(point => point.arrForm));

    // Get distances
    var maxDistance = computeDistance(maxPoint1, maxPoint2);
    var minDistance = computeDistance(minPoint1, minPoint2);
    console.log(maxDistance, minDistance);

    // Calculate speed
    var timeDifference = Math.abs(time2 - time1);
    var maxSpeed = maxDistance / timeDifference;
    var minSpeed = minDistance / timeDifference;

    // Returns Array
    return {maxSpeed, minSpeed};

    // I feel like theres a better way to do this. Feel free to minify/improve this function.
}

function computeXZAngle (point1, point2) {
    // p = [px, py, pz]
    var p = point1;
    // q = [qx, py, qz]
    var q = new Point(point2.x, point1.y, point2.z); 
    // r = [qx, py, pz]
    var r = new Point(point2.x, point1.y, point1.z);
    // v = q - p
    var v = getVectorBetweenTwoPoints(p.arrForm, q.arrForm);
    // w = r - p
    var w = getVectorBetweenTwoPoints(p.arrForm, r.arrForm);
    return getAngleBetweenTwoVectors(v, w);
}

function computeYZAngle (point1, point2) {
    // p = [px, py, pz]
    var p = point1;
    // q = [px, qy, qz]
    var q = new Point(point1.x, point2.y, point2.z); 
    // r = [px, qy, pz]
    var r = new Point(point1.x, point2.y, point1.z);
    // v = q - p
    var v = getVectorBetweenTwoPoints(p.arrForm, q.arrForm);
    // w = r - p
    var w = getVectorBetweenTwoPoints(p.arrForm, r.arrForm);
    return getAngleBetweenTwoVectors(v, w);
}

console.log(computeXZAngle(new Point(), new Point(1,1,1)));
console.log(computeYZAngle(new Point(), new Point(1,1,1)));

function getAngleBetweenTwoVectors (vector1, vector2) {
    // theta = arccos( (A dot B) / (||A||*||B||) )
    var dotProduct = getDotProduct(vector1, vector2);
    var rightSide = dotProduct/(getMagOfVector(vector1) * getMagOfVector(vector2));
    var arcCos = Math.acos(rightSide);
    return toDegrees(arcCos);
}

var x = new Point(...[5,4,6]);
var y = new Point(...[3,1,2]);

// testing compute speed
// test[0] = maxSpeed, test[1] = minSpeed
var test = computeSpeed (x, y, 100, 400, 2);
console.log(test.maxSpeed);
console.log(test.minSpeed);

// var newLine = getLineFunction (x, y);

// console.dir(newLine);

// console.log(newLine.getPointAtT(0));

// console.log(getMagOfVector([2,3,-4]));


// var testPoint1 = new Point(1,1,0);
// var testPoint2 = new Point(1,0,0);
// var origin = new Point();

// var v = getVectorBetweenTwoPoints(origin.arrForm, testPoint1.arrForm); // [1,1,0]
// var w = getVectorBetweenTwoPoints(origin.arrForm, testPoint2.arrForm); // [1,0,0]

// console.log(getAngleBetweenTwoVectors(v, w)); // should be 45
