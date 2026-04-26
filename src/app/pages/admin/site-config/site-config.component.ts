import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { SiteConfigAdminService } from '@app/services/admin/admin-site-config.service';
import { SITE_CONFIG_META, SITE_CONFIG_GROUP_UI } from './site-config.meta';
import { DynamicFormComponent } from "@app/shared/dynamic-form/dynamic-form.component";
import { DynamicFormSchema } from '@app/shared/dynamic-form/dynamic-form.types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-site-config',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DynamicFormComponent],
  templateUrl: './site-config.component.html',
  styleUrl: './site-config.component.css'
})
export class SiteConfigComponent implements OnInit {

    meta = SITE_CONFIG_META;
    groupUI = SITE_CONFIG_GROUP_UI;
    form!: FormGroup;
    configs: any[] = [];
    groupedConfigs: Record<string, any[]> = {};
    // track collapse state
    collapsed: Record<string, boolean> = {};
    isSaving = false;

    schema: DynamicFormSchema = {
        fields: Object.keys(SITE_CONFIG_META).map(key => ({
            key,
            ...SITE_CONFIG_META[key]
        })),
        groupUI: SITE_CONFIG_GROUP_UI
    };

    constructor(
        private service: SiteConfigAdminService,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.loadSiteConfigs();
    }

    loadSiteConfigs() {
        this.service.getAll().subscribe((res: any) => {
            console.log('API DATA:', res);
            this.configs = res.data ?? [];
        });
    }

    save(diff: any) {
        const numericKeys = [
            'shipping.baseFee',
            'shipping.freeThreshold',
            'shipping.sameProvinceFee',
            'shipping.otherProvinceFee'
        ];

        const payload = Object.keys(diff).map(key => ({
            key,
            value: numericKeys.includes(key)
            ? Number(diff[key])
            : diff[key]
        }));

        this.isSaving = true;

        this.service.updateBulk(payload).subscribe({
            next: () => {
            this.isSaving = false;
            this.toastr.success('Site configuration saved');
            },
            error: () => {
            this.isSaving = false;
            this.toastr.error('Failed to save site configuration');
            }
        });
    }
}
