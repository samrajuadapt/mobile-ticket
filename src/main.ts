import './polyfills';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';


if (environment.production) {
    enableProdMode();
    console.log('production mode active');
}else{
    console.log('development mode active');
}
platformBrowserDynamic().bootstrapModule(AppModule);




