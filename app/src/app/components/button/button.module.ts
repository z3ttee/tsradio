import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NGSFilledButtonComponent } from "./filled/filled.component";
import { NGSStrokedButtonComponent } from "./stroked/stroked.component";
import { NGSTextButtonComponent } from "./text/text.component";

@NgModule({
    imports: [
        CommonModule,
        NGSFilledButtonComponent,
        NGSStrokedButtonComponent,
        NGSTextButtonComponent
    ],
    exports: [
        NGSFilledButtonComponent,
        NGSStrokedButtonComponent,
        NGSTextButtonComponent
    ]
})
export class NGSButtonModule {}