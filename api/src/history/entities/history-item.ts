import { Track } from "src/streams/entities/track";

export class HistoryItem {

    public readonly streamedAt: number = Date.now();

    constructor(
        public readonly track: Track
    ) {}

}