export class User {
    constructor(raw) {
        this.userName = raw.name
        this.email = raw.email
    }
}

export class Exercise {
    constructor(raw) {
        this.name = raw.name;
        this.points = raw.points;

    }
}

export class Entry {
    constructor(raw) {

    }

    weekKey() {

    }

    dayKey() {

    }
}

export class LeaderboardRow {
    constructor(raw) {

    }
}


export default User;
