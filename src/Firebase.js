import firebase from "firebase";

export class Firebase {
    constructor(config) {
        config.projectId = config.project_id;
        this.firebase = firebase.initializeApp(config);
        this.store = this.firebase.firestore();

        this.store.enablePersistence();
    }

    addListener(query, listener) {
        let receivedSnapshot = false;
        query.onSnapshot({ includeMetadataChanges: true }, snapshot => {
            let changes = snapshot.docChanges();
            console.log("Firebase: received %s (%d records, fromCache = %d)",
                        receivedSnapshot ? "update" : "snapshot", changes.length, snapshot.metadata.fromCache);
            if (changes.length) {
                listener.onChanges(changes);
            }
        });
    }
}

export default Firebase;
