import { Component, OnInit, ViewChild ,TemplateRef} from '@angular/core';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  selectedCommande: any = null;
  ajoutQuantite: number = 0;
  allSelected: boolean;
  page = 1;
  pageSize = 8;
  @ViewChild('confirmationLivraisonModal') confirmationLivraisonModal: any;
  @ViewChild('editQuantiteModal') editQuantiteModal!: TemplateRef<any>;

    formules;
    commandes: any[] = [];
    commandeSelectionnee: any = null;
    quantiteChargee: number = 0;
    erreurQuantiteChargee: boolean = false;
    quantitedeCommande: number = 0;
   // chauffeurSelectionne: number =0;
   // chantiersDuClient: any[] = [];
    formuleselectione;
   // chantierSelectione: number = null;

    datecommande;
    plaqueCamion: string = '';
chauffeurSelectionne: any = null;
   // Clients;
    Clients: any[] = [];
clienselectione: number | null = null;
chantiersDuClient: any[] = [];
chantierSelectione: number | null = null;
    clients: any[] = [];
    chauffeurs; // Charger les chauffeurs si nécessaire
    adresses: any[] = []; // Liste des adresses disponibles
    adresseSelectionnee: number = 0;
    adresseLivraison: string = '';
    filteredAdresses!: Observable<any[]>;
    adresseCtrl = new FormControl('');

    constructor(
        private dl: DataLayerService,
        private modalService: NgbModal,
        private toastr: ToastrService,

    ) {

     }
     openEditQuantiteModal(commande: any) {
      this.selectedCommande = commande;
      this.ajoutQuantite = 0;
      this.modalService.open(this.editQuantiteModal);
    }
    ngOnInit() {
        this.loadCommandes();
        this.loadChauffeurs();
        this.loadformules();
        this.loadClient();

    }
    private _filter(value: string): any[] {
      const filterValue = value.toLowerCase();
      return this.adresses.filter(adresse =>
        adresse.adresse.toLowerCase().includes(filterValue)
      );
    }
onClientChange() {
  if (!this.clienselectione) {
    this.chantiersDuClient = [];
    this.chantierSelectione = null;
    return;
  }

  // Appel API pour récupérer les chantiers du client sélectionné
  this.dl.getClientById(this.clienselectione).subscribe((client: any) => {
    this.chantiersDuClient = client.chantiers || [];
    this.chantierSelectione = null; // reset chantier sélectionné
  });
}
    updateCommande(modal: any) {
      if (!this.selectedCommande || !this.ajoutQuantite || this.ajoutQuantite <= 0) {
        return; // sécurité
      }
      const ancienneQuantite = parseFloat(this.selectedCommande.quantite_commandee);
      const ajout = parseFloat(this.ajoutQuantite.toString());

      const nouvelleQuantite = ancienneQuantite + ajout;
      const dateProduction = this.selectedCommande.date_production?.split('T')[0]; // '2025-05-09T00:00:00.000Z' → '2025-05-09'

      const updatedCommande = {
        id_client: this.selectedCommande.id_client,
        formule: this.selectedCommande.formule,
        quantite_commandee: nouvelleQuantite,
        date_production: dateProduction
      };

      this.dl.updateCommande(this.selectedCommande.id_commande, updatedCommande)
        .subscribe({
          next: (res) => {
            this.selectedCommande.quantite_commandee = nouvelleQuantite;
            this.loadCommandes();
            modal.close();
          },
          error: (err) => {
            console.error("Erreur lors de la mise à jour :", err);
          }
        });
    }
   onChauffeurChange() {
  if (this.chauffeurSelectionne) {
    this.plaqueCamion = this.chauffeurSelectionne.plaque_immatriculation;
  } else {
    this.plaqueCamion = '';
  }
}
    validerQuantiteChargee() {
      if (this.commandeSelectionnee && this.quantiteChargee > this.commandeSelectionnee.quantite_restante) {
        this.erreurQuantiteChargee = true; // Afficher l'erreur
      } else {
        this.erreurQuantiteChargee = false; // Cacher l'erreur
      }
    }
    loadAdresses() {
      this.dl.getAdressesChantier().subscribe(res => {
        this.adresses = res['data'];
        console.log(this.adresses);
        this.filteredAdresses = this.adresseCtrl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || ''))
        );
      });
    }
    loadClient() {
      this.dl.getClients().subscribe(res => {
        this.Clients = res;
      });
    }
