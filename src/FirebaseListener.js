export class FirebaseListener {
    constructor() {
        this.seenSnapshot = false;
    }

    onChanges(changes) {
        if (!this.seenSnapshot) {
            this.onSnapshot(changes);
            this.seenSnapshot = true;
        } else {
            for(let change of changes) {
                this.onChange(change);
            }
        }

        this.onComplete();
    }

    onSnapshot(changes) {
        for(let change of changes) {
            console.assert(change.type === "added");
            this.onChange(change);
        }
    }

    onChange(change) {
        console.log("change: ", change);
        if (change.type === "added") {
            this.onAdd(change.doc.id, change.doc.data());
        } else if (change.type === "modified") {
            this.onModify(change.doc.id, change.doc.data());
        } else if (change.type === "removed") {
            this.onRemove(change.doc.id, change.doc.data());
        }
    }

    onAdd(id, record) {

    }

    onRemove(id, record) {

    }

    onModify(id, record) {

    }

    onComplete() {

    }
}

export default FirebaseListener;
