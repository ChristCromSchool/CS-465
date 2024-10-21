import { Routes } from '@angular/router';
import { AddTripComponent } from './add-trip/add-trip.component';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'add-trip', component: AddTripComponent},
    { path: 'edit-trip', component: EditTripComponent},
    { path: 'login', component: LoginComponent},
    { path: 'list-trip', component: TripListingComponent},
    { path: '', component: HomeComponent, pathMatch: 'full'}
    ];
