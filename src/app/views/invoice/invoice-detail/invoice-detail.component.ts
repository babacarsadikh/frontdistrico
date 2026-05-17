import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { Utils } from 'src/app/shared/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  drivers = ['FALLOU', 'MBACKE', 'ZALE']; // Liste des chauffeurs disponibles
  chauffeur;
  viewMode: 'edit' | 'print' = 'edit'; // Mode de vue
  id: string; // ID de la facture
  isNew: boolean; // Indique si c'est une nouvelle facture
  invoice: any = {}; // Données de la facture
  invoiceForm: UntypedFormGroup; // Formulaire de la facture
  invoiceFormSub: Subscription; // Subscription pour écouter les changements du formulaire
  subTotal: number = 0; // Sous-total calculé
  saving: boolean = false; // Indique si une sauvegarde est en cours
  dataCommande = {
    nomclient: "mbaye",
    adresse_chantier: "MERMOZ",
    quantite_commande: 25,
    quantite_charge: 25,
    quantite_restante: 0,
    formulation: "C30",
    plaque_camion: "AA-3823EE",
    livraison_type: "toupie",
    statut: "Livrée",
    date_commande: "2025-01-09",
    date_production: "2025-01-09",
    heure_depart: "10:00",
    heure_darrive: null,
    chauffeur: "MODOU fkk",
  };
  selectedPlaqueCamion: string = '';



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    private dl: DataLayerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id']; // Récupère l'ID de l'URL
    this.isNew = !this.id; // Vérifie si c'est une nouvelle facture
    this.loadChauffeur();

    this.buildInvoiceForm(this.invoice);

    if (this.id) {
      this.viewMode = 'print';
      this.loadInvoice();
    }
  }

  buildInvoiceForm(i: any = {}) {
    this.invoiceForm = this.fb.group({
      nomclient: [i.nomclient || ''],
      adresse_chantier: [i.adresse_chantier || ''],
      quantite_commande: [i.quantite_commande || 0],
      quantite_charge: [i.quantite_charge || 0],
      quantite_restante: [i.quantite_restante || 0],
      formulation: [i.formulation || ''],
      statut: [i.statut || 'En attente'],
      plaque_camion: [i.plaque_camion || ''],
      livraison_type: [i.livraison_type || 'toupie'],
      date_commande: [i.date_commande ? Utils.dateToNgbDate(i.date_commande) : {}],
      date_production: [i.date_production ? Utils.dateToNgbDate(i.date_production) : {}],
      heure_depart: [i.heure_depart || '10:20'],
      heure_darrive: [i.heure_darrive || null],
      chauffeur: [i.chauffeur || null],
    //  items: this.fb.array([]), // Initialisation d'un tableau vide pour les items
    });

    // Abonnement aux changements du formulaire
    if (this.invoiceFormSub) {
      this.invoiceFormSub.unsubscribe();
    }
    this.invoiceFormSub = this.invoiceForm.valueChanges.subscribe((formValue) => {
      this.subTotal = this.calculateSubtotal(formValue);
    });
  }
  loadChauffeur(){
    this.dl.getAllchauffeur()
    .subscribe(res => {
       this.chauffeur = res;
       this.chauffeur = this.chauffeur.chauffeurs
       console.log(this.chauffeur)



    });
  }
  print(){
    alert('ready')
  }
  loadInvoice() {
    this.dl.getBoncommande(this.id)
      .pipe(
        catchError((error) => {
          this.toastr.error('Erreur lors du chargement de la commande', 'Erreur!');
          this.router.navigateByUrl('/invoice');
          throw error; // Rethrow the error
        })
      )
      .subscribe((res) => {
        this.invoice = res;
        console.log(this.invoice)
        this.buildInvoiceForm(this.invoice);
        this.subTotal = this.calculateSubtotal(this.invoiceForm.value);
      });
  }
  formatDate(date: any): string {
    if (!date) {
      return null;
    }

    // Si c'est un NgbDate, convertissez-le en chaîne
    if (date.year && date.month && date.day) {
      const month = date.month < 10 ? `0${date.month}` : date.month;
      const day = date.day < 10 ? `0${date.day}` : date.day;
      return `${date.year}-${month}-${day}`;
    }

    // Si c'est un objet Date natif
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  saveInvoice() {
    this.saving = true;
    this.invoice = this.invoiceForm.value;
    console.log(this.invoiceForm.value)
      this.dataCommande = {
        nomclient: this.invoiceForm.get('nomclient').value,
        adresse_chantier: this.invoiceForm.get('adresse_chantier').value,
        quantite_commande: this.invoiceForm.get('quantite_commande').value,
        quantite_charge: this.invoiceForm.get('quantite_charge').value,
        quantite_restante: this.invoiceForm.get('quantite_restante').value,
        formulation: this.invoiceForm.get('formulation').value,
        plaque_camion: this.invoiceForm.get('chauffeur').value?.plaque_camion || '',
        livraison_type: this.invoiceForm.get('livraison_type').value,
        statut: this.invoiceForm.get('statut').value,
        date_commande: (this.invoiceForm.get('date_commande').value),
        date_production: (this.invoiceForm.get('date_commande').value),
        heure_depart: this.invoiceForm.get('heure_depart').value,
        heure_darrive: this.invoiceForm.get('heure_darrive').value,
        chauffeur: this.invoiceForm.get('chauffeur').value?.nom || '',
      };
 // console.log(this.dataCommande)


    this.dl.ajouterBon(this.dataCommande)
      .pipe(
        catchError((error) => {
          this.saving = false;
          this.toastr.error('Erreur lors de l\'enregistrement de la commande', 'Erreur!');
          throw error; // Rethrow the error
        })
      )
      .subscribe(() => {
        this.viewMode = 'print';
        this.saving = false;
        this.toastr.success('Commande enregistrée avec succès!', 'Succès', { timeOut: 3000 });


      });
  }

  calculateSubtotal(invoice) {
    let total = 0;
    if (invoice.items) {
      invoice.items.forEach((i) => {
        total += i.unit * i.unitPrice;
      });
    }
    return total;
  }

  ngOnDestroy() {
    if (this.invoiceFormSub) {
      this.invoiceFormSub.unsubscribe();
    }
  }
}
