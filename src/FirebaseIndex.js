import FirebaseListener from './FirebaseListener';

export class FirebaseIndex extends FirebaseListener {
    constructor(uniqueId, groupIds, processor, onCompleted) {
        super();

        this.uniqueId = uniqueId;
        this.groupIds = groupIds;
        this.processor = processor;
        this.onCompleted = onCompleted;

        this.index = new Map();
        this.groupIndexes = {};
        this._isPopulated = false;

        this.getUniqueId = this._makeGetter(uniqueId);

        this.getGroupId = {};
        for(let g of groupIds) {
            this.getGroupId[g] = this._makeGetter(g);
            this.groupIndexes[g] = {};
        }

        this.resetState();
    }

    find(id){
        console.assert(this.isPopulated());
        return this.index.get(id);
    }

    getGroup(groupType, groupId) {
        return Object.keys(this.groupIndexes[groupType][groupId]).map(x => this.find(x));
    }

    isPopulated() {
        return this._isPopulated;
    }

    onAdd(id, record) {
        if (!this.validateChange(id, record)) {
            return false;
        }

        this.addedIds[id] = true;
        this.processChange(record, false);
    }

    onModify(id, record) {
        if (!this.validateChange(id, record)) {
            return false;
        }

        this.changedIds[id] = true;
        this.processChange(record, false);
    }

    onRemove(id, record) {
        if (!this.validateChange(id, record)) {
            return false;
        }

        this.removedIds[id] = true;
        this.processChange(record, true);
    }

    validateChange(fid, record) {
        let _id = record._id;
        let id = this.getUniqueId(record);

        if (!id || !_id || !fid || id === "" || _id !== id || fid !== id) {
            console.warn("id mismatch: %s != %s", _id, id, record);
            return false;
        }

        return true;
    }

    processChange(data, removed) {
        this.processor(data);
        this.updateIndexes(data, removed);
    }

    updateIndexes(item, removed) {
        let id = this.getUniqueId(item);

        let oldItem = this.index.get(id);
        for(let g of this.groupIds) {
            if(oldItem) {
                let oldGroupId = this.getGroupId[g](oldItem);
                if(this.groupIndexes[g][oldGroupId])
                    delete this.groupIndexes[g][oldGroupId][id];

                this.changedGroups[g][oldGroupId] = true;
            }

            if(!removed) {
                let groupId = this.getGroupId[g](item);
                if(!this.groupIndexes[g][groupId])
                    this.groupIndexes[g][groupId] = {};

                this.groupIndexes[g][groupId][id] = true;
                this.changedGroups[g][groupId] = true;
            }
        }

        if (!removed) {
            this.index.set(id, item);
        } else {
            this.index.delete(id);
        }
    }

    onComplete() {
        this._isPopulated = true;
        this.onCompleted(this.addedIds, this.removedIds, this.changedIds, this.changedGroups);
        this.resetState();
    }

    resetState() {
        this.addedIds = {};
        this.removedIds = {};
        this.changedIds = {};
        this.changedGroups = {};
        for(let g of this.groupIds) {
            this.changedGroups[g] = {};
        }
    }

    _makeGetter(f) {
        if(typeof(f) == "string") {
            return (raw) => raw[f];
        } else {
            return f;
        }
    }
}

export default FirebaseIndex;
