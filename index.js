var fs = require("fs"),
    filename = process.argv[2];

/* -------------------------------
Check for proper program usage
------------------------------- */
if (process.argv.length < 3) {
    console.log('Usage: node . <filename.txt>');
    console.log('Ex: node . in2.txt')
    process.exit(1);
}
if (process.argv[2].split(".")[1] != 'txt') {
    console.log("This is not the proper filetype")
    console.log('Usage: node . <filename.txt>');
    process.exit(1)
}

function Point(x, y, z, t) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.t = t || 0;
    // t is not added to arr form as this will break previous functions.
    this.arrForm = [this.x, this.y, this.z];
}

function Line(point, vector) {
    this.p = point || new Point();
    this.v = vector || getVectorBetweenTwoPoints(new Point().arrForm, this.p.arrForm);
    this.getPointAtT = function (t) {
        // l(t) = p + tv
        return new Point(...addPoints(this.p.arrForm, scalarMultiply(t, this.v)));
    };
}

function scalarMultiply(scalar, vector) {
    return vector.map(elem => elem * scalar);
}

function addPoints(point1, point2) {
    return point1.map((point, index) => point + point2[index]);
}

function getVectorBetweenTwoPoints(r, q) {
    // v = q-r
    return q.map((point, index) => point - r[index]);
}

function getLineFunction(point1, point2) {
    return new Line(point1, getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm));
}

function getMagOfVector(vector) {
    return getDotProduct(vector, vector);
}

function getDotProduct(vector1, vector2) {
    return Math.sqrt(vector1.reduce((total, current, index) => total + current * vector2[index], 0));
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function computeDistance(point1, point2) {
    return getMagOfVector(getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm));
}

function computeSpeed(point1, point2) {
    // top/bottom relative to Z-axis
    var [topPoint, bottomPoint] = [point1, point2].sort((a, b) => b.z - a.z);
    var vector = getVectorBetweenTwoPoints(bottomPoint.arrForm, topPoint.arrForm);

    var t = ((0.5 * parameters.fiberWidth) + parameters.radius) / getMagOfVector(vector);

    //line fn
    var topLineEquation = new Line(topPoint, vector);
    var bottomLineEquation = new Line(bottomPoint, vector);

    // get max points - getPointAtT +2r, 0
    // get min points - getPointAtT +2r, 0
    var maxPoint1 = topLineEquation.getPointAtT(t);
    var maxPoint2 = bottomLineEquation.getPointAtT(-t);
    var minPoint1 = topLineEquation.getPointAtT(t);
    var minPoint2 = bottomLineEquation.getPointAtT(-t);

    // Get distances
    var maxDistance = computeDistance(maxPoint1, maxPoint2);
    var minDistance = computeDistance(minPoint1, minPoint2);
    //console.log(maxDistance, minDistance);

    // Calculate speed
    var timeDifference = Math.abs(topPoint.t - bottomPoint.t);
    var maxSpeed = maxDistance / timeDifference;
    var minSpeed = minDistance / timeDifference;

    // Returns Array
    return {
        maxSpeed,
        minSpeed
    };
}

function computeXZAngle(point1, point2) {
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

function computeYZAngle(point1, point2) {
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

function getAngleBetweenTwoVectors(vector1, vector2) {
    // theta = arccos( (A dot B) / (||A||*||B||) )
    var dotProduct = getDotProduct(vector1, vector2);
    var rightSide = (dotProduct / (getMagOfVector(vector1) * getMagOfVector(vector2))) || 0;
    var arcCos = Math.acos(rightSide);
    return toDegrees(arcCos);
}

/* -------------------------------
Read in file
Assign Parameter Variables
Create point array
------------------------------- */
var parameters;
var minXZ, maxXZ, maxYZ, minYZ, minSpeed, maxSpeed;
maxSpeed = maxXZ = maxYZ = -Infinity;
minYZ = minSpeed = minXZ = Infinity;
var pointArr = [];
fs.readFile(filename, "utf8", function (err, data) {
    if (err) throw err;

    console.log("Loaded: " + filename);
    filename = filename.split(".txt")[0];
    var outfile = "./" + filename + "out.txt";
    // first line of file determines parameters, rest of lines are projectile definitions
    var [parameterLine, ...projectileLines] = data.split("\n");

    // was an issue with projectileLines array containing an extra \n item
    var index = projectileLines.indexOf("");
    if (index !== -1) {
        projectileLines.splice(index, 1);
    }

    parameterLine = parameterLine.split(" ").map(elem => Number(elem.replace("\r", "")));

    parameters = {
        numOfImpacts: parameterLine[0],
        fiberWidth: parameterLine[1],
        fiberSpacing: parameterLine[2],
        verticalSpacing: parameterLine[3],
        radius: parseInt(parameterLine[2]) / 4,
    };
    projectileLines.forEach(function (line) {
        try {
            var splited = line.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            splited.forEach(function (elem) {
                // break into coordinates
                var coords = elem.split(" ").map(Number);
                // create point
                pointArr.push(new Point(...coords));
            });

        } catch (e) {
            console.log(e);
        }
    });

    var pointMap = pointArr.reduce((res, curr) => {
        if (res[curr.z] == undefined) {
            res[curr.z] = [];
        }
        res[curr.z].push(curr);
        return res;
    }, {});
    var [largestZPoints, rest] = Object.keys(pointMap).sort((a, b) => b - a).map(key => pointMap[key]);
    largestZPoints.forEach(largeZPoint => {
        rest.forEach(restPoint => {
            var xZ = computeXZAngle(largeZPoint, restPoint);
            var yZ = computeYZAngle(largeZPoint, restPoint);
            var speed = computeSpeed(largeZPoint, restPoint);

            if (xZ < minXZ) { minXZ = xZ; }
            if (xZ > maxXZ) { maxXZ = xZ; }

            if (yZ < minYZ) { minYZ = yZ; }
            if (yZ > maxYZ) { maxYZ = yZ; }

            if (speed.minSpeed < minSpeed) { minSpeed = speed.minSpeed; }
            if (speed.maxSpeed > maxSpeed) { maxSpeed = speed.maxSpeed; }

        });
    });

    //data = ("Min XZ Angle: " + minXZ + " degrees | Max XZ Angle: " + maxXZ + " degrees | Min YZ Angle: " + minYZ + " degrees | Max YZ Angle: " + maxYZ + " degrees | Min Speed: " + minSpeed + " ms | Max Speed: " + maxSpeed + " ms");

    // The assignment says the output is in format:
    // minspeed maxspeed minxangle maxxangle minyangle maxyangle
    data =  (minSpeed + " " + maxSpeed + " " + minXZ + " " + maxXZ + " " + minYZ + " " + maxYZ);

    fs.writeFile("test.txt", data, function (err) {
        if (err) throw err;
    });
});
