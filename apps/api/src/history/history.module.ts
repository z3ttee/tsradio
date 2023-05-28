import { Module } from "@nestjs/common";
import { HistoryService } from "./services/history.service";
import { HistoryController } from "./controllers/history.controller";

@Module({
    controllers: [
        HistoryController
    ],
    providers: [
        HistoryService
    ],
    imports: [
        
    ],
    exports: [
        HistoryService
    ]
})
export class HistoryModule {}