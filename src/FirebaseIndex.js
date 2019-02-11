import FirebaseListener from './FirebaseListener';

export class FirebaseIndex extends FirebaseListener {
    constructor(uniqueId, groupIds, processor, onComplete) {
        super();

        this.uniqueId = uniqueId;
        this.groupIds = groupIds;
        this.processor = processor;
        this.onCompleted = onComplete;

        this.index = {};
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
        return this.index[id];
    }

    isPopulated() {
        return this._isPopulated;
    }

    onChange(change) {
        let data = change.doc.data();
        this.processor(data);
        this.update(data);
    }

    onComplete() {
        this._isPopulated = true;
        this.onCompleted(this.changedIds, this.changedGroups);
        this.resetState();
    }

    resetState() {
        this.changedIds = {};
        this.changedGroups = {};
        for(let g of this.groupIds) {
            this.changedGroups[g] = {};
        }
    }

    update(item) {
        let id = this.getUniqueId(item);

        let oldItem = this.index[id];
        for(let g of this.groupIds) {
            let groupId = this.getGroupId[g](item);

            if(oldItem) {
                let oldGroupId = this.getGroupId[g](oldItem);
                if(this.groupIndexes[g][oldGroupId])
                    delete this.groupIndexes[g][oldGroupId][id];

                this.changedGroups[g][oldGroupId] = true;
            }

            if(!this.groupIndexes[g][groupId])
                this.groupIndexes[g][groupId] = {};

            this.groupIndexes[g][groupId][id] = item;
            this.changedGroups[g][groupId] = true;
        }

        this.index[id] = item;

        this.changedIds[id] = true;
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
