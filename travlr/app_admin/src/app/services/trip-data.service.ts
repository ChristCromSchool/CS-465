import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';
import { BROWSER_STORAGE } from '../storage';
import { Trip } from '../models/trip';
import { TrieService } from './trie.service';
import { SearchParams, } from '../models/search-params';
import {  SearchResult } from '../models/search-result';
@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  apiBaseUrl = 'http://localhost:3000/api';
  url = 'http://localhost:3000/api/trips';

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private trieService: TrieService
  ) {
    this.initializeSearchIndex();
  }

  private async initializeSearchIndex() {
    const trips = await this.getTrips().toPromise();
    if (trips) {
      trips.forEach(trip => {
        this.trieService.insert(trip.name);
        this.trieService.insert(trip.resort);
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.storage.getItem('travlr-token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url);
  }

  getTripsWithPagination(params: SearchParams): Observable<SearchResult> {
    const queryParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('pageSize', params.pageSize?.toString() || '10')
      .set('query', params.query || '')
      .set('sortBy', params.sortBy || 'name')
      .set('sortDirection', params.sortDirection || 'asc');

    return this.http.get<SearchResult>(`${this.apiBaseUrl}/trips`, { params: queryParams });
  }

  addTrip(formData: Trip): Observable<Trip> {
    const headers = this.getAuthHeaders();
    return this.http.post<Trip>(this.url, formData, { headers });
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.url}/${tripCode}`);
  }

  updateTrip(formData: Trip): Observable<Trip> {
    const headers = this.getAuthHeaders();
    return this.http.put<Trip>(`${this.url}/${formData.code}`, formData, { headers });
  }

  getSuggestions(query: string): string[] {
    return this.trieService.search(query);
  }

  public login(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('login', user);
  }

  public register(user: User): Promise<AuthResponse> {
    return this.makeAuthApiCall('register', user);
  }

  private makeAuthApiCall(urlPath: string, user: User): Promise<AuthResponse> {
    const url: string = `${this.apiBaseUrl}/${urlPath}`;
    return this.http
      .post(url, user)
      .toPromise()
      .then(response => response as AuthResponse)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
