import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getNames } from 'country-list';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { AppFlowStore, CountryData } from '../../core/state/app-flow.store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-welcome-registration-page',
  standalone: true,
  imports: [UiInputComponent],
  template: `
  <div class="screen screen--scroll screen--bg-welcome welcome-screen">

    <header class="topbar">
      <img src="/assets/topbar-logo.svg" alt="We Love You" class="topbar-logo" />
      <button type="button" class="menu-btn" aria-label="menu"></button>
    </header>

    <h1>Dubai we<br />love you !</h1>

    <p class="t-lead">
      Share your portrait and become part of the living heart of the city.
    </p>

    <!-- Hero portraits block -->
    <div class="hero-block">
      <img
        src="/assets/welcome-portraits.png"
        alt="Portrait collage"
        class="hero-block__img"
      />

      <!-- Progress bar — [style.width.%] bound from portraitCount() -->
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-bar__fill" [style.width.%]="portraitCount()"></div>
      </div>

      <div class="stats">
        <span class="stats__item">{{ portraitCount() }} PORTRAITS</span>
        <span class="stats__item stats__item--live">
          <i class="pulse-dot" aria-hidden="true"></i>LIVE PULSE
        </span>
      </div>
    </div>

    <!-- Form panel -->
    <div class="form-panel">
      <app-ui-input label="Full Name" placeholder="Enter your name" [value]="fullName()" (valueChange)="fullName.set($event)" />
      @if (showErrors() && fullName().trim().length === 0) {
        <p class="field-error">Please enter your full name.</p>
      }
      <app-ui-input
        label="Nationality"
        placeholder="Select your nationality"
        [isSelect]="true"
        [options]="countryOptions()"
        [value]="nationality()"
        (valueChange)="nationality.set($event)"
      />
      @if (showErrors() && nationality().trim().length === 0) {
        <p class="field-error">Please select your nationality.</p>
      }
      <app-ui-input label="Email Address" type="email" placeholder="heartbeat@dubai.ae" [value]="email()" (valueChange)="email.set($event)" />
      @if (showErrors() && !isEmailValid()) {
        <p class="field-error">Please enter a valid email address.</p>
      }
    </div>

    <button type="button" class="action-btn" (click)="onJoinHeart()">
      JOIN THE HEART
    </button>

    <p class="agreement">
      BY JOINING, YOU AGREE TO BECOME PART OF THE PUBLIC DUBAI DIGITAL INSTALLATION.
    </p>

  </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WelcomeRegistrationPage {
  readonly countriesData = signal<CountryData[]>([
    // Page 1
    { country: "Andorra", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "United Arab Emirates", fileName: "/assets/framesFile/UAE.png", language: "Arabic" },
    { country: "Afghanistan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Antigua and Barbuda", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Anguilla", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Albania", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Armenia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Angola", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Antarctica", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Argentina", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "American Samoa", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Austria", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Australia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Aruba", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Åland Islands", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Azerbaijan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bosnia and Herzegovina", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Barbados", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bangladesh", fileName: "/assets/framesFile/Bangladesh.png", language: "Bangladesh" },
    { country: "Belgium", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Burkina Faso", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bulgaria", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bahrain", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Burundi", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 2
    { country: "Benin", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Saint Barthélemy", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bermuda", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Brunei Darussalam", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bolivia (Plurinational State of)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bonaire, Sint Eustatius and Saba", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Brazil", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bahamas (The)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bhutan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Bouvet Island", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Botswana", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Belarus", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Belize", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Canada", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cocos (Keeling) Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Congo (the Democratic Republic of the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Central African Republic (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Congo (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Switzerland", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Côte d'Ivoire", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cook Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Chile", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cameroon", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "China", fileName: "/assets/framesFile/China.png", language: "China" },

    // Page 3
    { country: "Colombia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Costa Rica", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cuba", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cabo Verde", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Curaçao", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Christmas Island", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cyprus", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Czechia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Germany", fileName: "/assets/framesFile/Germany.png", language: "Germany" },
    { country: "Djibouti", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Denmark", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Dominica", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Dominican Republic (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Algeria", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Ecuador", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Estonia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Egypt", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Western Sahara*", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Eritrea", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Spain", fileName: "/assets/framesFile/Spain.png", language: "Spain" },
    { country: "Ethiopia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Finland", fileName: "/assets/framesFile/Finland.png", language: "Finland" },
    { country: "Fiji", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Falkland Islands (the) [Malvinas]", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 4
    { country: "Micronesia (Federated States of)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Faroe Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "France", fileName: "/assets/framesFile/France.png", language: "France" },
    { country: "Gabon", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "United Kingdom of Great Britain and Northern Ireland (the", fileName: "/assets/framesFile/England.png", language: "England" },
    { country: "Grenada", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Georgia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "French Guiana", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guernsey", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Ghana", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Gibraltar", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Greenland", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Gambia (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guinea", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guadeloupe", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Equatorial Guinea", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Greece", fileName: "/assets/framesFile/Greece.png", language: "Greece" },
    { country: "South Georgia and the South Sandwich Islands", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guatemala", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guam", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guinea-Bissau", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Guyana", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Hong Kong", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Heard Island and McDonald Islands", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 5
    { country: "Honduras", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Croatia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Haiti", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Hungary", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Indonesia", fileName: "/assets/framesFile/Indonesia.png", language: "Indonesia" },
    { country: "Ireland", fileName: "/assets/framesFile/English.png", language: "English" },
    // { country: "Israel", fileName: "/assets/framesFile/English.png", language: "English" }, 
    { country: "Isle of Man", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "India", fileName: "/assets/framesFile/India.png", language: "India" },
    { country: "British Indian Ocean Territory (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Iraq", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Iran (Islamic Republic of)", fileName: "/assets/framesFile/Iran.png", language: "Iran" },
    { country: "Iceland", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Italy", fileName: "/assets/framesFile/Italy.png", language: "Italy" },
    { country: "Jersey", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Jamaica", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Jordan", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Japan", fileName: "/assets/framesFile/Japan.png", language: "Japan" },
    { country: "Kenya", fileName: "/assets/framesFile/Kenya.png", language: "Kenya" },
    { country: "Kyrgyzstan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Cambodia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Kiribati", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Comoros (the)", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Saint Kitts and Nevis", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 6
    { country: "Korea (the Democratic People's Republic of)", fileName: "/assets/framesFile/Korea.png", language: "Korea" },
    { country: "Korea (the Republic of)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Kuwait", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Cayman Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Kazakhstan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Lao People's Democratic Republic (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Lebanon", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Saint Lucia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Liechtenstein", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Sri Lanka", fileName: "/assets/framesFile/Sri Lanka.png", language: "Sri Lanka" },
    { country: "Liberia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Lesotho", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Lithuania", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Luxembourg", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Latvia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Libya", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Morocco", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Monaco", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Moldova (the Republic of)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Montenegro", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Saint Martin (French part)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Madagascar", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Marshall Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "North Macedonia", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 7
    { country: "Mali", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Myanmar", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Mongolia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Macao", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Northern Mariana Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Martinique", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Mauritania", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Montserrat", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Malta", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Mauritius", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Maldives", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Malawi", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Mexico", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Malaysia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Mozambique", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Namibia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "New Caledonia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Niger (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Norfolk Island", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Nigeria", fileName: "/assets/framesFile/Nigeria.png", language: "Nigeria" },
    { country: "Nicaragua", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Netherlands (Kingdom of the)", fileName: "/assets/framesFile/Netherlands.png", language: "Netherlands" },
    { country: "Norway", fileName: "/assets/framesFile/Norway.png", language: "Norway" },
    { country: "Nepal", fileName: "/assets/framesFile/Nepal.png", language: "Nepal" },

    // Page 8
    { country: "Nauru", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Niue", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "New Zealand", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Oman", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Panama", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Peru", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "French Polynesia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Papua New Guinea", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Philippines (the)", fileName: "/assets/framesFile/Philippines.png", language: "Philippines" },
    { country: "Pakistan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Poland", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Saint Pierre and Miquelon", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Pitcairn", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Puerto Rico", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Palestine, State of", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Portugal", fileName: "/assets/framesFile/Portugal.png", language: "Portugal" },
    { country: "Palau", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Paraguay", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Qatar", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Réunion", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Romania", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Serbia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Russian Federation (the)", fileName: "/assets/framesFile/Russia.png", language: "Russia" },
    { country: "Rwanda", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 9 
    { country: "Saudi Arabia", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Solomon Islands", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Seychelles", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Sudan (the)", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Sweden", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Singapore", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Slovenia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Svalbard", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Slovakia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Sierra", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "San", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Senegal", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Somalia", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Suriname", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "South", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Sao", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "El", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Sint", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Syrian", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Eswatini", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Saint Helena, Ascension and Tristan da Cunha and Jan Mayen Leone Marino Sudan Tome and Principe Salvador Maarten (Dutch part) Arab Republic (the) and Caicos Islands (the) French Southern Territories (the) Turks", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Chad", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 10
    { country: "Togo", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Thailand", fileName: "/assets/framesFile/Thailand.png", language: "Thailand" },
    { country: "Tajikistan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Tokelau", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Timor-Leste", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Turkmenistan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Tunisia", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Tonga", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Türkiye", fileName: "/assets/framesFile/Turkey.png", language: "Turkey" },
    { country: "Trinidad and Tobago", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Tuvalu", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Taiwan (Province of China)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Tanzania, the United Republic of", fileName: "/assets/framesFile/Tanzania.png", language: "Tanzania" },
    { country: "Ukraine", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Uganda", fileName: "/assets/framesFile/Uganda.png", language: "Uganda" },
    { country: "United States Minor Outlying Islands (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "United States of America (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Uruguay", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Uzbekistan", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Holy See (the)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Saint Vincent and the Grenadines", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Venezuela (Bolivarian Republic of)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Virgin Islands (British)", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Virgin Islands (U.S.)", fileName: "/assets/framesFile/English.png", language: "English" },

    // Page 11
    { country: "Viet Nam", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Vanuatu", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Wallis and Futuna", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Samoa", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Yemen", fileName: "/assets/framesFile/arabic.png", language: "Arabic" },
    { country: "Mayotte", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "South Africa", fileName: "/assets/framesFile/South Africa.png", language: "South Africa" },
    { country: "Zambia", fileName: "/assets/framesFile/English.png", language: "English" },
    { country: "Zimbabwe", fileName: "/assets/framesFile/English.png", language: "English" }
  ]);
  // readonly countryOptions: string[] = getNames().sort((a: string, b: string) => a.localeCompare(b));
  readonly countryOptions = computed(() =>
    this.countriesData().map((c: CountryData) => c.country)
      .filter((name: string) => name && name.trim().length > 0)
      .sort((a: string, b: string) => a.localeCompare(b))
  );

  readonly fullName = signal('');
  readonly nationality = signal('');
  readonly email = signal('');
  // readonly yearsInDubai = signal('');
  readonly language = signal('');
  readonly showErrors = signal(false);
  readonly isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim()));
  // readonly isYearsValid = computed(() => {
  //   return /^\d+$/.test(this.yearsInDubai().trim());
  // });
  readonly canProceed = computed(() => {
    return (
      this.fullName().trim().length > 0 &&
      this.nationality().trim().length > 0 &&
      this.isEmailValid()
      // &&
      // this.isYearsValid()
    );
  });

  private readonly router = inject(Router);
  private readonly appFlowStore = inject(AppFlowStore);
  private readonly http = inject(HttpClient);
  readonly portraitCount = signal<number | null>(null);

  onJoinHeart(): void {
    if (!this.canProceed()) {
      this.showErrors.set(true);
      return;
    }

    this.showErrors.set(false);

    // find the selected country object from the countriesData array
    const selectedCountryObj = this.countriesData().find((c: CountryData) => c.country === this.nationality());

    // const parsedYears = Number.parseInt(this.yearsInDubai(), 10);
    this.appFlowStore.setRegistration({
      fullName: this.fullName().trim(),
      nationality: this.nationality(),
      email: this.email().trim(),
      frameFileName: selectedCountryObj?.fileName || 'English.png',
      language: selectedCountryObj?.language || 'English',
      // yearsInDubai: Number.isFinite(parsedYears) ? parsedYears : null
    });

    this.router.navigateByUrl('/selfie');
  }

  // onYearsChange(value: string): void {
  //   this.yearsInDubai.set(value.replace(/\D+/g, ''));
  // }

  private getPortraitCount(): void {
    this.http.get(`${environment.apiUrl}/api/Users/count`).subscribe({
      next: (res: any) => {
        this.portraitCount.set(res?.usersCount);
      },
      error: (err) => {
        console.error('Error fetching portrait count:', err);
      }
    });
  }

  ngOnInit(): void {
    this.getPortraitCount();
  }
}
