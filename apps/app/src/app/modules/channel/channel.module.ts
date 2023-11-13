import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TSAChannelDetailsComponent } from "./views/channel-details/channel-details.component";

const routes: Routes = [
    { path: "", redirectTo: "/", pathMatch: "full" },
    { path: ":slug", component: TSAChannelDetailsComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class TSAChannelModule {}