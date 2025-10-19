// src/app/core/interceptors/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  
  // Récupérer le token XSRF-TOKEN du cookie
  const csrfToken = cookieService.get('XSRF-TOKEN');
  
  // Cloner la requête et ajouter le header X-XSRF-TOKEN
  if (csrfToken) {
    req = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken
      }
    });
  }
  
  return next(req);
};