import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';

import { Country } from '../models/country.model';
import { BonLivraison } from '../models/livraison.model';
import { COUNTRIES } from '../data/countries';
import { SortColumn, SortDirection } from '../directives/sortable.directive';
import { DataLayerService } from './data-layer.service';

interface SearchResult {
  commandes: BonLivraison[];
  countries: Country[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort<T>(data: T[], column: SortColumn, direction: string): T[] {
  if (direction === '' || column === '') {
    return data;
  }
  return [...data].sort((a, b) => {
    const res = compare((a as any)[column], (b as any)[column]);
    return direction === 'asc' ? res : -res;
  });
}

function matchesCommande(commande: any, searchTerm: string): boolean {
  if (!commande || !searchTerm) return false;
  return commande.nomclient?.toLowerCase().includes(searchTerm.toLowerCase());
}


function matches(country: Country, term: string, pipe: PipeTransform): boolean {
  return (
    country.name.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(country.area).includes(term) ||
    pipe.transform(country.population).includes(term)
  );
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _countries$ = new BehaviorSubject<Country[]>([]);
  private _commandes$ = new BehaviorSubject<BonLivraison[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: DecimalPipe, private dataLayerService: DataLayerService) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._countries$.next(result.countries);
        this._commandes$.next(result.commandes);
        this._total$.next(result.total);
      });

    this.fetchCommandes();
    this._search$.next();
  }

  // Getters for observables
  get countries$(): Observable<Country[]> {
    return this._countries$.asObservable();
  }
  get commandes$(): Observable<BonLivraison[]> {
    return this._commandes$.asObservable();
  }
  get total$(): Observable<number> {
    return this._total$.asObservable();
  }
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  // Getters and setters for state
  get page() {
    return this._state.page;
  }
  set page(page: number) {
    this._set({ page });
  }
  get pageSize() {
    return this._state.pageSize;
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  get searchTerm() {
    return this._state.searchTerm;
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private fetchCommandes() {
    this.dataLayerService.getInvoices().subscribe((commandes) => {
      this._commandes$.next(commandes);
      console.log('all commandes ',commandes['data'])
    });
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    // 1. Sort
    let countries = sort(COUNTRIES, sortColumn, sortDirection);

  // Assurez-vous que commandes est un tableau
  let commandes = this._commandes$.getValue();
  if (commandes && commandes['data']) {
    commandes = commandes['data']; // Extraire le tableau de la propriété 'data'
  } else if (!Array.isArray(commandes)) {
    console.error("Commandes n'est pas un tableau ou ne contient pas de propriété 'data'", commandes);
    commandes = []; // Définit un tableau vide par défaut
  }

  commandes = sort(commandes, sortColumn, sortDirection);

    // 2. Filter
    countries = countries.filter((country) => matches(country, searchTerm, this.pipe));
    commandes = commandes.filter((commande) => matchesCommande(commande, searchTerm));

    // 3. Paginate
    const total = countries.length + commandes.length;
    countries = countries.slice((page - 1) * pageSize, page * pageSize);
    commandes = commandes.slice((page - 1) * pageSize, page * pageSize);

    return of({ countries, commandes, total });
  }
}
