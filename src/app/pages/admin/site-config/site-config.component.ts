import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { SiteConfigAdminService } from '@app/services/admin/admin-site-config.service';
import { SITE_CONFIG_META, SITE_CONFIG_GROUP_UI } from './site-config.meta';
import { DynamicFormComponent } from "@app/shared/dynamic-form/dynamic-form.component";
import { DynamicFormSchema } from '@app/shared/dynamic-form/dynamic-form.types';
import { UploadService } from '@app/core/services/upload.service';
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
    imageState: Record<string, any[]> = {};

    schema: DynamicFormSchema = {
        fields: Object.keys(SITE_CONFIG_META).map(key => ({
            key,
            ...SITE_CONFIG_META[key]
        })),
        groupUI: SITE_CONFIG_GROUP_UI
    };

    constructor(
        private service: SiteConfigAdminService,
        private uploadService: UploadService,
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
        if (this.isSaving) return;

        

        const numericKeys = [
            'shipping.baseFee',
            'shipping.freeThreshold',
            'shipping.sameProvinceFee',
            'shipping.otherProvinceFee'
        ];
        
        this.isSaving = true;

        const finalDiff: any = { ...diff };
        const imageKeys = Object.keys(this.imageState);
        const uploads: Promise<void>[] = [];

        imageKeys.forEach(key => {

            const images = this.imageState[key];

            // 🔥 CASE 1: user REMOVED image
            if (!images || images.length === 0) {
                finalDiff[key] = null; // 👈 VERY IMPORTANT
                return;
            }

            // 🔥 CASE 2: user uploaded new image
            const main = images.find(i => i.isPrimary) || images[0];

            if (main?.file) {
                const uploadPromise = this.uploadService.upload(main.file)
                    .toPromise()
                    .then((res: any) => {

                        const url = res?.data?.url;

                        if (url) {
                            finalDiff[key] = url;
                        }
                    });

                uploads.push(uploadPromise);
            }
        });

        Promise.all(uploads).then(() => {

            console.log('FINAL DIFF:', finalDiff);

            if (!Object.keys(finalDiff).length) {
                this.isSaving = false;
                return;
            }

            this.submitDiff(finalDiff, numericKeys);
        });
    }

    private submitDiff(diff: any, numericKeys: string[]) {
        // ✅ STEP 1: convert keys back to original (dot format)
        const finalDiff: any = {};

        Object.keys(diff).forEach(k => {
            const originalKey = this.denormalizeKey(k);
            finalDiff[originalKey] = diff[k];
        });

        // ✅ STEP 2: build payload using corrected keys
        const payload = Object.keys(finalDiff).map(key => ({
            key,
            value: numericKeys.includes(key)
            ? Number(finalDiff[key])
            : finalDiff[key]
        }));

        console.log('FINAL REQUEST BODY:', { configs: payload });

        this.service.updateBulk({ configs: payload }).subscribe({
            next: () => {
                this.isSaving = false;
                this.toastr.success('Site configuration saved');
                this.imageState = {};
                this.loadSiteConfigs();
            },
            error: () => {
                this.isSaving = false;
                this.toastr.error('Failed to save site configuration');
            }
        });
    }

    private buildPayload(diff: any) {
        const grouped: Record<string, any> = {};

        Object.keys(diff).forEach(key => {
            const parts = key.split('.');
            const parent = parts[0];
            const child = parts[1];

            if (!child) {
            grouped[parent] = diff[key];
            } else {
            if (!grouped[parent]) grouped[parent] = {};
            grouped[parent][child] = diff[key];
            }
        });

        return Object.keys(grouped).map(key => ({
            key,
            value: grouped[key]
        }));
    }

    onImageChanged(event: { key: string; images: any[] }) {
        console.log('🔥 SiteConfig received:', event);
        this.imageState[event.key] = event.images;
    }

    denormalizeKey(key: string): string {
        return key.replace(/__/g, '.');
    }

}
