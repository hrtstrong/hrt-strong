import FirebaseIndex from './FirebaseIndex';
import SFNotifier from './SFNotifier';

const DAY_MAX = 16;

function getDay(e) {
    return e.date.toISOString().slice(0,10);
}

function getDayId(e) {
    return [e.email, getDay(e)].join(":")
}

function getWeek(e) {
    function getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return [d.getUTCFullYear(), weekNo];
    }

    return getWeekNumber(e.date).join(":");
}

function getWeekId(e) {
    return [e.email, getWeek(e)].join(":")
}

function seek(map, better) {
    let curKey, curValue = null;

    for (let k of Object.keys(map)) {
        let v = map[k];

        if (!curValue || better(v, curValue)) {
            curKey = k;
            curValue = v;
        }
    }

    return curKey;
}

function aggregateWeek(activities) {
    let tots = {};

    for (let a of activities) {
        tots[getDayId(a)] = (tots[getDayId(a)] || 0) + a.rawPoints * !a.tooLate;
    }

    let worstDay = seek(tots, (n,c) => n < c);
    let bestDay = seek(tots, (n,c) => n > c);

    let n = Object.keys(tots).length;
    console.assert(n <= 7);

    for (let a of activities) {
        let thisDay = getDayId(a);
        if (n >= 7 && thisDay === worstDay) {
            a.dayPoints = 0;
            addReason(a, 'worstDay');
        } else if (thisDay === bestDay) {
            a.dayPoints = a.rawPoints * !a.tooLate;
            addReason(a, "bestDay");
        }

        a.points = a.dayPoints + a.spiritPoints + a.bonusPoints;
    }
}

function aggregateDay(activities) {
    let tot = 0;
    let bonus = [0, 0, 0, 0];

    for(let a of activities) {
        a.reasons = [];
        a.dayPoints = Math.min(a.rawPoints, Math.max(0, DAY_MAX - tot));
        if (a.tooLate) {
            a.dayPoints = 0;
            addReason(a, "loggedTooLate");
        } else if (a.dayPoints !== a.rawPoints) {
            addReason(a, "> dailyLimit");
        }

        tot += a.dayPoints;

        a.spiritPoints = a.spirit ? 1 : 0;
        a.bonusPoints = 0;
        for (let i = 0; i < a.bonus.length; i++) {
            bonus[i] = bonus[i] || a.bonus[i];
        }
    }

    if (activities.length) {
        let a = activities[activities.length - 1];
        let bonusPoints = Math.min(2, bonus.reduce((x,y) => x + y, 0));
        a.bonusPoints = bonusPoints || 0;
    } else {
        console.assert(bonus.reduce((x,y)=>x+y, 0));
    }
}

function aggregateUser(activities) {
    let tot = activities.reduce((t,a) => a.points + t, 0)

    for(let a of activities) {
        a.userPoints = tot;

        let strTot = String(Math.trunc(tot));
        a.userSort = ("      " + strTot).substr(-6) + " - " + a.userName;
    }
}

function aggregateTeam(activities) {
    let tot = activities.reduce((t,a) => a.points + t, 0)

    for(let a of activities) {
        let strTot = String(Math.trunc(tot));
        a.teamSort = ("      " + strTot).substr(-6) + " - " + a.teamName;
    }
}


function addReason(entry, reason) {
    if (!entry.reasons) entry.reasons = [];

    if (entry.reasons.indexOf(reason) < 0) {
        entry.reasons.push(reason);
    }
}

export class DataModel extends SFNotifier {
    constructor(firebase, manager) {
        super();

        this.manager = manager;
        this.subscribers = [];
        this.populatedGrid = false;

        this.users = new FirebaseIndex(
            "email",
            [],
            x => true,
            () => this.onRecalcAllUpdate()
        );
        firebase.addListener(
            firebase.store.collection("users"),
            this.users
        );

        this.activities = new FirebaseIndex(
            "_id",
            [],
            x => this.preEnrichActivity(x),
            () => this.onRecalcAllUpdate()
        );
        firebase.addListener(
            firebase.store.collection("activities"),
            this.activities
        );

        this.leaderboard = new FirebaseIndex(
            "_id",
            [],
            x => this.preEnrichLeaderboard(x),
            (a,r,c,g) => this.onLeaderboardUpdate(a,r,c,g)
        );
        firebase.addListener(
            firebase.store.collection("leaderboard"),
            this.leaderboard
        );

        this.leaderboardEnriched = new FirebaseIndex(
            "_id",
            [getDayId, getWeekId, "email", "teamName"],
            x => true,
            (a,r,c,g) => this.onLeaderboardEnrichedUpdate(a,r,c,g)
        );
    }

