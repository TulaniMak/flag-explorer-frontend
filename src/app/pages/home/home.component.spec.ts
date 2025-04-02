import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ApiService } from '../../services/api.service';
import { Country } from '../../country.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockCountries: Country[] = [
    {
      name: 'Test Country 1',
      flagUrl: 'https://flagcdn.com/w320/tc1.png',
      capital: 'Test Capital 1',
      population: 1000000
    },
    {
      name: 'Test Country 2',
      flagUrl: 'https://flagcdn.com/w320/tc2.png',
      capital: 'Test Capital 2',
      population: 2000000
    }
  ];

  const mockCountryDetails: Country = {
      name: 'Test Country 1',
      capital: 'Detailed Capital',
      population: 1500000,
      flagUrl: 'https://flagcdn.com/w320/tc2.png'
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCountries', 'getCountryDetails']);

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent, // Import standalone component directly
        MatProgressSpinnerModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state', () => {
    expect(component.loading).toBeTrue();
    expect(component.error).toBeNull();
    expect(component.countries).toEqual([]);
  });

  it('should load countries on init', fakeAsync(() => {
    apiService.getCountries.and.returnValue(of(mockCountries));
    
    fixture.detectChanges(); // Triggers ngOnInit
    tick(); // Wait for async operations
    
    expect(apiService.getCountries).toHaveBeenCalled();
    expect(component.countries).toEqual(mockCountries);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  }));



  it('should load country details when requested', fakeAsync(() => {
    apiService.getCountries.and.returnValue(of(mockCountries));
    apiService.getCountryDetails.and.returnValue(of(mockCountryDetails));
    
    fixture.detectChanges();
    tick();
    
    // Initial state - details not loaded
    expect(component.detailedCountries['Test Country 1']).toBeUndefined();
    
    // Trigger details loading
    component.loadCountryDetails('Test Country 1');
    tick();
    
    // Verify details were loaded and merged
    expect(apiService.getCountryDetails).toHaveBeenCalledWith('Test Country 1');
    expect(component.detailedCountries['Test Country 1']).toEqual(mockCountryDetails);
    

  }));

  it('should not reload details for already loaded countries', fakeAsync(() => {
    apiService.getCountries.and.returnValue(of(mockCountries));
    apiService.getCountryDetails.and.returnValue(of(mockCountryDetails));
    
    fixture.detectChanges();
    tick();
    
    // First load
    component.loadCountryDetails('Test Country 1');
    tick();
    
    // Second load attempt
    component.loadCountryDetails('Test Country 1');
    tick();
    
    // Should only call API once
    expect(apiService.getCountryDetails).toHaveBeenCalledTimes(1);
  }));

  it('should display countries when loaded', fakeAsync(() => {
    apiService.getCountries.and.returnValue(of(mockCountries));
    
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    
    const countryCards = fixture.debugElement.queryAll(By.css('.country-card'));
    expect(countryCards.length).toBe(mockCountries.length);
    
  }));
});