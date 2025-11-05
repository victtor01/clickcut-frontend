import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Business } from '@app/core/models/Business';
import { BusinessReview, ReviewRatingScore } from '@app/core/models/BusinessReview';
import { ClientAccount } from '@app/core/models/ClientAccount';
import { User } from '@app/core/models/User';
import { CreateBusinessReview as CreateBusinessReviewDTO } from '@app/core/schemas/create-business-review.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { AuthService } from '@app/core/services/auth.service';
import { ReviewsService } from '@app/core/services/reviews.service';
import { ToastService } from '@app/core/services/toast.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: 'business-modal.component.html',
  imports: [CommonModule, ToFormatBrlPipe, ReactiveFormsModule, FormsModule, RouterModule],
})
export class BusinessModalComponent implements OnInit {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    @Inject(MAT_DIALOG_DATA)
    private readonly data: { businessId: string },
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly reviewService: ReviewsService,
    private readonly toastService: ToastService,
    private readonly modal: MatDialogRef<BusinessModalComponent>,
  ) {}

  public ngOnInit(): void {
    this.fetchBusiness(this.data.businessId);
    this.fetchReviews(this.data.businessId);
    this.getSession();
    this.initForm();
  }

  get rating() {
    return this.reviewForm.get('rating');
  }

  get comment() {
    return this.reviewForm.get('comment');
  }

  public hoveredRating: number = 0;
  public reviewForm!: FormGroup;
  public business?: Business;
  public currentClient?: ClientAccount;
  public currentManager?: User;

  public replyingToReviewId: string | null = null;
  public replyText: string = '';

  public startReply(review: BusinessReview): void {
    this.replyingToReviewId = review.id;
    this.replyText = ''; // Limpa o texto de respostas anteriores
  }

  public get mediaRating() {
    if (!this.reviews.length) return 0;
    return this.reviews?.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }

  public close() {
    this.modal.close();
  }

  public cancelReply(): void {
    this.replyingToReviewId = null;
    this.replyText = '';
  }

  public submitReply(review: BusinessReview): void {
    if (!this.replyText || this.replyText.trim() === '') {
      alert('A resposta não pode estar vazia.');
      return;
    }

    this.reviewService.reply({ comment: this.replyText, replyId: review.id }).subscribe({
      next: () => {
        review.reply = this.replyText;
        review.repliedAt = new Date();
      },

      complete: () => {
        this.cancelReply();
      },
    });
  }

  public setRating(ratingValue: number): void {
    this.rating?.setValue(ratingValue as ReviewRatingScore);
  }

  public reviews: BusinessReview[] = [];

  public setHoveredRating(rating: number): void {
    this.hoveredRating = rating;
  }

  public resetHoveredRating(): void {
    this.hoveredRating = 0;
  }

  public async submitReview(): Promise<void> {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const formValue = this.reviewForm.value;

    const data: CreateBusinessReviewDTO = {
      comment: formValue.comment,
      rating: formValue.rating,
      businessId: this.business?.id!,
    };

    const created = await firstValueFrom(this.reviewService.create(data)).catch((err) => {
      this.toastService.error('Houve um erro ao tentar criar um novo comentário!');
    });

    if (created) {
      this.toastService.success('Criado com sucesso!');
      this.fetchReviews(this.data.businessId);
    }

    this.reviewForm.reset({ rating: 0, comment: '' });
  }

  public getStarArray(rating: ReviewRatingScore): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => i + 1);
  }

  private async fetchBusiness(businessId: string): Promise<void> {
    this.business = await firstValueFrom(this.appointmentsService.getBusinessById(businessId));
    console.log(this.business);
  }

  private async fetchReviews(businessId: string): Promise<void> {
    this.reviews = await firstValueFrom(this.reviewService.findForBusiness(businessId));
  }

  private async getSession(): Promise<void> {
    this.authService.currentClient$.subscribe({
      next: (data) => {
        if (data?.id) {
          this.currentClient = data?.id ? data : undefined;
        }
      },
    });

    this.authService.currentUser$.subscribe({
      next: (data) => {
        if (data?.id) {
          this.currentManager = data?.id ? data : undefined;
        }
      },
    });
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }
}
