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

  // Créer une instance jsPDF en orientation paysage pour A4
  const pdf = new jsPDF('l', 'mm', 'a4');

  // Convertir l'image en Base64 et l'ajouter
  const img = new Image();
  img.src = 'assets/images/logobeton.png';

  // Image du cachet opérateur
  const cachetImg = new Image();
  cachetImg.src = 'assets/images/cachet.png'; // Assurez-vous d'avoir cette image

  img.onload = () => {
    cachetImg.onload = () => {
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const bonWidth = (pageWidth - 30) / 2;
      const centerX = pageWidth / 2;

      // Fonction pour générer un bon de livraison
      const genererBon = (startX: number, startY: number) => {
        // Ajouter le logo
        const logoWidth = 35;
        const logoHeight = 20;
        pdf.addImage(img, 'PNG', startX + 1, startY, logoWidth, logoHeight);

        // Titre
        pdf.setFontSize(15);
        pdf.setFont("helvetica", "bold");
        pdf.text("BON DE LIVRAISON", startX + bonWidth / 2, startY + 25, { align: "center" });

        // Informations client
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text("CLIENT: " + element.client_nom + " " + element.client_prenom, startX + 5, startY + 35);
        pdf.text("Adresse Chantier : " + (element.adresse_livraison_saisie || "Non spécifiée"), startX + 5, startY + 40);
        pdf.text("Heure départ : " + element.heure_depart, startX + 5, startY + 45);
        pdf.text("Heure d'arrivé : .......", startX + 5, startY + 50);

        // Tableau des données
        autoTable(pdf, {
          startY: startY + 55,
          margin: { left: startX + 5, right: 5 },
          tableWidth: bonWidth - 10,
          head: [["Libelle", "Valeur"]],
          body: [
            ["Date de commande", element.date_production],
            ["Date de production", element.date_production],
            ["Formulation", element.formule_nom],
            ["Quantité Commandée", `${element.quantite_commandee} m³`],
            ["Quantité chargée", `${element.quantite_chargee} m³`],
            ["Quantité totale chargée", `${element.quantite_total_livree} m³`],
            ["Quantité restante", `${element.quantite_restante} m³`],
            ["Chauffeur", `${element.chauffeur_nom} ${element.chauffeur_prenom} `],
            ["Plaque Camion", `${element.plaque_immatriculation}`],
          ],
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 2,
            minCellHeight: 5
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: "center",
            fontSize: 9
          },
          bodyStyles: {
            halign: "left",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        // Signatures et cachet
        const finalY = pdf.lastAutoTable.finalY + 10;
        pdf.setFontSize(10);

        // Cachet opérateur en bas à droite
        const cachetWidth = 25;
        const cachetHeight = 25;
        pdf.addImage(cachetImg, 'PNG', startX + bonWidth - cachetWidth - 5, finalY - 5, cachetWidth, cachetHeight);

        // Signatures
        pdf.text("Client :", startX + 5, finalY);
        pdf.line(startX + 15, finalY, startX + 40, finalY);

        pdf.text("Chauffeur :", startX + 50, finalY);
        pdf.line(startX + 70, finalY, startX + 90, finalY);

        pdf.text("Operateur :", startX + 100, finalY);
       // pdf.line(startX + 120, finalY, startX + bonWidth - cachetWidth - 10, finalY);

        // Pied de page complet centré
        const piedPageY = pageHeight - 15;

        pdf.setFontSize(7);
        pdf.setTextColor(100);

        // Première ligne : Adresse
        const adresse = "Adresse: 12, rue Calmette Dakar Plateau";
        const adresseWidth = pdf.getTextWidth(adresse);
        pdf.text(adresse, startX + (bonWidth - adresseWidth) / 2, piedPageY);

        // Deuxième ligne : Téléphone et NINEA
        const ligne2 = "Tél: 77 753 36 45    N.I.N.E.A : 010626333 2A2";
        const ligne2Width = pdf.getTextWidth(ligne2);
        pdf.text(ligne2, startX + (bonWidth - ligne2Width) / 2, piedPageY + 4);

        // Troisième ligne : RCCM
        const ligne3 = "R.C.C.M: SN DKR 2023 B 39905";
        const ligne3Width = pdf.getTextWidth(ligne3);
        pdf.text(ligne3, startX + (bonWidth - ligne3Width) / 2, piedPageY + 8);

        // Message de confiance au-dessus du pied de page
        pdf.setFontSize(8);
        pdf.setTextColor(0);
        pdf.text("Merci pour votre confiance.", startX + 5, piedPageY - 10);
      };

      // Générer le premier bon (à gauche)
      genererBon(10, 10);

      // Générer le deuxième bon (à droite)
      genererBon(centerX + 5, 10);

      // Ligne de séparation entre les deux bons
      pdf.setDrawColor(200, 200, 200);
      pdf.line(centerX, 10, centerX, pageHeight - 10);

      // Activer l'impression directe
      pdf.autoPrint();
      const pdfBlob = pdf.output('bloburl');
      window.open(pdfBlob);
    };

    cachetImg.onerror = () => {
      console.error("Erreur lors du chargement du cachet.");
      // Générer sans cachet si l'image n'est pas trouvée
      genererSansCachet();
    };
  };

  img.onerror = () => {
    console.error("Erreur lors du chargement de l'image.");
  };

  // Fonction de secours sans cachet
  const genererSansCachet = () => {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const bonWidth = (pageWidth - 30) / 2;
    const centerX = pageWidth / 2;

    const genererBon = (startX: number, startY: number) => {
      // ... (même code que précédemment, sans la partie cachet)

      // Signatures sans cachet
      const finalY = pdf.lastAutoTable.finalY + 10;
      pdf.setFontSize(9);

      pdf.text("Client :", startX + 5, finalY);
      pdf.line(startX + 15, finalY, startX + 40, finalY);

      pdf.text("Chauffeur :", startX + 50, finalY);
      pdf.line(startX + 65, finalY, startX + 95, finalY);

      pdf.text("Operateur :", startX + 100, finalY);
      //pdf.line(startX + 120, finalY, startX + bonWidth - 5, finalY);

      // Pied de page (même code)
      const piedPageY = pageHeight - 15;
      pdf.setFontSize(7);
      pdf.setTextColor(100);

      const adresse = "Adresse: 12, rue Calmette Dakar Plateau";
      const adresseWidth = pdf.getTextWidth(adresse);
      pdf.text(adresse, startX + (bonWidth - adresseWidth) / 2, piedPageY);

      const ligne2 = "Tél: 77 753 36 45    N.I.N.E.A : 010626333 2A2";
      const ligne2Width = pdf.getTextWidth(ligne2);
      pdf.text(ligne2, startX + (bonWidth - ligne2Width) / 2, piedPageY + 4);

      const ligne3 = "R.C.C.M: SN DKR 2023 B 39905";
      const ligne3Width = pdf.getTextWidth(ligne3);
      pdf.text(ligne3, startX + (bonWidth - ligne3Width) / 2, piedPageY + 8);

      pdf.setFontSize(8);
      pdf.setTextColor(0);
      pdf.text("Merci pour votre confiance.", startX + 5, piedPageY - 10);
    };

    genererBon(10, 10);
    genererBon(centerX + 5, 10);

    pdf.setDrawColor(200, 200, 200);
    pdf.line(centerX, 10, centerX, pageHeight - 10);

    pdf.autoPrint();
    const pdfBlob = pdf.output('bloburl');
    window.open(pdfBlob);
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
       this.commandes.forEach((livraison: BonLivraison) => {
        if (livraison.operateur_id) {
          this.dl.getOperateurById(livraison.operateur_id).subscribe(
            (operateur: any) => {
              livraison.operateur_nom = `${operateur.prenom ?? ''} ${operateur.nom ?? ''}`.trim();
            },
            (err) => {
              console.error(`Erreur opérateur ${livraison.operateur_id}`, err);
              livraison.operateur_nom = 'Inconnu';
            }
          );
        } else {
          livraison.operateur_nom = 'Non défini';
        }
      });

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
