import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/models/api-response.model';
import { Constant } from '@app/services/constant/constant';
import { map } from 'rxjs';

export interface Media {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  size?: number;
  folder?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
    private baseUrl = Constant.API_BASE_URL;

    constructor(private http: HttpClient) {}

    upload(file: File, folder?: string, usage?: string) {
        const formData = new FormData();
        formData.append('file', file);

        let params = new HttpParams();
        if (folder) params = params.set('folder', folder);
        if (usage && usage !== 'all') params = params.set('usage', usage);

        return this.http.post(
            `${this.baseUrl}/${Constant.ADMIN.MEDIA.UPLOAD}`,
            formData,
            { params }
        );
    }

    getAll(page = 1, limit = 20, folder?: string, usage?: string) {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        if (folder) params = params.set('folder', folder);
        if (usage && usage !== 'all') params = params.set('usage', usage);

        return this.http.get<ApiResponse<Media[]>>(
            `${this.baseUrl}/${Constant.ADMIN.MEDIA.BASE}`,
            { params }
        ).pipe(
            map(res => res.data)
        );
    }

    delete(id: string) {
        return this.http.delete(
            `${this.baseUrl}/${Constant.ADMIN.MEDIA.BY_ID(id)}`
        );
    }
}
