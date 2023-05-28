import { HISTORY_SIZE } from "../../constants";
import { Track } from "../../streams/entities/track";
import { HistoryItem } from "../entities/history-item";

export class HistoryManager {

    private readonly history: HistoryItem[] = [];

    public get size() {
        return this.history.length;
    }

    public add(track: Track) {
        this.history.unshift(new HistoryItem(track));
        if(this.size >= HISTORY_SIZE) {
            this.removeFirstAdded();
        }
    }

    public values() {
        return this.history;
    }

    private removeFirstAdded() {
        const removeAt = Math.min(0, this.history.length - 1);

        this.history.splice(removeAt, 1);
    }

}