    preEnrichActivity(activity) {
        activity.ppm = activity.unitPoints / activity.unitDuration;
        return true;
    }

    preEnrichLeaderboard(entry) {
        entry.createTime = entry.createTime.toDate();
        entry.date = entry.date.toDate();

        entry.tooLate = ((entry.createTime - entry.date) / 1000 / 3600 > 60);

        entry.dayId = getDayId(entry);
        entry.weekId = getWeekId(entry);

        entry.reason = "";
    }

    enrichLeaderboard(entry) {
        console.assert(this.leaderboard.isPopulated());

        if (!entry.email || !entry.activity) {
            console.warn("could not find email or activity for", entry);
        }

        let user = this.users.find(entry.email);
        let activity = this.activities.find(entry.activity);
        if (!user || !activity) {
            console.warn("could not find user or activity for", entry, user, activity);
            if (!user) {
                user = {};
            }

            if (!activity) {
                activity = {};
            }
        }

        entry.teamName = user.team;
        entry.userName = user.name;
        entry.activityName = activity.name;
        entry.rawPoints = (entry.duration >= activity.minDuration ? entry.duration * activity.ppm : 0) || 0;
        if (entry.duration < activity.minDuration) {
            addReason(entry, "< minDuration")
        }

        return true;
    }

    processGroup(groups, groupType, process, allModified) {
        for(let groupId of Object.keys(groups[groupType])) {
            let group = this.leaderboardEnriched.getGroup(groupType, groupId);
            process(group);
            for(let g of group) {
                allModified[g._id] = g;
            }
        }
    }

    onLeaderboardUpdate(added, removed, changed, groups) {
        console.log("onLeaderboardUpdate");
        if(!this.isReady()) return false;
        console.log(added, removed, changed, groups);

        for (let id of Object.keys(added)) {
            let e = this.leaderboard.find(id);
            this.enrichLeaderboard(e);
            this.leaderboardEnriched.onAdd(id, e);
        }

        for (let id of Object.keys(changed)) {
            let e = this.leaderboard.find(id);
            this.enrichLeaderboard(e);
            this.leaderboardEnriched.onModify(id, e);
        }

        for (let id of Object.keys(removed)) {
            this.leaderboardEnriched.onRemove(id, this.leaderboardEnriched.find(id));
        }

        this.leaderboardEnriched.onComplete();
    }

    onLeaderboardEnrichedUpdate(added, removed, changed, groups) {
        console.log("onLeaderboardEnrichedUpdate");
        console.log(added, removed, changed, groups);

        // groups
        let allModified = changed;
        this.processGroup(groups, getDayId, aggregateDay, allModified);
        this.processGroup(groups, getWeekId, aggregateWeek, allModified);
        this.processGroup(groups, "email", aggregateUser, allModified);
        this.processGroup(groups, "teamName", aggregateTeam, allModified);

        for (let id of Object.keys(added)) {
            let e = this.leaderboardEnriched.find(id);
            this.manager.insert(e);
        }

        for (let id of Object.keys(allModified)) {
            let e = this.leaderboardEnriched.find(id);
            this.manager.update("_id", e);
        }

        for (let id of Object.keys(removed)) {
            let e = this.leaderboardEnriched.find(id);
            this.manager.remove("_id", e);
        }

        if (Object.keys(allModified).length) {
            this.onComplete();
        }
    }

    onRecalcAllUpdate(a, r, c, g) {
        console.log("onRecalcAllUpdate");
        if(!this.isReady()) return false;

        this.recalcAll();
        this.onComplete();
    }

    recalcAll() {
        let first = !this.populatedGrid;
        console.log("recalcAll first", first);

        let keys = {}
        this.leaderboard.index.forEach((v,k) => keys[k] = true);

        if (first) {
            this.onLeaderboardUpdate(keys, {}, {}, this.leaderboard.groupIndexes);
        } else {
            this.onLeaderboardUpdate({}, {}, keys, this.leaderboard.groupIndexes);
        }
    }

    onComplete() {
        console.log("onComplete called");
        this.populatedGrid = true;
        for(let t of this.subscribers) {
            t.onUpdate();
        }
    }

    subscribeUpdate(f) {
        this.subscribers.push(f);
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
