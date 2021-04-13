import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RatingListPageComponent } from './rating-list/rating-list-page.component';
import { RatingPlayerPageComponent } from './rating-player/rating-player-page.component';

@NgModule({
  imports: [RouterModule.forChild([
    {path: 'ratings', component: RatingListPageComponent },
    {path: 'ratings/:id', component: RatingPlayerPageComponent},
  ])],
  exports: [RouterModule]
})
export class RatingRoutingModule {
}
