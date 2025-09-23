import { Component, OnInit } from '@angular/core';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { CountryService } from 'src/app/shared/services/country.service';
import { DecimalPipe } from '@angular/common';
import { Country } from 'src/app/shared/models/country.model';
import { BonLivraison } from 'src/app/shared/models/livraison.model';
import { Pipe, PipeTransform } from '@angular/core';

import { Observable } from 'rxjs';
import { SortEvent } from 'src/app/shared/directives/sortable.directive';
declare module 'jspdf' {
  interface jsPDF {
      lastAutoTable: { finalY: number };
  }
}
@Component({
    selector: 'app-invoice-list',
    templateUrl: './livraisonlist.component.html',
    styleUrls: ['./livraisonlist.component.scss'],
    providers: [CountryService, DecimalPipe],

})
export class LivraisonlistComponent implements OnInit {
  allSelected: boolean;
  page = 1;
  pageSize = 8;
    commandes: BonLivraison[];
    countries$: Observable<Country[]>;
    bonCommande$: Observable<BonLivraison[]>;
    total$: Observable<number>;
    headers: any;

	  collectionSize ;
	  countries: Country[];
  pagination: any;


    constructor(
        private dl: DataLayerService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        public service: CountryService
    ) {
      this.countries$ = service.countries$;
     // this.refreshCountries();

    //  this.bonCommande$ = service.countries$

      this.total$ = service.total$;
    }

    ngOnInit() {
        this.loadInvoices();
    }
    onSort({ column, direction }: SortEvent) {
        // resetting other headers
        this.headers.forEach((header) => {
          if (header.sortable !== column) {
            header.direction = '';
          }
        });

        this.service.sortColumn = column;
        this.service.sortDirection = direction;
      }
    refreshCountries() {
        if (Array.isArray(this.commandes)) {
          this.commandes = this.commandes
            .map((commande, i) => ({ id: i + 1, ...commande }))  // Ajouter un ID incrémental
            .slice(
              (this.page - 1) * this.pageSize,  // Début de la page
              (this.page - 1) * this.pageSize + this.pageSize  // Fin de la page
            );
           // console.log(this.commandes)
        } else {
          console.error('commandes n\'est pas un tableau.');
        }
      }

    print(element: any) {
      console.log('Données à imprimer > ', element);

      // Créer une instance jsPDF
      const pdf = new jsPDF();

      // Convertir l'image en Base64 et l'ajouter
      const img = new Image();
      img.src = 'assets/images/logobeton.png'; // Chemin relatif vers l'image
      img.onload = () => {
        // Ajouter le logo en haut au centre
        const pageWidth = pdf.internal.pageSize.width; // Largeur de la page
        const logoWidth = 70; // Largeur du logo
        const logoHeight = 40; // Hauteur du logo
        const logoX = (pageWidth - logoWidth) / 2; // Centrer horizontalement
        pdf.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

        // Ajouter un en-tête
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("BON DE LIVRAISON", pageWidth / 2, 50, { align: "center" });
// Obtenir l'heure actuelle
        const now = new Date();
        const heureDepart = now.toLocaleTimeString();
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text("CLIENT: " + element.nom_client, 10, 60);
        pdf.text("Adresse Chantier : " + element.adresse, 10, 65);
        pdf.text("Heure départ : " + heureDepart, 10, 70);
       // pdf.text("Heure depart : ", 10, 70);

        // Ligne séparatrice
        pdf.line(10, 75, 200, 75);

        // Tableau des données
        autoTable(pdf, {
          startY: 80,
          head: [["Libelle", "Valeur"]], // Entêtes des colonnes
          body: [
            ["Date de commande", element.date_production],
            ["Date de production", element.date_production],
            ["Formulation", element.formule],
            ["Quantité Commandée", `${element.quantite_commandee} m³`],
            ["Quantité chargée", `${element.quantite_chargee} m³`],
            ["Quantité total chargée", `${element.quantite_totale_chargee} m³`],

            ["Quantité restante", `${element.quantite_restante} m³`],
            ["Chauffeur", `${element.nom_chauffeur} `],
            ["Plaque Camion", `${element.plaque_camion} `],
          ],
          theme: "grid",
          styles: {
            fontSize: 11,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: "center",
          },
          bodyStyles: {
            halign: "left",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        // Ajouter un espace pour la signature du client
        const finalY = pdf.lastAutoTable.finalY + 20; // Position après le tableau
        pdf.setFontSize(12);
        pdf.text("Client :", 10, finalY);
        pdf.line(30, finalY, 50, finalY); // Ligne horizontale

        // Texte "Chauffeur" avec une ligne après
        pdf.text("Chauffeur :", 75, finalY);
        pdf.line(100, finalY, 140, finalY); // Ligne horizontale

        // Texte "Opérateur" avec une ligne après
        pdf.text("Opérateur :", 145, finalY);
        pdf.line(175, finalY, 200, finalY);

        // Ajouter un pied de page
        const pageHeight = pdf.internal.pageSize.height;
        pdf.setFontSize(10);
        pdf.text("Merci pour votre confiance.", 10, pageHeight - 20);
        pdf.text("DC BETON - Tous droits réservés.", 10, pageHeight - 10);

        // Activer l'impression directe
        pdf.autoPrint(); // Activer le mode d'impression
        const pdfBlob = pdf.output('bloburl'); // Obtenir un URL blob
         window.open(pdfBlob); // Lancer directement la fenêtre d'impression
      };

      img.onerror = () => {
        console.error("Erreur lors du chargement de l'image.");
      };
    }


loadInvoices() {
  this.dl.getLivraison()
    .subscribe((res: any) => {
      // Récupère uniquement le tableau des livraisons
      this.commandes = res.livraisons || [];
      this.commandes = this.commandes.sort(
        (a, b) => new Date(b.date_production).getTime() - new Date(a.date_production).getTime()
      );
      console.log('Livraisons chargées :', this.commandes);
      // Si tu veux utiliser la pagination de l’API
      this.pagination = res.pagination;
    }, err => {
      console.error('Erreur lors du chargement des livraisons', err);
    });
}





    deleteInvoice(id, modal) {
        this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title', centered: true })
            .result.then((result) => {
                this.dl.deleteInvoice(id)
                    .subscribe(res => {
                        this.toastr.success('Bon de commande supprimé !', 'Succès!', { timeOut: 3000 });
                        this.loadInvoices();  // Recharge la liste après la suppression
                    });
            }, (reason) => {});
    }
}
