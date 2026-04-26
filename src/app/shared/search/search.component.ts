import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html'
})
export class SearchComponent {

  /** Placeholder text */
  @Input() placeholder = 'Search...';

  /** Emit when user types */
  @Output() search = new EventEmitter<string>();

  /** Emit when cleared */
  @Output() cleared = new EventEmitter<void>();

  value = '';

  private input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(v => this.search.emit(v));
  }

  onInput(val: string) {
    this.value = val;
    this.input$.next(val);
  }

  clear() {
    this.value = '';
    this.search.emit('');
    this.cleared.emit();
  }
}
