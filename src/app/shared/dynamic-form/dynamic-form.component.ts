import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DynamicField, DynamicFormSchema } from "./dynamic-form.types";
import { OnChanges, SimpleChanges } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subscription } from "rxjs";
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UploadService } from '../../core/services/upload.service';
import { ReusableImageUploadComponent } from "../reusable-image-upload/reusable-image-upload.component";

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, ReusableImageUploadComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit, OnChanges{

    @Input() schema!: DynamicFormSchema;
    @Input() data: any[] = [];

    @Output() submitted = new EventEmitter<any>();
    @Output() imageChanged = new EventEmitter<any>();
    @Input() loading = false;
    @Input() showImageSaveButton = false;

    form!: FormGroup;
    grouped: Record<string, DynamicField[]> = {};
    collapsed: Record<string, boolean> = {};
    isSubmitting = false;
    isDirty = false;
    autoSaveSub?: Subscription;
    private skipNextAutoSave = false;
    initialValue: any = {};
    imageState: Record<string, any[]> = {};

    asFormControl(ctrl: any): FormControl {
        return ctrl as FormControl;
    }

    constructor(
        private fb: FormBuilder,
        private uploadService: UploadService
    ) {}

    ngOnInit() {
        
    }

    @HostListener('window:beforeunload', ['$event'])
    handleUnload(event: BeforeUnloadEvent) {
        if (this.isDirty && !this.loading) {
            event.preventDefault();
            event.returnValue = true;
        }
    }

    ngOnChanges(changes: SimpleChanges) {

        // ✅ Rebuild form when data arrives
        if (changes['data'] && this.data?.length) {
            this.buildForm();
            this.groupFields();
            this.setupAutoSave();

            this.initialValue = this.cleanFormValue(this.form.value);
        }

        // ✅ Prevent crash
        if (!this.form) return;

        // Reset dirty after save
        if (!this.loading) {
            this.isDirty = false;
        }

        // Enable / disable form
        if (this.loading) {
            this.form.disable({ emitEvent: false });
        } else {
            this.form.enable({ emitEvent: false });
        }

    }

    getDiff(current: any, initial: any) {
        const diff: any = {};

        Object.keys(current).forEach(key => {
            const curr = current[key];
            const init = initial[key];

            if (Array.isArray(curr)) {
            if (JSON.stringify(curr) !== JSON.stringify(init)) {
                diff[key] = curr;
            }
            } else {
            if (curr !== init) {
                diff[key] = curr;
            }
            }
        });

        return diff;
    }

    buildForm() {
        console.log('Building form with:', this.data);

        const group: any = {};

        this.schema.fields.forEach(field => {
            const normalizedKey = this.normalizeKey(field.key);
            const value = this.getNestedValue(field.key);

            if (field.type === 'array') {
            group[normalizedKey] = this.fb.array(
                (value || []).map((v: any) => this.fb.control(v))
            );

            } else if (field.type === 'number') {
            group[normalizedKey] = [value ?? 0];

            } else if (field.type === 'boolean') {
            group[normalizedKey] = [!!value];

            } else if (field.type === 'image') {
            // 🔥 IMPORTANT: don't bind image to form value
            group[normalizedKey] = [value ?? null];

            } else {
            group[normalizedKey] = [value ?? null];
            }
        });

        this.form = this.fb.group(group);
    }

    groupFields() {
        this.grouped = {};

        this.schema.fields.forEach(field => {
        const group = field.group || 'Other';

        if (!this.grouped[group]) {
            this.grouped[group] = [];
            this.collapsed[group] = false;
        }

        this.grouped[group].push(field);
        });
    }

    toggle(group: string) {
        this.collapsed[group] = !this.collapsed[group];
    }

    getArray(key: string): FormArray {
        return this.form.get(this.normalizeKey(key)) as FormArray;
    }

    addItem(key: string) {
        const arr = this.getArray(key);
        const hasEmpty = arr.controls.some(c => !c.value || c.value.trim() === '');
        if (hasEmpty) return; // 🚫 prevent adding if empty exists
        arr.push(this.fb.control('', { nonNullable: true }));
    }

    isInvalidArrayItem(key: string, index: number): boolean {
        const arr = this.getArray(key);
        const value = arr.at(index).value;

        if (!value || value.trim() === '') return true;

        // duplicate check
        const duplicates = arr.value.filter((v: string) => v === value);
        return duplicates.length > 1;
    }

    removeItem(key: string, index: number) {
        const arr = this.getArray(key);

        this.skipNextAutoSave = true;
        arr.removeAt(index);

        // ✅ Immediately emit cleaned value
        const cleanedValue = this.cleanFormValue(this.form.value);
        this.submitted.emit(cleanedValue);
    }

    setupAutoSave() {
        this.autoSaveSub?.unsubscribe();

        this.autoSaveSub = this.form.valueChanges
            .pipe(debounceTime(800))
            .subscribe(value => {

            if (this.loading) return;

            if (this.skipNextAutoSave) {
                this.skipNextAutoSave = false;
                return;
            }

            const cleaned = this.cleanFormValue(value);
            const diff = this.getDiff(cleaned, this.initialValue);

            if (Object.keys(diff).length === 0) return;

            // 🔥 ADD THIS BLOCK
            const hasManualField = Object.keys(diff).some(key => {
                const field = this.schema.fields.find(f => f.key === key);
                return field?.autoSave === false;
            });

            if (hasManualField) {
                return; // ❌ skip auto-save for image
            }

            this.isDirty = true;

            this.submitted.emit(diff);

            this.initialValue = { ...this.initialValue, ...diff };
        });
    }

    cleanFormValue(value: any) {
        const cleaned: any = {};

        Object.keys(value).forEach(key => {
            const v = value[key];
            const field = this.schema.fields.find(f => f.key === key);

            if (field?.type === 'array') {
                cleaned[key] = v.filter((item: string) => item && item.trim() !== '');
            } else if (field?.type === 'number') {
                cleaned[key] = v === null || v === '' ? 0 : Number(v);
            } else {
                cleaned[key] = v;
            }
        });

        return cleaned;
    }

    cleanupArray(key: string, index: number) {
        const arr = this.getArray(key);
        const value = arr.at(index).value;

        if (!value || value.trim() === '') {
            arr.removeAt(index);
        }
    }

    onFieldBlur() {
        if (!this.loading && this.form.valid) {
            this.submitted.emit(this.form.value);
        }
    }

    isArrayItemChanged(key: string, index: number): boolean {
        const current = this.getArray(key).at(index).value;
        const initial = this.initialValue?.[key]?.[index];

        return current !== initial;
    }

    drop(key: string, event: CdkDragDrop<string[]>) {
        const arr = this.getArray(key);
        const current = arr.value;
        moveItemInArray(current, event.previousIndex, event.currentIndex);
        arr.setValue(current); // 🔥 update form
        this.submitted.emit(this.cleanFormValue(this.form.value)); // save
    }

    isDuplicateArrayItem(key: string, index: number): boolean {
        const arr = this.getArray(key);
        const value = arr.at(index).value;

        if (!value) return false;

        const duplicates = arr.value.filter((v: string) => v === value);
        return duplicates.length > 1;
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    

    //REUSABLE COMPONENT UPLOAD IMAGE
    getImageFieldValue(key: string) {

        // 1. user uploaded image
        if (this.imageState && key in this.imageState) {
            return this.imageState[key]; // even if []
        }

        // 2. fallback to existing value
        const normalizedKey = this.normalizeKey(key);
        const value = this.form.get(normalizedKey)?.value;

        if (!value) return [];

        return [
            {
            preview: value,
            isPrimary: true
            }
        ];
    }

    onImageChange(key: string, images: any[]) {
        console.log('🔥 IMAGE CHANGE TRIGGERED', key, images);

        this.imageState[key] = images;

        this.imageChanged.emit({ key, images });
        this.isDirty = true;
    }

    getNestedValue(key: string): any {
        const parts = key.split('.');
        const parentKey = parts[0];
        const childKey = parts[1];

        const parent = this.data.find(d => d.key === parentKey);

        if (!parent) return null;

        if (!childKey) return parent.value;

        return parent.value?.[childKey];
    }

    normalizeKey(key: string): string {
        return key.replace(/\./g, '__'); // or '_'
    }

    hasImageChanges(): boolean {
        if (!this.imageState) return false;

        return Object.keys(this.imageState).some(key => {
            const images = this.imageState[key];
            const original = this.getNestedValue(key);

            // 🔥 Case 1: user removed image
            if ((!images || images.length === 0) && original) {
            return true;
            }

            // 🔥 Case 2: user uploaded new image
            if (images && images.some(img => img.file)) {
            return true;
            }

            return false;
        });
    }

    emitImageSave() {
        if (this.loading) return;
        this.submitted.emit({});
    }

    

    // submit() {
    //     if (this.form.invalid) return;
    //     this.isSubmitting = true;
    //     const result = this.submitted.emit(this.form.value);
    // }
}