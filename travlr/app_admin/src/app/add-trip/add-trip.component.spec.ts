import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AddTripComponent } from './add-trip.component';
import { TripDataService } from '../services/trip-data.service';
import { of, throwError } from 'rxjs';

describe('AddTripComponent', () => {
  let component: AddTripComponent;
  let fixture: ComponentFixture<AddTripComponent>;
  let tripDataService: jasmine.SpyObj<TripDataService>;
  let formBuilder: FormBuilder;

  const mockTrip = {
    _id: '1',
    code: 'TEST1',
    name: 'Test Trip',
    length: '7 days',
    description: 'Test Description',
    start: new Date('2023-01-01'),
    resort: 'Test Resort',
    perPerson: '999',
    image: 'test.jpg'  // Add image field
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TripDataService', ['addTrip']);

    await TestBed.configureTestingModule({
      imports: [
        AddTripComponent,
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: TripDataService, useValue: spy }
      ]
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(AddTripComponent);
    component = fixture.componentInstance;
    tripDataService = TestBed.inject(TripDataService) as jasmine.SpyObj<TripDataService>;

    component.addForm = formBuilder.group({
      _id: [''],
      code: [''],
      name: [''],
      length: [''],
      description: [''],
      start: [''],
      resort: [''],
      perPerson: [''],
      image: ['']  // Added image field
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.addForm).toBeTruthy();
    expect(component.addForm.get('_id')?.value).toBe(null);
    expect(component.addForm.get('code')?.value).toBe('');
    expect(component.addForm.get('name')?.value).toBe('');
    expect(component.addForm.get('length')?.value).toBe('');
    expect(component.addForm.get('description')?.value).toBe('');
    expect(component.addForm.get('start')?.value).toBe('');
    expect(component.addForm.get('resort')?.value).toBe('');
    expect(component.addForm.get('perPerson')?.value).toBe('');
    expect(component.addForm.get('image')?.value).toBe('');  // Added image check
  });

  it('should validate required fields', () => {
    const form = component.addForm;
    expect(form.valid).toBeFalsy();

    // Test each field individually
    const requiredFields = ['code', 'name', 'length', 'description', 'start', 'resort', 'perPerson'];

    requiredFields.forEach(field => {
      // Clear all fields first
      Object.keys(form.controls).forEach(key => {
        form.controls[key].setValue('');
      });

      // Set only one field
      form.controls[field].setValue(mockTrip[field as keyof typeof mockTrip]);
      expect(form.valid).toBeFalsy(`Form should be invalid with only ${field} set`);
    });

    // Set all required fields
    form.controls['code'].setValue('TEST1');
    form.controls['name'].setValue('Test Trip');
    form.controls['length'].setValue('7 days');
    form.controls['description'].setValue('Test Description');
    form.controls['start'].setValue('2024-03-15');
    form.controls['resort'].setValue('Test Resort');
    form.controls['perPerson'].setValue('999');
    form.controls['image'].setValue('test.jpg');

    // Now form should be valid
    expect(form.valid).toBeTruthy('Form should be valid with all required fields');
  });

  it('should submit form when valid', () => {
    tripDataService.addTrip.and.returnValue(of(mockTrip));

    component.addForm.setValue({
      _id: mockTrip._id,
      code: mockTrip.code,
      name: mockTrip.name,
      length: mockTrip.length,
      description: mockTrip.description,
      start: mockTrip.start,
      resort: mockTrip.resort,
      perPerson: mockTrip.perPerson,
      image: mockTrip.image
    });

    component.onSubmit();

    expect(tripDataService.addTrip).toHaveBeenCalledWith(mockTrip);
  });

  it('should handle submission error', (done) => {
    // Setup error to be thrown
    const error = new Error('Submission failed');
    tripDataService.addTrip.and.returnValue(throwError(() => error));

    // Set form values
    component.addForm.setValue({
      _id: mockTrip._id,
      code: mockTrip.code,
      name: mockTrip.name,
      length: mockTrip.length,
      description: mockTrip.description,
      start: mockTrip.start,
      resort: mockTrip.resort,
      perPerson: mockTrip.perPerson,
      image: mockTrip.image
    });

    // Test error handling
    component.onSubmit();

    // Use setTimeout to allow subscription to process
    setTimeout(() => {
      expect(component.submitError).toBe(true);
      done();
    });
  });

});
