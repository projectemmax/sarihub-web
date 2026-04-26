import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register } from 'swiper/element/bundle';
import localeFil from '@angular/common/locales/fil';
import { registerLocaleData } from '@angular/common';

register();
registerLocaleData(localeFil); 

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
