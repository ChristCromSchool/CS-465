import { Routes } from '@angular/router';
import { AddTripComponent } from './add-trip/add-trip.component';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthCallbackComponent } from './auth/auth-callback.component';
import { CartComponent } from './cart/cart.component';


export const routes: Routes = [
  { path: 'add-trip', component: AddTripComponent },
  {path: 'edit-trip', component: EditTripComponent},
  {path: 'login', component: LoginComponent},
  {path: 'trips', component: TripListingComponent},
  {
    path: 'auth/callback',
    component: AuthCallbackComponent
  },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Shopping Cart'
  }
]
