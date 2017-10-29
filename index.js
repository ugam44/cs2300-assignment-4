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

function computeSpeed (point1, point2) {

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