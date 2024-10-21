import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent implements OnInit {

  @Input('trip') trip:any;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ){}

  ngOnInit(): void {
    console.log('Trip data in TripCardComponent:', this.trip);
  }
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public editTrip(trip: Trip){
    console.log('Edit button clicked, trip:', trip);
    localStorage.setItem('tripCode', trip.code);
    this.router.navigate(['edit-trip']);

  }
}
