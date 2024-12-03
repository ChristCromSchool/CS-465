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
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {
  private apiBaseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private trieService: TrieService,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) {
    // Initialize search index when service starts
    this.initializeSearchIndex();
  }

  private async initializeSearchIndex() {
    console.log('Initializing search index...');
    this.getTrips().subscribe(trips => {
      console.log('Indexing trips:', trips);
      trips.forEach(trip => {
        this.trieService.insert(trip.name);
        this.trieService.insert(trip.resort);
      });
    });
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
    return this.http.get<Trip[]>(`${this.apiBaseUrl}/trips`);
  }

  getTripsWithPagination(params: SearchParams): Observable<SearchResult> {
    return this.http.get<any>(`${this.apiBaseUrl}/trips`, {
      params: new HttpParams()
        .set('page', params.page?.toString() || '1')
        .set('pageSize', params.pageSize?.toString() || '10')
        .set('query', params.query || '')
    }).pipe(
      map(response => ({
        trips: response, // API returns array directly
        total: response.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }))
    );
  }

  addTrip(formData: Trip): Observable<Trip> {
    const headers = this.getAuthHeaders();
    return this.http.post<Trip>(`${this.apiBaseUrl}/trips`, formData, { headers });
  }

  getTrip(tripCode: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiBaseUrl}/${tripCode}`);
  }

  updateTrip(formData: Trip): Observable<Trip> {
    const headers = this.getAuthHeaders();
    return this.http.put<Trip>(`${this.apiBaseUrl}/${formData.code}`, formData, { headers });
  }

  getSuggestions(query: string): string[] {
    if (!query) return [];
    const suggestions = this.trieService.search(query);
    console.log('Search suggestions for:', query, suggestions);
    return suggestions;
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
