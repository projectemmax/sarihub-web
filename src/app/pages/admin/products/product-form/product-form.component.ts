import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeneratedProductDescription } from '@app/models/ai-product-description.model';
import { DynamicSection } from '@app/models/dynamic-form.model';
import { ProductImage } from '@app/models/product-image.model';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '@app/services/product/product.service';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '@app/services/category/category.service';
import { getImageUrl, getImageUrlCloudinary } from '@app/core/utils/image.util';
import { ToastService } from '@app/core/services/toast.service';
import { CanComponentDeactivate } from '@app/guards/unsaved-changes.guard';
import { ReusableImageUploadComponent } from "@app/shared/reusable-image-upload/reusable-image-upload.component";
import { AuthService } from '@app/core/auth/auth.service';
import { SellerAiService } from '@app/services/seller/seller-ai.service';

interface VariantOption {
  name: string;
  values: string[];
  locked?: boolean;
}

interface Variant {
  attributes: { [key: string]: string };
  price: number;
  stock: number;
  sku: string;
  manualSku?: boolean;
  image?: string;
}

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDropzoneModule,
    ReusableImageUploadComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
],
    templateUrl: './product-form.component.html',
    styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit, CanComponentDeactivate {

    form!: FormGroup;
    files: File[] = [];
    images: ProductImage[] = [];
    isEditMode = false;
    productId!: string;
    deletedImageIds: string[] = [];
    categories: any[] = [];
    variantOptions: VariantOption[] = [];
    loadingIndex: number | null = null;
    isSubmitting = false;
    initialVariantsSnapshot = '';
    initialFormValue: any = {};
    initialVariantOptionsSnapshot = '';
    isInitialized = false;
    hasVariantsToggle = false;
    selectedCategory: any = null;
    isGeneratingDescription = false;
    generatedProductDescription: GeneratedProductDescription | null = null;
    canUseProductAi = false;
    aiBrand = '';
    aiFeatures = '';
    aiSpecifications = '';
    

    getImageUrl = getImageUrl;
    getImageUrlCloudinary = getImageUrlCloudinary;

    canDeactivate(): boolean {
        if (this.isSubmitting) return true;

        if (this.form.dirty || this.hasVariantChanges()) {
            return confirm('You have unsaved changes. Are you sure you want to leave?');
        }

        return true;
    }

    formSections: DynamicSection[] = [
        {
        section: 'Basic Info',
        fields: [
            { key: 'name', type: 'text', label: 'Product Name', required: true },
            { key: 'description', type: 'textarea', label: 'Description' },
            { key: 'shortDescription', type: 'textarea', label: 'Short Description' },
            { key: 'seoDescription', type: 'textarea', label: 'SEO Description' },
            { key: 'sku', type: 'text', label: 'Base product SKU', required: false },
            { key: 'categoryId', type: 'select', label: 'Category', required: true }
            ]
        },
        {
        section: 'Pricing',
            fields: [
                { key: 'price', type: 'number', label: 'Price', required: false },
                { key: 'stock', type: 'number', label: 'Stock', required: false }
            ]
        }
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private productService: ProductService,
        private sellerAiService: SellerAiService,
        private categoryService: CategoryService,
        private router: Router,
        private toast: ToastService,
        private authService: AuthService
    ) {}

    variants: any[] = [];

    trackByIndex(index: number) {
        return index;
    }

    async ngOnInit() {
        this.buildForm();
        this.canUseProductAi = this.authService.isSeller();

        this.form.get('name')?.valueChanges.subscribe(() => {
            if (!this.isEditMode) {
                this.form.patchValue(
                    {
                        sku: this.generateBaseSku()
                    },
                    {
                        emitEvent: false
                    }
                );
            }
            this.regenerateVariants();
        });

        setTimeout(() => {
            this.initialFormValue = this.form.getRawValue();
        }, 0);

        this.productId = this.route.snapshot.paramMap.get('id') || '';

        await this.loadCategories();


        if (this.productId) {
            this.isEditMode = true;
            this.loadProduct();
        } else {
            this.initVariants(); // only here
        }

        // 🔥 Listen AFTER everything is ready
        this.form.get('categoryId')?.valueChanges.subscribe(() => {
            // Restore existing variant enable/disable logic
            this.updateVariantToggleState();
            this.applyVariantState();

            // Generate SKU
            if (!this.isEditMode) {

                this.form.patchValue(
                    {
                        sku: this.generateBaseSku()
                    },
                    {
                        emitEvent: false
                    }
                );
            }
            // Refresh variant SKU
            this.regenerateVariants();
        });

        this.form.get('hasVariants')?.valueChanges.subscribe((checked) => {

            const priceControl = this.form.get('price');
            const stockControl = this.form.get('stock');

            if (checked) {
                // ✅ disable base pricing
                priceControl?.disable({ emitEvent: false });
                stockControl?.disable({ emitEvent: false });

                // optional: clear values
                priceControl?.setValue(null);
                stockControl?.setValue(null);

            } else {
                // ✅ enable base pricing
                priceControl?.enable({ emitEvent: false });
                stockControl?.enable({ emitEvent: false });
            }

            this.applyVariantState();
        });

        const categoryId = this.form.get('categoryId')?.value;
        const hasVariantsControl = this.form.get('hasVariants');

        if (!categoryId) {
            hasVariantsControl?.disable({ emitEvent: false });
        }
        
        this.updateVariantToggleState();

    }

    updateVariantToggleState() {
        const categoryId = this.form.get('categoryId')?.value;
        const hasVariantsControl = this.form.get('hasVariants');

        if (!categoryId) {
            hasVariantsControl?.disable({ emitEvent: false });
            hasVariantsControl?.setValue(false, { emitEvent: false });
        } else {
            hasVariantsControl?.enable({ emitEvent: false });
        }
    }

    applyVariantState() {
        const categoryId = this.form.get('categoryId')?.value;
        const hasVariants = this.form.get('hasVariants')?.value;

        // ✅ ADD THIS GUARD
        if (!categoryId || !this.categories.length) return;

        const category = this.categories.find(c => c.id === categoryId);

        const templateAttrs = category?.variantTemplate?.attributes || [];

        if (hasVariants && category?.variantTemplate?.attributes?.length) {
            this.variantOptions = category.variantTemplate.attributes.map((name: string) => ({
                name,
                values: [],
                locked: true // 🔥 always locked from template
            }));
        } else {
            this.variantOptions = [];
            this.variants = [];
        }

        this.regenerateVariants();
        this.updateValidation();
    }

    hasVariantChanges(): boolean {
        return JSON.stringify(this.variants) !== this.initialVariantsSnapshot;
    }

    @HostListener('window:beforeunload', ['$event'])
        handleBeforeUnload(event: BeforeUnloadEvent) {
        if (this.form.dirty || this.hasVariantChanges()) {
            event.preventDefault();
            event.returnValue = true;
        }
    }

    initVariants() {
        this.variants = this.generateVariants(this.variantOptions).map(v => ({
            attributes: v,
            price: '',
            stock: '',
            sku: ''
        }));

        this.initialVariantsSnapshot = JSON.stringify(this.variants);
        this.initialVariantOptionsSnapshot = JSON.stringify(this.variantOptions);

        this.isInitialized = true;
    }

    async loadCategories(): Promise<void> {
        const res: any = await firstValueFrom(
            this.categoryService.getCategories()
        );

        this.categories = res.filter(
            (c: any) => c.isActive && !c.deletedAt
        );

    }

    loadProduct() {
        this.productService.getProductById(this.productId).subscribe((res: any) => {
            const product = res.data?.data ?? res.data;

            // ==========================
            // ✅ PATCH FORM
            // ==========================
            this.form.patchValue({
                name: product.name,
                description: product.description,
                shortDescription: product.shortDescription,
                seoDescription: product.seoDescription,
                price: product.price,
                stock: product.stock,
                sku: this.generateBaseSku(),
                categoryId: product.categoryId,
                hasVariants: !!product.variants?.length,
                isFeatured: product.isFeatured ?? false,
                isBestSeller: product.isBestSeller ?? false
            });

            if (this.form.get('hasVariants')?.value) {
                this.form.get('price')?.disable({ emitEvent: false });
                this.form.get('stock')?.disable({ emitEvent: false });
            }

            // ==========================
            // VARIANT OPTIONS
            // ==========================

            if (product.variantOptions?.length) {
                const category = this.categories.find(c => c.id === product.categoryId);
                const templateAttrs = category?.variantTemplate?.attributes || [];

                this.variantOptions = product.variantOptions.map((opt: any) => ({
                    ...opt,
                    locked: templateAttrs.includes(opt.name) // 🔥 correct usage here
                }));

            } else if (product.variants?.length) {
                // ✅ FALLBACK: reconstruct (OLD DATA)
                this.variantOptions = this.buildOptionsFromVariants(product.variants);

            } else {
                // ✅ LAST FALLBACK: category template
                const category = this.categories.find(c => c.id === product.categoryId);

                if (category?.variantTemplate?.attributes?.length) {
                    this.variantOptions = category.variantTemplate.attributes.map((name: string) => ({
                        name,
                        values: [],
                        locked: true
                    }));
                } else {
                    this.variantOptions = [];
                }
            }

            // 🔥 MUST RUN AFTER OPTIONS
            this.regenerateVariants();
            this.updateValidation();

            // ==========================
            // ✅ VARIANTS
            // ==========================
            this.variants = product.variants?.length
                ? product.variants.map((v: any) => ({
                    id: v.id,
                    attributes: Array.isArray(v.attributes)
                        ? this.mapAttributesArrayToObject(v.attributes)
                        : v.attributes || {},
                    price: v.price,
                    stock: v.stock,
                    sku: v.sku,
                    image: v.image || ''
                }))
                : [];

            // ==========================
            // ✅ IMAGES
            // ==========================
            this.images = product.images?.map((img: any) => ({
                id: img.id,
                file: null,
                url: getImageUrlCloudinary(img.url),
                publicId: img.publicId,
                isPrimary: img.isPrimary,
                order: img.order
            })) || [];


            this.initialFormValue = this.form.getRawValue();
            this.initialVariantsSnapshot = JSON.stringify(this.variants);
            this.initialVariantOptionsSnapshot = JSON.stringify(this.variantOptions);

            this.isInitialized = true;
        });   
    }

    mapAttributesArrayToObject(values: string[]) {
        const obj: any = {};

        values.forEach((val, i) => {
            const key = this.variantOptions[i]?.name
            ?.toLowerCase()
            .replace(/\s+/g, '_');

            if (key) obj[key] = val;
        });

        return obj;
    }

    buildForm() {
        this.form = this.fb.group({});

        this.formSections.forEach(section => {
            section.fields.forEach(field => {
                this.form.addControl(
                field.key,
                this.fb.control('', field.required ? Validators.required : [])
                );
            });
        });
        this.form.addControl('hasVariants', new FormControl(false));
        this.form.addControl('isFeatured', new FormControl(false));
        this.form.addControl('isBestSeller', new FormControl(false));
    }

    buildOptionsFromVariants(variants: any[]) {
        if (!variants?.length) return [];

        const firstAttributes = variants[0].attributes || {};
        const optionNames = Object.keys(firstAttributes);

        const options = optionNames.map(name => ({
            name,
            values: [] as string[],
            locked: true
        }));

        variants.forEach(v => {
            optionNames.forEach((name, index) => {
            const value = v.attributes?.[name];

            if (value && !options[index].values.includes(value)) {
                options[index].values.push(value);
            }
            });
        });

        return options;
    }

    hasVariants(): boolean {
        return this.variantOptions?.length > 0 && this.variants?.length > 0;
    }

    generateVariants(options: any[]) {
        const combine = (arr: any[], prefix: string[] = []): string[][] => {
            if (!arr.length) return [prefix];

            const result: string[][] = [];

            arr[0].values.forEach((val: string) => {
            result.push(...combine(arr.slice(1), [...prefix, val]));
            });

            return result;
        };

        return combine(options);
    }

    updateValidation() {
        const priceControl = this.form.get('price');
        const stockControl = this.form.get('stock');

        if (this.hasVariants()) {
            // 👉 variants mode
            priceControl?.clearValidators();
            stockControl?.clearValidators();
        } else {
            // 👉 simple product mode
            priceControl?.setValidators(Validators.required);
            stockControl?.setValidators(Validators.required);
        }

        priceControl?.updateValueAndValidity();
        stockControl?.updateValueAndValidity();
    }

    onImagesChange(images: any[]) {
        this.images = images;
    }

    async generateDescriptionWithAi() {
        if (this.isGeneratingDescription) return;

        const name = this.form.get('name')?.value?.trim();

        if (!name) {
            this.toast.warning('Enter a product name before generating a description.');
            this.form.get('name')?.markAsTouched();
            return;
        }

        const features = this.buildAiDescriptionFeatures();
        const specifications = this.splitAiList(this.aiSpecifications);
        const categoryId = this.form.get('categoryId')?.value;
        const category = this.categories.find(c => c.id === categoryId);
        const brand = this.aiBrand.trim();

        if (!category?.name && !brand && !features.length && !specifications.length) {
            this.toast.warning('Add a category, brand, features, or specifications before generating.');
            return;
        }

        this.isGeneratingDescription = true;

        try {
            const response = await firstValueFrom(
                this.sellerAiService.generateProductDescription({
                    name,
                    category: category?.name,
                    brand: brand || undefined,
                    features: features.length ? features : undefined,
                    specifications: specifications.length ? specifications : undefined
                })
            );

            const generated = response.data;

            this.generatedProductDescription = generated;
            this.toast.success('AI content generated. Review it before applying.');

        } catch (error) {
            console.error(error);
            this.toast.error('Unable to generate a description right now.');
        } finally {
            this.isGeneratingDescription = false;
        }
    }

    acceptGeneratedDescription() {
        if (!this.generatedProductDescription) return;

        this.form.patchValue({
            description: this.generatedProductDescription.description,
            shortDescription: this.generatedProductDescription.shortDescription,
            seoDescription: this.generatedProductDescription.seoDescription
        });

        ['description', 'shortDescription', 'seoDescription'].forEach(key => {
            const control = this.form.get(key);
            control?.markAsDirty();
            control?.markAsTouched();
        });

        this.toast.success('AI content applied. Review before saving.');
    }

    private buildAiDescriptionFeatures(): string[] {
        const features = new Set<string>();
        const enteredFeatures = this.splitAiList(this.aiFeatures);
        const description = this.form.get('description')?.value?.trim();
        const price = this.form.get('price')?.value;
        const stock = this.form.get('stock')?.value;

        enteredFeatures.forEach(feature => features.add(feature));

        if (description) {
            features.add(`Seller notes: ${description}`);
        }

        if (price) {
            features.add(`Price: ${price}`);
        }

        if (stock) {
            features.add(`Stock: ${stock}`);
        }

        this.variantOptions.forEach(option => {
            const values = option.values
                .map(value => value.trim())
                .filter(Boolean);

            if (option.name?.trim() && values.length) {
                features.add(`${option.name}: ${values.join(', ')}`);
            }
        });

        return Array.from(features).slice(0, 20);
    }

    private splitAiList(value: string): string[] {
        return value
            .split(/\r?\n|,/)
            .map(item => item.trim())
            .filter(Boolean)
            .slice(0, 20);
    }


    isFieldChanged(key: string): boolean {
        if (!this.isInitialized) return false;

        return this.form.get(key)?.value !== this.initialFormValue[key];
    }

    isVariantFieldChanged(
        index: number,
        field: 'price' | 'stock' | 'sku' | 'image'
    ): boolean {
        const initial = JSON.parse(this.initialVariantsSnapshot || '[]');
        const current = this.variants[index];

        if (!initial[index]) return true;

        return initial[index][field] !== current[field];
    }

    async submit(
        action: 'publish' | 'draft' = 'publish',
        after: 'list' | 'new' = 'list'
        ) {
        if (this.isSubmitting) return;

        this.isSubmitting = true;

        try {
            const formValue = this.form.getRawValue();

            formValue.sku = this.generateBaseSku();

            delete formValue.hasVariants;
   

            // ==========================
            // VALIDATION (PUBLISH ONLY)
            // ==========================
            if (action === 'publish') {
                if (this.form.invalid) {
                    this.toast.error('Please complete required fields');
                    return;
                }

                if (this.hasVariants()) {
                    const invalidVariants = this.variants.some(
                    v => !v.price || !v.stock
                    );

                    if (invalidVariants) {
                        this.toast.error('Please complete all variant price and stock');
                        return;
                    }
                }
            }

            // ==========================
            // STEP 1: Upload NEW images
            // ==========================
            // const uploadedImages = await Promise.all(
            //     this.images
            //     .filter(img => img.file)
            //     .map(img =>
            //         firstValueFrom(
            //             this.productService.uploadProductImage(this.productId, img.file!)
            //         )
            //     )
            // );

            // ==========================
            // STEP 2: Merge images
            // ==========================
            //let uploadIndex = 0;

            const finalImages = this.images.map((img, index) => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
                order: index
            }));

            // ✅ Ensure at least 1 primary image
            if (finalImages.length && !finalImages.some(i => i.isPrimary)) {
                finalImages[0].isPrimary = true;
            }

            // ==========================
            // STEP 3: Build payload
            // ==========================
            const payload: any = {
                ...formValue,
                status: action === 'publish' ? 'PUBLISHED' : 'DRAFT',
                images: finalImages,
                variantOptions: this.hasVariants() ? this.variantOptions : []
            };

            // ✅ ADD VARIANTS ONLY IF EXISTS
            if (this.hasVariants()) {
                payload.variants = this.variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    attributes: Object.values(v.attributes),
                    image: v.image
                }));
            }

            // ==========================
            // STEP 4: API CALL
            // ==========================
            let savedProductId = this.productId;

            if (this.isEditMode) {
                await firstValueFrom(
                    this.productService.updateProduct(this.productId, payload)
                );
            } else {
                const created = await firstValueFrom(
                    this.productService.createProduct(payload)
                );

                savedProductId = created.data.id; // 👈 adjust based on your API response
            }

            // ==========================
            // ✅ RESET DIRTY STATE (IMPORTANT)
            // ==========================
            this.form.markAsPristine();
            this.initialVariantsSnapshot = JSON.stringify(this.variants);
            this.initialFormValue = this.form.getRawValue();
            this.initialVariantOptionsSnapshot = JSON.stringify(this.variantOptions);

            // ==========================
            // SUCCESS HANDLING
            // ==========================
            if (action === 'draft') {
                this.toast.success('Draft saved successfully');
            } else {
                this.toast.success('Product has been published successfully');
            }

            // ==========================
            // POST-ACTION UX
            // ==========================

            if (after === 'list') {

                this.router.navigate(['/admin/products'], {
                    queryParams: {
                        ...this.route.snapshot.queryParams,
                        highlight: savedProductId
                    }
                });
            }

            if (after === 'new' && !this.isEditMode ) {
                this.resetForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });

                setTimeout(() => {
                    const firstInput = document.querySelector(
                    'input, textarea, select'
                    ) as HTMLElement;

                    firstInput?.focus();
                }, 100);
            }

        } catch (error) {
            console.error(error);
           this.toast.error('Failed to save product. Please try again.');
        } finally {
            this.isSubmitting = false;
        }
    }

    resetForm() {
        this.form.reset();
        this.variantOptions = [];
        this.variants = [];
        this.images = [];
    }

    addOption() {
        this.variantOptions.push({
            name: '',
            values: [],
            locked: false // 🔥 editable
        });
        this.updateValidation();
    }

    removeOption(index: number) {
        this.variantOptions.splice(index, 1);
        this.regenerateVariants();
        this.updateValidation();
    }

    addValue(optionIndex: number) {
        this.variantOptions[optionIndex].values.push('');

        this.regenerateVariants();
        this.updateValidation();
    }

    removeValue(optionIndex: number, valueIndex: number) {
        this.variantOptions[optionIndex].values.splice(valueIndex, 1);
        this.regenerateVariants();
        this.updateValidation();
    }

    onOptionChange() {
        this.regenerateVariants();
        this.updateValidation();
    }

    regenerateVariants() {

        if (!this.variantOptions.length ||
            !this.variantOptions.every(o => o.values.length)) {
            this.variants = [];
            return;
        }

        const combinations = this.generateVariants(this.variantOptions);

        // 🔥 PRESERVE OLD VARIANTS
        const oldVariants = [...this.variants];

        const matchVariant = (a: any, b: any) =>
            Object.keys(a).every(key => a[key] === b[key]);

        this.variants = combinations.map(combo => {

            const attributes: any = {};

            combo.forEach((val, i) => {
                const key = this.variantOptions[i].name
                    .toLowerCase()
                    .replace(/\s+/g, '_');

                attributes[key] = val;
            });

            // 🔥 USE oldVariants INSTEAD
            const existing = oldVariants.find(v =>
                matchVariant(v.attributes, attributes)
            );

            return existing
            ? {
                ...existing,
                attributes,
                sku: existing.manualSku
                    ? existing.sku
                    : this.generateFullSku(combo)
            }
            : {
                attributes,
                price: '',
                stock: '',
                sku: this.generateFullSku(combo),
                manualSku: false,
                image: ''
            };
        });
    }

    applyVariantTemplate(category: any) {
        if (!category?.variantTemplate?.attributes?.length) return;

        this.variantOptions = category.variantTemplate.attributes.map((name: string) => ({
            name,
            values: [],
            locked: true
        }));

        this.variants = [];
    }

    // ==========================
    // SKU GENERATOR
    // ==========================
    generateShortCode(value: string): string {
        return value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '') // remove symbols
            .slice(0, 3); // take first 3 chars
    }

    generateSku(attributes: string[]): string {
        return attributes
            .map(attr => this.generateShortCode(attr))
            .join('-');
    }

    getCategoryCode(): string {
        const categoryId = this.form.get('categoryId')?.value;
        const category = this.categories.find(c => c.id === categoryId);

        if (!category?.name) {
            return 'GEN';
        }

        return category.name
            .split(' ')
            .map((word: string) => word.substring(0, 2))
            .join('')
            .toUpperCase();

    }

    generateFullSku(attributes: string[]) {
        const baseSku = this.generateBaseSku();
        const attrCode = this.generateSku(attributes);

        return [
            baseSku,
            attrCode
        ]
        .filter(Boolean)
        .join('-');

    }

    generateBaseSku(): string {
        const productName = this.form.get('name')?.value || '';

        const words = productName
                .split(' ')
                .filter(Boolean)
                .slice(0, 2);

        const productCode =
            words
                .map(
                    (w: string) =>
                        w.substring(0, 3)
                )
                .join('');

        return [
            this.getCategoryCode(),
            productCode
        ]
        .filter(Boolean)
        .join('-')
        .toUpperCase();
    }

    // Variant Table
    get variantColumns(): string[] {
        return this.variantOptions.map(o => o.name);
    }
    
    applyBulkStock(stock: any) {
        const val = Number(stock);
        if (isNaN(val)) return;

        this.variants.forEach(v => v.stock = val);
    }

    applyBulkPrice(price: any) {
        const val = Number(price);
        if (isNaN(val)) return;

        this.variants.forEach(v => v.price = val);
    }

    async onVariantImageUpload(event: any, index: number) {
        const input = event.target;
        const file = input.files[0];
        if (!file) return;

        // ✅ STEP 1: preview immediately
        const reader = new FileReader();

        reader.onload = () => {
            this.variants[index].preview = reader.result;
        };

        reader.readAsDataURL(file);

        this.loadingIndex = index;

        try {
            const variant = this.variants[index];
            const variantId = variant.id || `temp-${index}`;

            const uploaded = await firstValueFrom(
                this.productService.uploadVariantImage(
                    this.productId,
                    variantId,
                    file
                )
            );

            // ✅ STEP 2: store Cloudinary public_id
            const { data } = uploaded;
            this.variants[index].image = data.public_id;


        } catch (err) {
            console.error(err);
        } finally {
            this.loadingIndex = null;
            input.value = '';
        }
    }

    removeVariantImage(index: number) {
        this.variants[index].image = '';

        // ✅ FIX: reset loading state
        if (this.loadingIndex === index) {
            this.loadingIndex = null;
        }
    }

    isOptionFieldChanged(optionIndex: number, valueIndex?: number): boolean {
        const initial = JSON.parse(this.initialVariantOptionsSnapshot || '[]');
        if (!initial[optionIndex]) return true;
        if (valueIndex === undefined) {
            return initial[optionIndex].name !== this.variantOptions[optionIndex].name;
        }
        return initial[optionIndex].values[valueIndex] !== this.variantOptions[optionIndex].values[valueIndex];
    }

    onToggleVariants(event: Event) {
        const checked = (event.target as HTMLInputElement).checked;

        this.hasVariantsToggle = checked;

        const categoryId = this.form.get('categoryId')?.value;
        const category = this.categories.find(c => c.id === categoryId);

        if (checked && category?.variantTemplate?.attributes?.length) {
            this.variantOptions = category.variantTemplate.attributes.map((name: string) => ({
            name,
            values: [],
            locked: true
            }));
        } else {
            this.variantOptions = [];
            this.variants = [];
        }

        this.regenerateVariants();
        this.updateValidation();
    }

    onCancel() {
        this.router.navigate(['/admin/products'], {
            queryParams: this.route.snapshot.queryParams
        });
    }


}
