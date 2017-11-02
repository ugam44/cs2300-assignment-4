var fs = require("fs"),
    filename = process.argv[2];

/* -------------------------------
Check for proper program usage
------------------------------- */
if (process.argv.length < 3) {
    console.log("Usage: node . <filename.txt>");
    console.log("Ex: node . in2.txt");
    process.exit(1);
}
if (process.argv[2].split(".")[1] != "txt") {
    console.log("This is not the proper filetype");
    console.log("Usage: node . <filename.txt>");
    process.exit(1);
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

function getMagOfVector(vector) {
    return getDotProduct(vector, vector);
}

function getDotProduct(vector1, vector2) {
    return Math.sqrt(vector1.reduce((total, current, index) => total + current * vector2[index], 0));
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function computeDistance(point1, point2) {
    return getMagOfVector(getVectorBetweenTwoPoints(point1.arrForm, point2.arrForm));
}

function computeSpeed(point1, point2) {
    // top/bottom relative to Z-axis
    // time difference to factor in microsecond rounding
    var delta = 0.999;
    var [topPoint, bottomPoint] = [point1, point2].sort((a, b) => b.z - a.z);
    var vector = getVectorBetweenTwoPoints(bottomPoint.arrForm, topPoint.arrForm);

    // t is the point in the line equation that gives us the point that is exactly 1 radius away from the edge of the fiber.
    // t = ((1/2 fiber width) + radius) / ||v||
    var t = ((0.5 * parameters.fiberWidth) + parameters.radius) / getMagOfVector(vector);

    //line fn for top-most point. t = 0 gives topPoint
    var topLineEquation = new Line(topPoint, vector);
    //line fn for bottom-most point. t = 0 gives bottomPoint
    var bottomLineEquation = new Line(bottomPoint, vector);

    // get max points
    var maxPoint1 = topLineEquation.getPointAtT(t);
    var maxPoint2 = bottomLineEquation.getPointAtT(-t);

    // get min points
    var minPoint1 = topLineEquation.getPointAtT(-t);
    var minPoint2 = bottomLineEquation.getPointAtT(t);

    // Get distances
    var maxDistance = computeDistance(maxPoint1, maxPoint2);
    var minDistance = computeDistance(minPoint1, minPoint2);

    // Calculate speed
    var timeDifference = Math.abs(topPoint.t - bottomPoint.t);

    var minSpeed = minDistance / (timeDifference + delta);
    // assume minimum time difference is 1 nanosecond
    var maxSpeed = maxDistance / (0.0001);
    if (timeDifference && timeDifference >= 2) {
        maxSpeed = maxDistance / ((timeDifference - 2) + delta);
    }

    // convert mm per microsecond to meters per second
    minSpeed *= 1000;
    maxSpeed *= 1000;

    return {
        maxSpeed: maxSpeed*1000,
        minSpeed: minSpeed*1000
    };
}

function computeXZAngle(point1, point2) {
    var offset = parameters.radius + (0.5 * parameters.fiberWidth);
    // p = [px, py, pz]
    var minP = new Point(point1.x - offset, point1.y, point1.z);
    var maxP = new Point(point1.x + offset, point1.y, point1.z);
    // q = [qx, py, qz]
    var minQ = new Point(point2.x + offset, point1.y, point2.z);
    var maxQ = new Point(point2.x - offset, point1.y, point2.z);
    // r = [qx, py, pz]
    var minR = new Point(point2.x + offset, point1.y, point1.z);
    var maxR = new Point(point2.x - offset, point1.y, point1.z);
    // v = q - p
    var minV = getVectorBetweenTwoPoints(minP.arrForm, minQ.arrForm);
    var maxV = getVectorBetweenTwoPoints(maxP.arrForm, maxQ.arrForm);
    // w = r - p
    var minW = getVectorBetweenTwoPoints(minP.arrForm, minR.arrForm);
    var maxW = getVectorBetweenTwoPoints(maxP.arrForm, maxR.arrForm);

    var minAngle = getAngleBetweenTwoVectors(minV, minW);
    var maxAngle = getAngleBetweenTwoVectors(maxV, maxW);

    return {
        maxAngle: maxW[0] > 0 ? maxAngle : 180 - maxAngle,
        minAngle: minW[0] > 0 ? minAngle : 180 - minAngle
    };
}


function computeYZAngle(point1, point2) {
    var offset = parameters.radius + (0.5 * parameters.fiberWidth);
    // p = [px, py, pz]
    var minP = new Point(point1.x, point1.y - offset, point1.z);
    var maxP = new Point(point1.x, point1.y + offset, point1.z);
    // q = [px, qy, qz]
    var minQ = new Point(point1.x, point2.y + offset, point2.z);
    var maxQ = new Point(point1.x, point2.y - offset, point2.z);
    // r = [px, qy, pz]
    var minR = new Point(point1.x, point2.y + offset, point1.z);
    var maxR = new Point(point1.x, point2.y - offset, point1.z);
    // v = q - p
    var minV = getVectorBetweenTwoPoints(minP.arrForm, minQ.arrForm);
    var maxV = getVectorBetweenTwoPoints(maxP.arrForm, maxQ.arrForm);
    // w = r - p
    var minW = getVectorBetweenTwoPoints(minP.arrForm, minR.arrForm);
    var maxW = getVectorBetweenTwoPoints(maxP.arrForm, maxR.arrForm);

    var minAngle = getAngleBetweenTwoVectors(minV, minW);
    var maxAngle = getAngleBetweenTwoVectors(maxV, maxW);

    return {
        maxAngle: maxW[1] > 0 ? maxAngle : 180 - maxAngle,
        minAngle: minW[1] > 0 ? minAngle : 180 - minAngle
    };
}

function getAngleBetweenTwoVectors(vector1, vector2) {
    // theta = arccos( (A dot B) / (||A||*||B||) )
    var dotProduct = getDotProduct(vector1, vector2);
    var rightSide = (dotProduct / (getMagOfVector(vector1) * getMagOfVector(vector2))) || 0;
    var arcCos = Math.acos(rightSide);
    return toDegrees(arcCos);
}

function truncateDecimal(number){
    return number.toFixed(2);
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
    outputLeft = filename.split(".")
    output = outputLeft[0] + "-out.txt"

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
            var xZ = computeXZAngle(restPoint, largeZPoint);
            var yZ = computeYZAngle(restPoint, largeZPoint);
            var speed = computeSpeed(largeZPoint, restPoint);

            if (xZ.minAngle < minXZ) { minXZ = xZ.minAngle; }
            if (xZ.maxAngle > maxXZ) { maxXZ = xZ.maxAngle; }

            if (yZ.minAngle < minYZ) { minYZ = yZ.minAngle; }
            if (yZ.maxAngle > maxYZ) { maxYZ = yZ.maxAngle; }

            if (speed.minSpeed < minSpeed) { minSpeed = speed.minSpeed; }
            if (speed.maxSpeed > maxSpeed) { maxSpeed = speed.maxSpeed; }
        });
    });

    // The assignment says the output is in format:
    // minspeed maxspeed minxangle maxxangle minyangle maxyangle
    // speed in meters/second, angle in degrees
    data =  (truncateDecimal(minSpeed) + " m/s " + truncateDecimal(maxSpeed) + " m/s " + truncateDecimal(minXZ) + " deg " + truncateDecimal(maxXZ) + " deg " + truncateDecimal(minYZ) + " deg " + truncateDecimal(maxYZ) + " deg");

    fs.writeFile(output, data, function (err) {
        if (err) throw err;
    });
});
