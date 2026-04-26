import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {

  @Input() placeholder = 'Search products';
  @Input() value = '';

  @Output() searchChange = new EventEmitter<string>();

  searchCtrl = new FormControl('');

  ngOnInit() {
    // initialize value (for deep links / query params)
    this.searchCtrl.setValue(this.value, { emitEvent: false });

    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchChange.emit(value?.trim() || '');
      });
  }

  clear() {
    this.searchCtrl.setValue('');
    this.searchChange.emit('');
  }
}