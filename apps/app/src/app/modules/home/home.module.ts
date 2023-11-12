import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeViewComponent } from "./views/home-view/home.component";
import { TSAArtwork } from "../../components/artwork";

const routes: Routes = [
    { path: "", component: HomeViewComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TSAArtwork
    ]
})
export class HomeModule {

}