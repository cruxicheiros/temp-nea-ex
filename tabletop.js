
var options = {
    mode : "create",  // create, label, draw, move, select, measure
    strokeColor: 'black',
    fillColor: 'white',
    highlightColor: 'red'
};

var state = {
    drawings : new Layer([]),
    shapes : new Layer([]),
    playerOverlay: new Layer([]),
    measuringLine: null,
    focus : null,

    refresh: function (receivedSYNACK) {
        console.log('Reconstitute', receivedSYNACK);

        for (var i = 0; i < receivedSYNACK.body.sendUpdates.length; i++) {
            var dataDescription = receivedSYNACK.body.sendUpdates[i];

            if (dataDescription.type = "circle") {
                for (var j = 0; j < this.shapes.children.length; j++) {
                    if (this.shapes.children[j].data.uniqueID === dataDescription.uniqueID) {
                        this.shapes.children[j].remove();
                    }
                }

                console.log(dataDescription.data.fillColor);

                this.shapes.addChild(
                    createCircle(
                        new Point(dataDescription.data.x, dataDescription.data.y),
                        dataDescription.data.radius,
                        dataDescription.data.strokeColor,
                        dataDescription.data.strokeWidth,
                        new Color(dataDescription.data.fillColor.red, dataDescription.data.fillColor.green, dataDescription.data.fillColor.blue),
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

var createCircle = function (center, radius, strokeColor, strokeWidth, fillColor, uniqueID, versionNumber, labelText) {
    var newCircle = new Path.Circle({
        center: center,
        radius: radius
    });

    newCircle.strokeColor = strokeColor;
    newCircle.strokeWidth = strokeWidth;
    newCircle.fillColor = fillColor;
    newCircle.data.radius = radius;
    newCircle.data.type = "circle";

    newCircle.data.highlighted = false;

    if (typeof uniqueID === "undefined") {   // these blocks are necessary because paperscript doesn't support default args so I have to polyfill them
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
        } else if (options.mode === 'recolor') {
            this.fillColor.saturation = 0.5;
            this.fillColor.brightness = 0.5;
            this.fillColor.hue += 5;

            this.data.versionNumber += 1;
            state.focus = this;
        }
    };

    newCircle.onMouseDown = function (event) {
        if (options.mode === 'highlight') {
            if (this.data.highlighted === true) {
                this.strokeColor = options.strokeColor;
                this.strokeWidth = 1;
                this.data.highlighted = false;

            } else {
                this.strokeColor = options.highlightColor;
                this.strokeWidth = 10;
                this.data.highlighted = true;
            }

            this.data.versionNumber += 1;
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
        state.focus = createCircle(event.point, 20, options.strokeColor, 1, options.fillColor);

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

