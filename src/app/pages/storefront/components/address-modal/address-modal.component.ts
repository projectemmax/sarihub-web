import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss']
})
export class AddressModalComponent {
    @Input() visible = false;
    @Input() editingAddress: any = null;

    @Input() regions: any[] = [];
    @Input() provinces: any[] = [];
    @Input() cities: any[] = [];
    @Input() barangays: any[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();
    @Output() regionChange = new EventEmitter<string>();
    @Output() provinceChange = new EventEmitter<string>();
    @Output() cityChange = new EventEmitter<string>();

    isClosing = false;
    readonly NCR_REGION_CODE = '130000000';

    closeModal(): void {
        this.isClosing = true;

        setTimeout(() => {
            this.isClosing = false;
            this.close.emit();
        }, 200);
    }

    constructor(private fb: FormBuilder) {}

    readonly form = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        region: ['', Validators.required],
        province: [''],
        city: ['', Validators.required],
        barangay: ['', Validators.required],
        address: ['', Validators.required]
    });

    ngOnChanges(changes: SimpleChanges): void {

        // only react when the modal becomes visible
        if (
            changes['visible'] &&
            changes['visible'].currentValue === true
        ) {
            if (this.editingAddress) {
                this.form.patchValue({
                    name: this.editingAddress.name,
                    phone: this.editingAddress.phone,
                    region: this.editingAddress.regionCode,
                    province: this.editingAddress.provinceCode,
                    city: this.editingAddress.cityCode,
                    barangay: this.editingAddress.barangay,
                    address: this.editingAddress.address
                });

                const region = this.form.get('region')?.value;

                if (region === this.NCR_REGION_CODE) {
                this.form.get('province')?.disable();
                this.form.get('province')?.clearValidators();
                this.form.get('province')?.setValue('');
                } else {
                this.form.get('province')?.enable();
                this.form.get('province')?.setValidators(Validators.required);
                }

                this.form.get('province')?.updateValueAndValidity();

            } else {
                this.form.reset({
                    name: '',
                    phone: '',
                    region: '',
                    province: '',
                    city: '',
                    barangay: '',
                    address: ''
                });
            }
        }
    }

    onRegionChanged(regionCode: string): void {
        if (regionCode === this.NCR_REGION_CODE) {
            this.form.patchValue({
                province: '',
                city: '',
                barangay: ''
            });

            this.form.get('province')?.disable();
            this.form.get('province')?.clearValidators();
        } else {
            this.form.get('province')?.enable();
            this.form.get('province')?.setValidators(Validators.required);
        }

        this.form.get('province')?.updateValueAndValidity();

        this.regionChange.emit(regionCode);
    }

    onSave(): void {
        if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
        }

        this.save.emit(this.form.getRawValue());
    }
}