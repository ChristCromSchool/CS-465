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
    styleUrls: ['./edit-trip.component.css']
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
    ) {
        this.editForm = this.formBuilder.group({
            _id: [''],
            code: ['', Validators.required],
            name: ['', Validators.required],
            length: ['', Validators.required],
            start: ['', Validators.required],
            resort: ['', Validators.required],
            perPerson: ['', Validators.required],
            image: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

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
        const tripCode = localStorage.getItem("tripCode");
        if (!tripCode) {
            console.error("No trip code found");
            return;
        }

        this.tripDataService.getTrip(tripCode).subscribe({
            next: (trip: any) => {
                console.log('Trip data:', trip);
                if (trip && trip[0]) {
                    this.editForm.patchValue({
                        _id: trip[0]._id,
                        code: trip[0].code,
                        name: trip[0].name,
                        length: trip[0].length,
                        start: trip[0].start,
                        resort: trip[0].resort,
                        perPerson: trip[0].perPerson,
                        image: trip[0].image,
                        description: trip[0].description
                    });
                }
            },
            error: (err) => {
                console.error(err);
            }
        });

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
    }

    get f() { return this.editForm.controls; }
}
