import firebase from "firebase";

export class Firebase {
    constructor(config) {
        config.projectId = config.project_id;
        this.firebase = firebase.initializeApp(config);
        this.store = this.firebase.firestore();
    }

    addListener(query, listener) {
        let receivedSnapshot = false;
        query.onSnapshot(snapshot => {
            let changes = snapshot.docChanges();
            console.log("Firebase: received %s (%d records)",
                        receivedSnapshot ? "update" : "snapshot", changes.length);
            listener.onChanges(changes);
        });
    }
}

export default Firebase;
