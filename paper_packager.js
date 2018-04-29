var paperPackager = {
    serializePath: function (paperPath) {
        var packet = {
            uniqueID: paperPath.data.uniqueID,
            versionNumber: paperPath.data.versionNumber,
            type: paperPath.data.type,

            data: {
                x: paperPath.position.x,
                y: paperPath.position.y,
                strokeWidth: paperPath.strokeWidth,
                strokeColor: {
                    red: paperPath.strokeColor.red,
                    green: paperPath.strokeColor.green,
                    blue: paperPath.strokeColor.blue
                }
            }
        };
        
        if (packet.type === "circle") {
            packet.data.radius = paperPath.data.radius;
            packet.data.highlighted = paperPath.data.highlighted;

            packet.data.fillColor = {
                red : paperPath.fillColor.red,
                green: paperPath.fillColor.green,
                blue: paperPath.fillColor.blue
            };

        } else if (packet.type === "drawing") {
            packet.data.segments = [];
            for (let i = 0; i < paperPath.segments.length; i++) {
                packet.data.segments.push({
                    x: paperPath.segments[i].point.x,
                    y: paperPath.segments[i].point.y,

                    handleIn:{
                        x: paperPath.segments[i].handleIn.x,
                        y: paperPath.segments[i].handleIn.y
                    },
                    handleOut: {
                        x: paperPath.segments[i].handleOut.x,
                        y: paperPath.segments[i].handleOut.y
                    },
                });
            }
        }

        return packet
    },

    serializeContainer: function (paperContainer) {  // Package info of all children of a Paper.js container
        var packagedPaths = [];

        for (let i = 0; i < paperContainer.children.length; i++) {
            packagedPaths.push(this.serializePath(paperContainer.children[i]))
        }

        return packagedPaths;
    },

    summarizePath: function (paperPath) {
        return {
            uniqueID: paperPath.data.uniqueID,
            versionNumber: paperPath.data.versionNumber
        }
    },

    summarizeContainer: function (paperContainer) {  // Summarize all children of a Paper.js container
        var packagedSummaries = [];

        for (let i = 0; i < paperContainer.children.length; i++) {
            packagedSummaries.push(this.summarizePath(paperContainer.children[i]))
        }

        return packagedSummaries;
    },
};
