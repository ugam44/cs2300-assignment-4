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

function getVectorBetweenTwoPoints (point1, point2) {
    // v = q-r
    return point2.map((point, index) => point - point1[index]);
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
  res = (Math.pow((point1.arrForm[0] - point2.arrForm[0]), 2) + Math.pow((point1.arrForm[1] - point2.arrForm[1]),2) + Math.pow((point1.arrForm[1] - point2.arrForm[1]), 2));
  return Math.sqrt(res);
}

function computeSpeed (point1, point2, time1, time2, r) {
    vector = getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm)
    //line fn
    lineEquation = new Line(point1, vector);

    // get max points - getPointAtT w/+2r
    // get min points - getPointAtT w/-2r
    maxPoint1 = lineEquation.getPointAtT(time2+(2*r));
    maxPoint2 = lineEquation.getPointAtT(time1-(2*r));
    minPoint1 = lineEquation.getPointAtT(time2-(2*r));
    minPoint2 = lineEquation.getPointAtT(time1+(2*r));

    // Get Speeds
    maxDistance = computeDistance(maxPoint1, maxPoint2);
    minDistance = computeDistance(minPoint1, minPoint2);

    // Calculate speed
    timeDifference = time2 - time1;
    maxSpeed = (maxDistance/timeDifference);
    minSpeed = (minDistance/timeDifference);

    // Returns Array
    return [maxSpeed, minSpeed];

    // I feel like theres a better way to do this. Feel free to minify/improve this function.
}

function computeAngle (point1, point2) {

}

function getAngleBetweenTwoVectors (vector1, vector2) {
    // theta = arccos( (A dot B) / (||A||*||B||) )
    var dotProduct = getDotProduct(vector1, vector2);
    var rightSide = dotProduct/(getMagOfVector(vector1) * getMagOfVector(vector2));
    var arcCos = Math.acos(rightSide);
    return toDegrees(arcCos);
}

var x = new Point(...[5,4,2]);
var y = new Point(...[3,1,6]);

// testing compute speed
// test[0] = maxSpeed, test[1] = minSpeed
test = computeSpeed (x, y, 1, 3, 5);
console.log(test[0]);
console.log(test[1]);

var newLine = getLineFunction (x, y);

console.dir(newLine);

console.log(newLine.getPointAtT(0));

console.log(getMagOfVector([1,2,2]));


var testPoint1 = new Point(1,1,0);
var testPoint2 = new Point(1,0,0);
var origin = new Point();

var v = getVectorBetweenTwoPoints(origin.arrForm, testPoint1.arrForm);
var w = getVectorBetweenTwoPoints(origin.arrForm, testPoint2.arrForm);

console.log(getAngleBetweenTwoVectors(v, w));