loadCommandes() {
  this.dl.getCommandes().subscribe((res: any) => {
    this.commandes = res.commandes;
  });
}


loadformules() {
        this.dl.getFormule()
            .subscribe(res => {
                this.formules = res;
            });
    }

    loadChauffeurs() {
        this.dl.getAllchauffeur()
            .subscribe(res => {
                this.chauffeurs = res;
                console.log(this.chauffeurs);
            });
    }
    afficherPlaque() {
      const chauffeur = this.chauffeurs.find(c => c.id === this.chauffeurSelectionne);
      this.plaqueCamion = chauffeur ? chauffeur.plaque_camion : '';
    }
    openLivraisonModal(commande, modal: any) {
        this.commandeSelectionnee = commande;
        this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title', centered: true });
    }
    openCommandeModal (modal: any) {
      this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title', centered: true });

    }

   confirmerLivraison(modal: any) {
  // Vérification des champs obligatoires
  if (!this.quantiteChargee || !this.chauffeurSelectionne || !this.adresseLivraison) {
    this.toastr.warning('Veuillez renseigner tous les champs.', 'Attention');
    return;
  }

  // Vérification de la commande sélectionnée
  if (!this.commandeSelectionnee) {
    this.toastr.error('Aucune commande sélectionnée.', 'Erreur');
    return;
  }

  // Validation de la quantité chargée
  if (this.quantiteChargee > this.commandeSelectionnee.quantite_restante) {
    this.toastr.warning('La quantité chargée ne peut pas dépasser la quantité restante.', 'Attention');
    return;
  }

  // Préparation des données pour l'API
  const livraisonData = {
    commande_id: this.commandeSelectionnee.id,
    chauffeur_id: this.chauffeurSelectionne.id,
    camion_id: this.chauffeurSelectionne.camion_id,
    operateur_id: 1,
    formule_beton_id: this.commandeSelectionnee.formule_beton_id ?? 0,
    quantite_chargee: this.quantiteChargee,
    date_production: new Date().toISOString().split('T')[0],
    heure_depart: new Date().toISOString().slice(0, 19).replace('T', ' '), // format SQL
    statut: 'livre',
    notes: this.adresseLivraison
  };

  console.log("📦 Données envoyées à l'API :", livraisonData);

  // Appel à l'API pour créer la livraison
  this.dl.createLivraison(livraisonData).subscribe(
    (res :  any) => {
      if (res) {
        this.toastr.success('Livraison ajoutée avec succès !', 'Succès');
        modal.close(); // Fermer la modal après succès
         console.log(res)
         this.dl.getLivraisonById(res.id).subscribe(
          (details) => {
            console.log("📥 Données complètes livraison :", details);
            this.print(details); // Impression avec toutes les infos complètes
            this.loadCommandes();
          },
          (err) => {
            console.error("Erreur lors du fetch getLivraisonById :", err);
            this.toastr.error("Impossible de récupérer les détails de la livraison.", "Erreur");
          }
        );
      //  this.print(donnee);

      this.loadCommandes();

        // Réinitialiser les champs après succès
        this.commandeSelectionnee = null;
        this.quantiteChargee = null;
        this.chauffeurSelectionne = null;
        this.adresseLivraison = null;
        this.plaqueCamion = '';
      } else {
        this.toastr.error('Réponse invalide du serveur.', 'Erreur');
      }
    },
    (err) => {
      console.error("❌ Erreur API :", err);
      this.toastr.error('Erreur lors de l’ajout de la livraison.', 'Erreur');
    }
  );
}

   print(element: any) {
  console.log('Données à imprimer > ', element);

  // Créer une instance jsPDF en orientation paysage pour A4
  const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' pour landscape, 'mm' pour millimètres, 'a4' pour format A4

  // Convertir l'image en Base64 et l'ajouter
  const img = new Image();
  img.src = 'assets/images/logobeton.png';

  img.onload = () => {
    const pageWidth = pdf.internal.pageSize.width; // Largeur de la page paysage (297mm)
    const pageHeight = pdf.internal.pageSize.height; // Hauteur de la page paysage (210mm)

    // Largeur pour chaque bon (moitié de la page moins les marges)
    const bonWidth = (pageWidth - 30) / 2; // 30mm de marge totale
    const centerX = pageWidth / 2;

    // Fonction pour générer un bon de livraison
    const genererBon = (startX: number, startY: number) => {
      // Ajouter le logo
      const logoWidth = 35; // Réduit pour s'adapter à la moitié de page
      const logoHeight = 20;
      pdf.addImage(img, 'PNG', startX + 1, startY, logoWidth, logoHeight);

      // Titre
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("BON DE LIVRAISON", startX + bonWidth / 2, startY + 25, { align: "center" });

      // Informations client
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("CLIENT: " + element.client_nom + " " + element.client_prenom, startX + 5, startY + 35);
      pdf.text("Adresse Chantier : " + (element.adresseLivraison || element.chantier_adresse || "Non spécifiée"), startX + 5, startY + 40);
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
          ["Quantité total chargée", `${element.quantite_total_livree} m³`],
          ["Quantité restante", `${element.quantite_commandee - element.quantite_chargee} m³`],
          ["Chauffeur", `${element.chauffeur_prenom} ${element.chauffeur_nom}`],
          ["Plaque Camion", `${element.plaque_immatriculation}`],
        ],
        theme: "grid",
        styles: {
          fontSize: 8, // Taille réduite pour s'adapter
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

      // Signatures
      const finalY = pdf.lastAutoTable.finalY + 10;
      pdf.setFontSize(9);

      // Client
      pdf.text("Client :", startX + 5, finalY);
      pdf.line(startX + 15, finalY, startX + 40, finalY);

      // Chauffeur
      pdf.text("Chauffeur :", startX + 50, finalY);
      pdf.line(startX + 65, finalY, startX + 95, finalY);
      pdf.text("Operateur :", startX + 100, finalY);
      // Pied de page
      pdf.setFontSize(8);
      pdf.text("Merci pour votre confiance.", startX + 5, finalY + 15);
      pdf.text("DC BETON - Tous droits réservés.", startX + 5, finalY + 20);
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

  img.onerror = () => {
    console.error("Erreur lors du chargement de l'image.");
  };
}

    // confirmAddCommande (modal) {
    //     const CommandeData = {
    //       id_client : this.clienselectione,
    //       formule : this.formuleselectione,
    //       quantite_commandee: this.quantitedeCommande,
    //       quantite_restante: this.quantitedeCommande,
    //       date_production: this.datecommande
    //     }
    //     console.log(CommandeData)
    //     this.dl.createCommande(CommandeData)
    //     .subscribe(res =>  {

    //       this.toastr.success('Commande ajoutée avec succès !', 'Succès');
    //       modal.close();  // Ferme le modal après confirmation
    //       this.loadCommandes();  // Recharge la liste des commandes
    //       //this.modalService.open(this.confirmationLivraisonModal, { centered: true });

    //     },
    //     (err) => {
    //       this.toastr.error('Erreur lors de l’ajout de la commande.', 'Erreur');
    //     });
    // }
    confirmAddCommande(modal: any) {
  const CommandeData = {
    client_id: this.clienselectione,       // id du client sélectionné
    chantier_id: this.chantierSelectione,  // id du chantier sélectionné
    formule_beton_id: this.formuleselectione, // id de la formule
    operateur_id:  1, // id de l'opérateur
    quantite_commandee: this.quantitedeCommande,
    quantite_restante: this.quantitedeCommande,
    date_commande: this.datecommande,
    date_livraison_prevue:  null,
    notes: ''
  };

  console.log('Commande à créer :', CommandeData);

  this.dl.createCommande(CommandeData).subscribe(
    res => {
      this.toastr.success('Commande ajoutée avec succès !', 'Succès');
      modal.close();  // Ferme le modal
      this.loadCommandes();  // Recharge la liste des commandes
    },
    err => {
      console.error(err);
      this.toastr.error('Erreur lors de l’ajout de la commande.', 'Erreur');
    }
  );
}

    deleteInvoice(idCommande: number, deleteConfirmModal: any): void {
      // Ouvrir la modal de confirmation
      console.log(idCommande)
      this.modalService.open(deleteConfirmModal).result.then(
        (result) => {
          if (result === 'confirm') {
            // Si l'utilisateur confirme, supprimer la commande
            this.dl.supprimerCommande(idCommande).subscribe(
              (response) => {
                this.toastr.success('Bon de commande supprimé !', 'Succès!', { timeOut: 3000 });
                this.loadCommandes(); // Recharger la liste des commandes
              },
              (error) => {
                console.error('Erreur lors de la suppression de la commande', error);
              }
            );
          }
        },
        (reason) => {
          console.log('Modal annulée', reason);
        }
      );
    }


}
