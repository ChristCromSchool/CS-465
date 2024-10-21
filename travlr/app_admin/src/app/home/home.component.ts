import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule for pipes
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,  // If using standalone components
  imports: [CommonModule]  // Add CommonModule here
})
export class HomeComponent implements OnInit {
  trips!: Trip[];
  message: string = '';

  constructor(
    private tripDataService: TripDataService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getTrips();
  }

  private getTrips(): void {
    this.tripDataService.getTrips().subscribe({
      next: (trips: Trip[]) => {
        this.trips = trips;
        this.message = trips.length > 0 ? 'Here are the available trips' : 'No trips available at the moment.';
      },
      error: (err: any) => {
        console.log('Error fetching trips:', err);
        this.message = 'Error retrieving trips';
      }
    });
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public editTrip(trip: Trip): void {
    this.router.navigate([`edit-trip/${trip.code}`]);
  }
}
