import { DataManager } from "@syncfusion/ej2-data";

//import firebaseCredential from './firebase-ro.json'
import DataModel from './DataModel';
import Firebase from './Firebase';

let firebaseConfig = {
    apiKey: "AIzaSyBppYG_IlpAhnm5dOcHxq3eUlo0Lz6dCIY",
    authDomain: "hrt-strong.firebaseapp.com",
    databaseURL: "https://hrt-strong.firebaseio.com",
    projectId: "hrt-strong",
    project_id: "hrt-strong",
    storageBucket: "hrt-strong.appspot.com",
    messagingSenderId: "897811013450"
};

export class App {
    constructor() {
        this.firebase = new Firebase(firebaseConfig);
        this.dm = new DataManager([]);
        //this.table = new Table(this.dm);
        // this.listener = new DataManagerListener(this.dm, r => [r.email, r.createTime].join("-"))
        // this.firebase.addListener(
        //     this.firebase.store.collection("leaderboard"),
        //     this.listener
        // );

        this.dataModel = new DataModel(this.firebase, this.dm);
    }
}

export default App;
