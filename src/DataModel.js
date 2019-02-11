import FirebaseIndex from './FirebaseIndex';
import SFNotifier from './SFNotifier';

const DAY_MAX = 16;

function aggregateDay(activities) {
    // let tot = 0;

    // for(let a of activities) {
    //     a.points = min(a.rawPoints, max(0, DAY_MAX - tot));
    //     tot += a.points;
    //     a.point += 2 ? a.bonusPoints : 0;
    // }

    // return tot;
}


export class DataModel extends SFNotifier {
    constructor(firebase, manager) {
        super();

        this.manager = manager;

        this.users = new FirebaseIndex("email", [], x => true, this.onRecalcAllUpdate);
        firebase.addListener(
            firebase.store.collection("users"),
            this.users
        );

        this.activities = new FirebaseIndex("activity", [], x => this.enrichActivity(x), this.onRecalcAllUpdate);
        firebase.addListener(
            firebase.store.collection("activities"),
            this.activities
        );

        this.leaderboard = new FirebaseIndex("_id", [], x => this.enrichLeaderboard(x), this.onLeaderboardUpdate);
        firebase.addListener(
            firebase.store.collection("leaderboard"),
            this.leaderboard
        );
    }

    enrichActivity(activity) {
        activity.ppm = activity.points / activity.duration;
        return true;
    }

    enrichLeaderboard(entry) {
        console.assert(this.leaderboard.isPopulated());

        if (!entry.email || !entry.activity) {
            console.warn("could not find email or activity for", entry);
            return false;
        }

        let user = this.users.find(entry.email);
        let activity = this.activities.find(entry.activity);
        if (!user || !activity) {
            console.warn("could not find user or activity for", entry, user, activity);
            return false;
        }

        entry.teamName = user.team;
        entry.userName = user.name;
        entry.rawPoints = entry.duration > activity.minDuration ? entry.duration * activity.ppm : 0;

        return true;
    }

    onLeaderboardUpdate(added, removed, changed) {
        if(!this.isReady()) return false;

        for (let id of added) {
            let e = this.entries.find(id);
        }
    }

    onRecalcAllUpdate(ids, groupids) {
        if(!this.isReady()) return false;

        this.recalcAll();
        this.onComplete();
    }

    recalcAll() {
        for(let [k, v] of this.leaderboard.index) {
            this.manager.update(this.recordField, v);
        }
    }

    isReady() {
        if (!this.users.isPopulated() ||
            !this.activities.isPopulated() ||
            !this.leaderboard.isPopulated()) {
            return false;
        }

        return true;
    }
}

export default DataModel;
