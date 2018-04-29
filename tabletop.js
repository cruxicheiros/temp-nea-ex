
var options = {
    mode : "create",  // create, label, draw, move, select, measure
    strokeColor: 'black',
    focusStrokeColor: 'red',
    fillColor: 'white'
};

var state = {
    shapes : new Layer([]),
    drawings : new Layer([]),
    playerOverlay: new Layer([]),
    measuringLine: null,
    focus : null,

    refresh: function (receivedSYNACK) {
        console.log('Reconstitute', receivedSYNACK);

        for (var i = 0; i < receivedSYNACK.body.sendUpdates.length; i++) {
            var dataDescription = receivedSYNACK.body.sendUpdates[i];

            if (dataDescription.type = "circle") {
                for (var j = 0; j < this.shapes.children.length; j++) {
                    if (this.shapes.children[j].data.uniqueID === dataDescription.type) {
                        this.shapes.children[j].remove();
                    }
                }

                this.shapes.addChild(
                    createCircle(
                        new Point(dataDescription.data.x, dataDescription.data.y),
                        dataDescription.data.radius,
                        dataDescription.data.strokeColor,
                        dataDescription.data.fillColor,
                        dataDescription.uniqueID,
                        dataDescription.versionNumber
                    )
                );

            } else if (receivedSYNACK.sendUpdates[i].type = "drawing") {

            } else {
                console.log("Reconstitution failed: Unknown type: ", receivedSYNACK.sendUpdates[i].type)
            }
        }
    }
};

var globals = {
    options : options,
    state : state
};

var genUniqueID = function () {  // Source: https://stackoverflow.com/a/44078785
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
};

window.globals = globals;

var createCircle = function (center, radius, strokeColor, fillColor, uniqueID, versionNumber) {
    var newCircle = new Path.Circle({
        center: center,
        radius: radius
    });

    newCircle.strokeColor = strokeColor;
    newCircle.fillColor = fillColor;
    newCircle.data.radius = radius;
    newCircle.data.type = "circle";

    if (typeof uniqueID === "undefined") {
        newCircle.data.uniqueID = genUniqueID();
    } else {
        newCircle.data.uniqueID = uniqueID
    }

    if (typeof versionNumber === "undefined") {
        newCircle.data.versionNumber = 0;
    } else {
        newCircle.data.versionNumber = versionNumber
    }

    newCircle.onMouseDrag = function (event) {
        if (options.mode === 'move') {
            this.position += event.delta;
            this.data.versionNumber += 1;
            state.focus = this;
        }
    };

    newCircle.onMouseDown = function (event) {
        if (options.mode === 'select') {
            state.focus = this;
        }
    };

    return newCircle;
}

function onMouseDown(event) {
    if (options.mode === 'draw') {
        state.drawings.activate();
        var newLine = new Path();
        newLine.data.versionNumber = 0;
        newLine.data.type = 'drawing';
        newLine.data.uniqueID = genUniqueID();
        newLine.strokeColor = options.strokeColor;

        newLine.add(event.point);

        state.focus = newLine;

    } else if (options.mode === 'create') {
        state.shapes.activate();
        state.focus = createCircle(event.point, 20, options.strokeColor, options.fillColor);

    } else if (options.mode === 'measure') {
        state.playerOverlay.activate();

        if (state.measuringLine === null) {
            state.measuringLine = Path.Line(event.point, event.point)
            state.measuringLine.strokeColor = options.strokeColor;
            state.measureText = new PointText(event.point)
        } else {
            state.measuringLine.remove();
            state.measureText.remove();
            state.measuringLine = null;
            state.measureText = null;
        }
    }
}

function onMouseMove(event) {
    if (options.mode === 'measure') {
        state.playerOverlay.activate();

        if (state.measuringLine !== null) {
            state.measureText.remove();
            state.measuringLine.removeSegment(1);
            state.measuringLine.add(event.point);

            state.measureText = new PointText(event.point);
            state.measureText.justification = 'right';
            state.measureText.strokeColor = 'black';
            state.measureText.content = Math.floor(state.measuringLine.firstSegment.point.getDistance(event.point)) + 'px';
        }
    }
}

function onMouseDrag(event) {
    if (options.mode === 'draw') {
        state.drawings.activate();
        state.focus.add(event.point);
        state.focus.data.versionNumber += 1;

    } else if (options.mode === 'create') {
        state.shapes.activate();
        if (event.delta.y > 0) {
            if (state.focus.bounds.width < 300 ) {
                state.focus.scale(1.1);
            }
        } else if (event.delta.y < 0) {
            if (state.focus.bounds.width > 10) {
                state.focus.scale(0.9);
            }
        }

        state.focus.data.radius = state.focus.bounds.width / 2;  //The width/2 of the bounds rect will be the radius of the circle.
        state.focus.data.versionNumber += 1;
    }
}

function onMouseUp(event) {
}

