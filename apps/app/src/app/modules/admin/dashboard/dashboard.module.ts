import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardIndexViewComponent } from "./views/dashboard-index/dashboard-index.component";
import { TSRPage } from "../../../components";

const routes: Routes = [
    { path: "", component: DashboardIndexViewComponent },
];

@NgModule({
    declarations: [
        DashboardIndexViewComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TSRPage
    ]
})
export class AdminDashboardModule {}