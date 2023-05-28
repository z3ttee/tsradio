import { Track } from "../../streams/entities/track";

export class HistoryItem {

    public readonly streamedAt: number = Date.now();

    constructor(
        public readonly track: Track
    ) {}

}