import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { Hero } from './hero';
import {HEROES} from './mock-heroes';
import { MessageService } from "./message.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes'; // URL to web api

  constructor(private messageService: MessageService, private http: HttpClient) { }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap( _ => this.log('fetched heroes')),catchError(this.handleError<Hero[]>('getHeroes',[]))
    );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url)
      .pipe(
        tap(_ =>this.log(`fetched hero id= ${id}`)),
        catchError(this.handleError<Hero>(`getHero id= ${id}`))
      );
  }

  private handleError<T>(operation = 'operation',result?:T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation}failed: ${error.message}`);
      return of(result as T);
    }
  }

  updateHero(hero:Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap( _ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>("updateHero"))
    );
  }

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  addHero(hero:Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe( 
      tap((newHero: Hero) => this.log(`added new hero w/ id=${newHero.id}`))
    );
  }

  deleteHero(hero:Hero | number): Observable<Hero>{
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe( 
        tap( _ => this.log(`deleted hero id= ${id}`)),
        catchError(this.handleError<Hero>('DeleteHero'))
    );
  }

  searchHeroes(term:string): Observable<Hero[]> {
    if(!term.trim()){
      //if theres nothing to search, return an epty array
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching ${term}`) : 
        this.log(`Didn't found any hero matching ${term}`)),
      catchError(this.handleError<Hero[]>("searchHeroes",[]))  
    );
  }
}
