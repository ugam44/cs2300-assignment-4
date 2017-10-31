var fs = require("fs"), filename = process.argv[2];
var pointArr = [];

/* -------------------------------
Check for proper program usage
------------------------------- */
if (process.argv.length < 3) {
  console.log('Usage: node . <filename.txt>');
  console.log('Ex: node . in2.txt')
  process.exit(1);
}
if (process.argv[2].split(".")[1] != 'txt'){
    console.log("This is not the proper filetype")
    console.log('Usage: node . <filename.txt>');
    process.exit(1)
}

function Point (x, y, z, t) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.t = t || 0;
    // t is not added to arr form as this will break previous functions.
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

/* -------------------------------
Read in file
Assign Parameter Variables
Create point array
------------------------------- */
fs.readFile(filename, "utf8", function(err,data) {
    if(err) throw err;

    console.log("Loaded: " + filename);
    filename = filename.split(".txt")[0]
    outfile = "./" + filename + "out.png"
    // first line of file determines parameters, rest of lines are projectile definitions
    var [parameterLine, ...projectileLines] = data.split("\n");
    parameterLine = parameterLine.split(" ").map(elem => Number(elem.replace("\r", "")));

    var parameters = {
        numOfImpacts: parameterLine[0],
        fiberWidth: parameterLine[1],
        fiberSpacing: parameterLine[2],
        verticalSpacing: parameterLine[3],
        radius: parseInt(parameterLine[2])/4,
    };

    projectileLines.forEach(function (line) {
        // line format -- # of projectiles: proj0x-coord,proj0y-coord; proj1x-coord,proj1y-coord, etc.
        // Example -- 3: 126,52; 46,439; 250,239
        // Don't care about # of projectiles, just want each x,y pair into an array

        try{
            var splited = line.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            splited.forEach(function(){
              // break into coordinates
              coords = splited[0].split(' ');
              // create point
              point = new Point(coords[0], coords[1], coords[2], coords[3]);
              pointArray.push(point);
            });
        } catch (e) {
            console.log(e);
        }
    });
});
