import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
    standalone: true,
    selector: "tsr-header",
    templateUrl: "./header.component.html",
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class TSRHeaderComponent {

}