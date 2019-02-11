import FirebaseListener from './FirebaseListener';

class DataManagerListener extends FirebaseListener {
    constructor(manager, idmaker) {
        super();
        this.manager = manager;
        this.subscribers = [];
        this.recordField = '_id';
        this._id = idmaker;
    }

    onAdd(id, record) {
        console.log("added [%s]", id, record)
        this.manager.insert(this._format(id, record));

    }

    onModify(id, record) {
        console.debug("modified [%s]", id, record)
        this.manager.update(this.recordField, this._format(id, record));
    }

    onRemove(id, record) {
        console.debug("removed [%s]", id, record)
        this.manager.remove(this.recordField, this._format(id, record));
    }

    onComplete() {
        for(let t of this.subscribers) {
            t.onUpdate();
        }
    }

    subscribeUpdate(f) {
        this.subscribers.push(f);
    }

    _format(id, record) {
        record["_firebaseId"] = id;
        record["_id"] = this._id(record);
        return record;
    }
}

export default DataManagerListener;
