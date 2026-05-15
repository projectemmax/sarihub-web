import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Media, MediaService } from '@app/core/services/media.service';
import { ToastService } from '@app/core/services/toast.service';

@Component({
  selector: 'app-media-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-picker.component.html',
  styleUrl: './media-picker.component.css'
})
export class MediaPickerComponent implements OnInit, OnChanges {
    @Output() selected = new EventEmitter<string>();
    @Input() folder: string = 'general';
    @Input() usage: string = 'all';

    media: Media[] = [];
    selectedId?: string;
    currentFolder = 'general';
    isUploading = false;
    deleteTarget?: Media;
    showDeleteModal = false;
    currentUsage = 'all';

    constructor(
        private mediaService: MediaService, 
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.syncInputs();
        this.loadMedia();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['folder'] || changes['usage']) {
            this.syncInputs();
            this.loadMedia();
        }
    }

    private syncInputs() {
        this.currentFolder = this.folder || 'general';
        this.currentUsage = this.usage || 'all';
    }

    onFolderChange(event: any) {
        this.currentFolder = event.target.value;
        this.loadMedia();
    }

    loadMedia() {
        this.mediaService
            .getAll(1, 50, this.currentFolder, this.currentUsage)
            .subscribe({
                next: res => {
                    this.media = res || [];
                },
                error: () => {
                    this.media = [];
                    this.toast.error('Failed to load media');
                }
            });
    }

    pick(media: Media) {
        this.selectedId = media.id;
        this.selected.emit(media.url);
    }

    onUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        let usage = this.currentUsage;

        if (!usage || usage === 'all') {
            usage = 'general';
        }

        this.isUploading = true;

        this.mediaService.upload(file, this.folder, usage).subscribe({
            next: () => {
                this.toast.success('Upload successful');
                this.loadMedia();
                this.isUploading = false;
            },
            error: () => {
                this.toast.error('Upload failed');
                this.isUploading = false;
            }
        });
    }

    changeFolder(folder: string) {
        this.currentFolder = folder;
        this.loadMedia();
    }

    delete(media: Media, event: Event) {
        event.stopPropagation(); // 🔥 prevent selecting image

        const confirmDelete = confirm('Delete this image?');
        if (!confirmDelete) return;

        this.mediaService.delete(media.id).subscribe(() => {
            this.loadMedia();
        });
    }

    confirmDelete(media: Media, event: Event) {
        event.stopPropagation();
        this.deleteTarget = media;
        this.showDeleteModal = true;
    }

    deleteConfirmed() {
        if (!this.deleteTarget) return;

        this.mediaService.delete(this.deleteTarget.id).subscribe({
            next: () => {
            this.toast.success('Image deleted');
            this.loadMedia();
            this.showDeleteModal = false;
            },
            error: () => {
            this.toast.error('Failed to delete image');
            }
        });
    }

    changeUsage(usage: string) {
        this.currentUsage = usage;
        this.loadMedia();
    }

}
