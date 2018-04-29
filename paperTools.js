var paperTools = { //Unexpected issue: item.toJSON doesn't work, item.exportJSON loses extra circle stuff. Needs a custom import thing.
    create: function (path, targetLayer) {
        targetLayer.addChild(path);
    },

    update: function (path, targetLayer) {
        for (let i = 0; i < targetLayer.children.length; i++) {
            if (targetLayer.children[i].id = path.id) {
                targetLayer.remove(targetLayer.children[i]);
                targetLayer.addChild(path);
            }
        }
    },

    remove: function (path, targetLayer) {
        targetLayer.remove(path);
    },

    applyUpdatesFromPacket: function (updatePacket, layerMap) {
        let updates = updatePacket.body.updates;
        for (let i = 0; i < updates.length; i++) {
            if (updates[i].action === "create") {
                this.create(JSON.parse(updates[i].json), layerMap[updates[i].type])
            }
        }
    }
}
