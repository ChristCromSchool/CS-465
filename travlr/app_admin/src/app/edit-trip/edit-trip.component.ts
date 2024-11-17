import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-edit-trip',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './edit-trip.component.html',
    styleUrl: './edit-trip.component.css'
})
export class EditTripComponent implements OnInit {
    public editForm!: FormGroup;
    trip!: Trip;
    submitted = false;
    message: string = '';

    constructor(
        public formBuilder: FormBuilder,
        private router: Router,
        private tripDataService: TripDataService,
        private authService: AuthenticationService
    ) { }

    public onSubmit() {
        this.submitted = true;
        if (this.editForm.valid) {
            // Check if user is authenticated
            if (!this.authService.isLoggedIn()) {
                this.router.navigate(['/login']);
                return;
            }

            const tripData: Trip = {
                ...this.editForm.value,
                code: this.editForm.get('code')?.value // Make sure code is included
            };

            this.tripDataService.updateTrip(tripData)
                .subscribe({
                    next: (value: any) => {
                        console.log('Trip updated successfully:', value);
                        this.router.navigate(['/trips']); // Update to your trips list route
                    },
                    error: (error: any) => {
                        console.log('Error updating trip:', error);
                        if (error.status === 401) {
                            this.router.navigate(['/login']);
                        }
                        this.message = 'Error updating trip';
                    }
                });
        }
    }

    ngOnInit(): void {
        // Check authentication first
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        const tripCode = localStorage.getItem("tripCode");
        if (!tripCode) {
            alert("Something wrong, couldn't find where I stashed tripCode!");
            this.router.navigate(['/trips']);
            return;
        }

        console.log('EditTripComponent::ngOnInit');
        console.log('tripcode:', tripCode);

        this.editForm = this.formBuilder.group({
            _id: [''],
            code: [tripCode, Validators.required],
            name: ['', Validators.required],
            length: ['', Validators.required],
            start: ['', Validators.required],
            resort: ['', Validators.required],
            perPerson: ['', Validators.required],
            image: ['', Validators.required],
            description: ['', Validators.required]
        });

        this.tripDataService.getTrip(tripCode)
            .subscribe({
                next: (value: any) => {
                    if (!value || !value[0]) {
                        this.message = 'No Trip Retrieved!';
                        return;
                    }
                    this.trip = value[0];
                    this.editForm.patchValue(value[0]);
                    this.message = `Trip: ${tripCode} retrieved`;
                    console.log(this.message);
                },
                error: (error: any) => {
                    console.log('Error retrieving trip:', error);
                    if (error.status === 404) {
                        this.message = 'Trip not found';
                        this.router.navigate(['/trips']);
                    }
                }
            });
    }

    get f() { return this.editForm.controls; }
}
