export class SFNotifier {
    constructor() {
        this.subscribers = [];
    }

    onComplete() {
        for(let t of this.subscribers) {
            t.onUpdate();
        }
    }

    subscribeUpdate(f) {
        this.subscribers.push(f);
    }


}

export default SFNotifier;
