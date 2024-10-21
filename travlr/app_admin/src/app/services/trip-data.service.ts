import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';
import { BROWSER_STORAGE } from '../storage';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) {}

  url = 'http://localhost:3000/api/trips';
  authUrl = 'http://localhost:3000/api'; // Base URL for authentication

  // Fetch trips from the backend
  public getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url);
  }

  // Add a new trip
  public addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.url, formData);
  }

  // Update an existing trip
  public updateTrip(trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.url}/${trip.code}`, trip);
  }

  // Login method for user authentication
  public login(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('login', user);
  }
getTrip(tripCode:string) : Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url + '/' + tripCode);
  }
  // Registration method for user authentication
  public register(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('register', user);
  }

  // Helper method to call authentication API endpoints (login/register)
  private makeAuthApiCall(urlPath: string, user: User): Promise<AuthResponse> {
    const url: string = `${this.authUrl}/${urlPath}`;
    return this.http
      .post<AuthResponse>(url, user)
      .toPromise()
      .then(response => response as AuthResponse)
      .catch(this.handleError);
  }

  // Error handling (if required, you can expand this based on your needs)
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
