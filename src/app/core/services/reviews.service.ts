import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BusinessReview } from '../models/BusinessReview';
import { CreateBusinessReview } from '../schemas/create-business-review.dto';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  constructor(private readonly apiService: ApiService) {}

  public findForBusiness(businessId: string): Observable<BusinessReview[]> {
    return this.apiService.get(`/reviews/business/${businessId}`);
  }

  public create(data: CreateBusinessReview): Observable<BusinessReview> {
    return this.apiService.post('/reviews/business', data);
  }
}
