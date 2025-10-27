import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Utils } from '../utils';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SortColumn, SortDirection } from '../directives/sortable.directive';
import { Chauffeur } from '../models/chauffeur.model';

interface SearchResult {
  countries: Chauffeur[];
  total: number;
}
interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
    private _loading$ = new BehaviorSubject<boolean>(true);
    private _search$ = new Subject<void>();
    private _chauffeur$ = new BehaviorSubject<Chauffeur[]>([]);
    private _total$ = new BehaviorSubject<number>(0);


private apiUrl = 'https://api.districobon.com';
   // private apiUrl = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    getInvoices() : Observable<any[]>{
        return this.http.get<any[]>(`${this.apiUrl}/rapports`);
    }
 getOperateur() : Observable<any[]>{
        return this.http.get<any[]>(`${this.apiUrl}/auth/operateurs`);
    }
     getOperateurById(id) : Observable<any[]>{
        return this.http.get<any[]>(`${this.apiUrl}/auth/operateurs/${id}`);
    }
    getLivraison () :Observable<any[]>{
      return this.http.get<any[]>(`${this.apiUrl}/livraisons`);
   }
   getLivraisonById(id): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/livraisons/${id}`);
    }
   getCommandeClient(id: number, filters?: any): Observable<any> {
  let url = `${this.apiUrl}/clients/${id}/commandes`;

  // Ajouter les filtres s'ils sont fournis
  if (filters) {
    const params = new URLSearchParams();

    if (filters.date_debut) params.append('date_debut', filters.date_debut);
    if (filters.date_fin) params.append('date_fin', filters.date_fin);
    if (filters.statut) params.append('statut', filters.statut);

    const queryString = params.toString();
    if (queryString) {
      url += '?' + queryString;
    }
  }

  return this.http.get<any>(url);
}
   getLivraisonEvolution (date ) :Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/livraisons/evolutions?date=${date}`);
   }
getLivraisonPlageDate(date_debut: string, date_fin: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/livraisons/plage-dates?date_debut=${date_debut}&date_fin=${date_fin}`);
}


    getCommandes(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/commandes`);
    }
    login(logindata: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/operateurs/connexion`, logindata);
    }
    getCommandesbyDATE(date): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/commandes/date?date=${date}`);
    }
  supprimerCommande(idCommande: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/commandes/${idCommande}`);
  }
   supprimerClient(idClient: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${idClient}`);
  }
  updateCommande(idCommande: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/commandes/${idCommande}`, data);
  }
    getCommandesLen(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/commandes/date?date=`);
    }
      getClientById(id): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/clients/${id}`);
    }
    getClients(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/clients`);
    }
      getClientsChantier( idClient : number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/clients/${idClient}`);
    }
    addClient(client: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/clients`, client);
    }
    createLivraison (livraisons: any){
      return this.http.post<any[]>(`${this.apiUrl}/livraisons`, livraisons);

     }
     nouveauChantier (chantier: any){
      return this.http.post<any[]>(`${this.apiUrl}/chantiers`, chantier);

     }
     addAdresseToClient(id_client: number, adresse: string) {
  return this.http.post(`/api/adresses`, { id_client, adresse });
}

     createCommande (livraisons: any){
      return this.http.post<any[]>(`${this.apiUrl}/commandes`, livraisons);

     }
     getAdressesChantier () {
      return this.http.get<any[]>(`${this.apiUrl}/adresses`);

     }
     AdressesChantier (adresses : any) {
      return this.http.post<any[]>(`${this.apiUrl}/adresses`, adresses);

     }
    getInvoice(id) {
        return this.http.get<any[]>(`${this.apiUrl}/commande/${id}`);
    }
    ajouterchauffeur (chauffeur){
      return this.http.post<any[]>(`${this.apiUrl}/chauffeurs`, chauffeur);

    }
     ajoutercamion (camion){
      return this.http.post<any[]>(`${this.apiUrl}/camions`, camion);

    }
    getAllchauffeur () {
      return this.http.get<any[]>(`${this.apiUrl}/chauffeurs`);

    }
      getCamions () {
      return this.http.get<any[]>(`${this.apiUrl}/camions`);

    }
     ajouterformule (formule){
      return this.http.post<any[]>(`${this.apiUrl}/formules`, formule);

    }
    getFormule () {
      return this.http.get<any[]>(`${this.apiUrl}/formules`);

    }

    getTotalChauffeurs(): Observable<number> {
      return this.http.get<number>(`${this.apiUrl}/getAllChauffeurs`);
    }

    saveInvoice(invoice: any) {
        if (invoice.id) {
            return this.http.put<any[]>(`${this.apiUrl}/commande/${invoice.id}`, invoice);
        } else {
            invoice.id = Utils.genId();
            return this.http.post<any[]>(`${this.apiUrl}/ajouterBonCommande`, invoice);
        }
    }
    updateNomcommande (commande, id: string){
      return this.http.put<any[]>(`${this.apiUrl}/updateCommande/${id}`, commande);

    }
   ajouterBon (commande: any){
    return this.http.post<any[]>(`${this.apiUrl}/ajouterBonCommande`, commande);

   }
   getBoncommande (id){
    return this.http.get<any[]>(`${this.apiUrl}/commande/${id}`);

   }

    deleteInvoice(id: number) {
        return this.http.delete<any[]>(`${this.apiUrl}/invoices/${id}`);
    }

    getMails() {
        return this.http.get<any[]>(`${this.apiUrl}/mails`);
    }

    getCountries() {
        return this.http.get<any[]>(`${this.apiUrl}/countries`);
    }

    getProducts() {
        return this.http.get<any[]>(`${this.apiUrl}/products`);
    }
}
