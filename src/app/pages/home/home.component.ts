import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Add this import
import { ApiService } from '../../services/api.service';
import { Country } from '../../country.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [
    CommonModule,
    MatProgressSpinnerModule
    ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  countries: Country[] = [];
  loading = true;
  error: string | null = null;
  detailedCountries: { [name: string]: Country } = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getCountries().subscribe({
      next: (countries) => {
        console.log('API Response:', countries); 
        this.countries = countries;
        this.loading = false;
        
      },
      error: (err) => {
        this.error = 'Failed to load countries';
        this.loading = false;
      }
    });
  }

  loadCountryDetails(name: string): void {
    if (!this.detailedCountries[name]) {
      this.apiService.getCountryDetails(name).subscribe({
        next: (details) => {
          this.detailedCountries[name] = details;
          // Update the country in the main array
          const index = this.countries.findIndex(c => c.name === name);
          if (index > -1) {
            this.countries[index] = { ...this.countries[index], ...details };
          }
        }
      });
    }
}

}