import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TSAFilledButtonComponent } from "./filled/filled.component";
import { TSATextButtonComponent } from "./text/text.component";
import { TSAStrokedButtonComponent } from "./stroked/stroked.component";

@NgModule({
  imports: [CommonModule, TSAFilledButtonComponent, TSATextButtonComponent, TSAStrokedButtonComponent],
  exports: [TSAFilledButtonComponent, TSATextButtonComponent, TSAStrokedButtonComponent]
})
export class TSAButtonModule {}
