import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Business } from '@app/core/models/Business';
import { BusinessReview, ReviewRatingScore } from '@app/core/models/BusinessReview';
import { ClientAccount } from '@app/core/models/ClientAccount';
import { CreateBusinessReview as CreateBusinessReviewDTO } from '@app/core/schemas/create-business-review.dto';
import { AppointmentsService } from '@app/core/services/appointments.service';
import { AuthService } from '@app/core/services/auth.service';
import { ReviewsService } from '@app/core/services/reviews.service';
import { ToastService } from '@app/core/services/toast.service';
import { ToFormatBrlPipe } from '@app/shared/pipes/to-format-brl-pipe/to-format-brl.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  templateUrl: 'business-modal.component.html',
  imports: [CommonModule, ToFormatBrlPipe, ReactiveFormsModule],
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
  public currentUser?: ClientAccount;

  public setRating(ratingValue: number): void {
    this.rating?.setValue(ratingValue as ReviewRatingScore);
  }

  public reviews: BusinessReview[] = [];
  // reviews: BusinessReview[] = [
  //   {
  //     id: 'r-01',
  //     businessId: 'b-01',
  //     rating: 5,
  //     authorId: 'c-01',
  //     authorName: 'Ana Clara',
  //     avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  //     comment:
  //       'Atendimento impecável e o corte ficou exatamente como pedi. O Bruno é um profissional excelente! Com certeza voltarei.',
  //     createdAt: new Date(2025, 8, 28),
  //     ownerReply:
  //       'Muito obrigado pela confiança, Ana! Ficamos felizes que tenha gostado. Volte sempre!',
  //     repliedAt: new Date(2025, 8, 29),
  //   },
  //   {
  //     id: 'r-02',
  //     businessId: 'b-01',
  //     rating: 4,
  //     authorId: 'c-02',
  //     authorName: 'Marcos Vinícius',
  //     comment:
  //       'Lugar agradável e profissionais competentes. Só demorou um pouco para ser atendido, mesmo com hora marcada.',
  //     createdAt: new Date(2025, 8, 15),
  //   },
  // ];

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
      console.log(err);
      this.toastService.error('Houve um erro ao tentar criar um novo comentário!');
    });

    if (created) {
      this.toastService.success('Criado com sucesso!');
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
  }

  private async fetchReviews(businessId: string): Promise<void> {
    this.reviews = await firstValueFrom(this.reviewService.findForBusiness(businessId));
    console.log(this.reviews);
  }

  private async getSession(): Promise<void> {
    this.currentUser = await firstValueFrom(this.authService.currentClient$);
  }

  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }
}
