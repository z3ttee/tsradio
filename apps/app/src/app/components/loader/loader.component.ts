import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  ViewChild
} from "@angular/core";
import { isNull } from "@tsa/utilities";

@Component({
  standalone: true,
  selector: "tsa-loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class TSALoaderComponent implements AfterViewInit {
  @ViewChild("spinner")
  protected element?: ElementRef<HTMLDivElement>;

  @Input()
  public strokeWidth = 3;

  @Input()
  public size?: number;

  @Input()
  public speed = 1;

  /**
   * Activate dark mode. This means
   * the loader will be white. When set to `false` the loader
   * gets black
   * Defaults to `false`
   */
  @Input()
  public dark = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  public ngAfterViewInit(): void {
    if (
      typeof this.element?.nativeElement !== "undefined" &&
      this.element?.nativeElement != null &&
      isNull(this.size)
    ) {
      const lineHeight = parseInt(window.getComputedStyle(this.element?.nativeElement).lineHeight);
      this.size = (isNaN(lineHeight) ? 21 : lineHeight) - 5;
      this.cdr.detectChanges();
    }
  }
}
