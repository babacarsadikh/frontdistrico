import { Component, OnInit, ViewChild } from '@angular/core';
import { echartStyles } from 'src/app/shared/echart-styles';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { ProductService } from 'src/app/shared/services/product.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend
} from "ng-apexcharts";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  colors: string[];
  xaxis: any; // Ajout de l'axe X
  yaxis: any; // Ajout de l'axe Y
  title: any; // Ajout d'un titre
};
const API_URL = 'https://api.districobon.com';

@Component({
  selector: 'app-dashboard-v2',
  templateUrl: './dashboard-v2.component.html',
  styleUrls: ['./dashboard-v2.component.scss']
})
export class DashboardV2Component implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  @ViewChild('generationrapport') generationrapport: any;

 // public chartOptions: Partial<ChartOptions>;
  chartPie1: any;
  chartLineOption3: any;
	products$: any;
  commandes;
  livraison;
  qtecommandes: number | null = null;
  Clients: any[] = [];
  clienselectione: number | null = null;
dateDebut: string = '';
dateFin: string = '';
statutFiltre: string | null = null;
  commandeData;
  commandeClientData;
  nmbrelivraison;
  Datedujour;
  totalalivre;
  rapportData;
  data = [];
  total_quantite_charge;
  chartOptions: any;
  constructor(
		private productService: ProductService,
    private dl : DataLayerService,
    private modalService: NgbModal,

	) {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Total Commandé', 'Total Chargé']
      },
      xAxis: {
        type: 'category',
        data: this.data.map(item => item.nom_client) // Noms des clients sur l'axe X
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Total Commandé',
          type: 'bar',
          data: this.data.map(item => item.quantite_commandee) // Données pour "Total Commandé"
        },
        {
          name: 'Total Chargé',
          type: 'bar',
          data: this.data.map(item => item.quantite_totale_chargee) // Données pour "Total Chargé"
        }
      ]
    };
   }
    loadClient() {
      this.dl.getClients().subscribe(res => {
        this.Clients = res;
      });
    }

   ngOnInit() {
    // Configuration du graphique en barres
    // this.chartOptions = {
    //   series: [
    //     {
    //       name: "Commandes",
    //       data: [] // Les données seront ajoutées dynamiquement
    //     },
    //     {
    //       name: "Livraisons",
    //       data: [] // Les données seront ajoutées dynamiquement
    //     }
    //   ],
    //   chart: {
    //     type: "bar",
    //     height: 350
    //   },
    //   plotOptions: {
    //     bar: {
    //       horizontal: false,
    //       columnWidth: "55%",
    //     }
    //   },
    //   dataLabels: {
    //     enabled: false
    //   },
    //   xaxis: {
    //     categories: [] // Les catégories seront ajoutées dynamiquement
    //   },
    //   yaxis: {
    //     title: {
    //       text: "Quantité"
    //     }
    //   },
    //   title: {
    //     text: "Évolution des Commandes et Livraisons",
    //     align: "center"
    //   },
    //   colors: ["#008FFB", "#00E396"] // Couleurs des barres
    // };

    // Appel des méthodes pour récupérer les données
    this.loadClient();
    this.getCommandeLength();
    this.getLivraisonEv();
    this.getCommande();
    this.getLivraisonToday();
    this.getCommandeQte();

  }
  openraaportmodel () {
    this.modalService.open(this.generationrapport, { centered: true });

  }
  transformerDonneesPourPDF(responseData: any) {
    const transformed = {
      total_charge: responseData.total_charge || 0,
      data: {} as any
    };

    const livraisons = responseData.data;

    // Vérifie si livraisons est bien un tableau
    if (!Array.isArray(livraisons)) {
      console.error("Données reçues invalides : 'data' n'est pas un tableau", livraisons);
      return transformed; // ou return null;
    }

    livraisons.forEach((livraison: any) => {
      const client = livraison.nom_client;
      const formule = livraison.formule;

      if (!transformed.data[client]) {
        transformed.data[client] = {};
      }

      if (!transformed.data[client][formule]) {
        transformed.data[client][formule] = {
          total_commande: 0,
          total_charge: 0
        };
      }

      transformed.data[client][formule].total_commande += livraison.quantite_commandee ?? 0;
      transformed.data[client][formule].total_charge += livraison.quantite_chargee ?? 0;
    });

    return transformed;
  }
// Vérifier si des filtres sont actifs
aFiltresActifs(): boolean {
  return !!(this.dateDebut || this.dateFin || this.statutFiltre);
}

// Obtenir le libellé du statut
getLibelleStatut(statut: string): string {
  const statuts: { [key: string]: string } = {
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'livree': 'Livrée',
    'annulee': 'Annulée'
  };
  return statuts[statut] || statut;
}

print(data: any) {
  console.log("Données à imprimer >", data);

  // Vérification des données
  if (!data?.client || !data?.commandes) {
    console.error("Données client ou commandes manquantes.");
    return;
  }

  const pdf = new jsPDF();
  const img = new Image();
  img.src = "assets/images/logobeton.png";

  img.onload = () => {
    // Constantes de configuration
    const UNIT = "m³";
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const logoWidth = 70;
    const logoHeight = 40;
    const logoX = (pageWidth - logoWidth) / 2;

    // Fonction de formatage
    const formatNumber = (value: number | string | undefined) => {
      if (value === undefined || value === null) return '0.00';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Fonction de formatage de date
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    // Logo
    pdf.addImage(img, "PNG", logoX, 10, logoWidth, logoHeight);

    // Titre principal
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("RAPPORT CLIENT - COMMANDES ET LIVRAISONS", pageWidth / 2, 55, { align: "center" });

    // Informations du client
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("INFORMATIONS CLIENT:", 14, 65);

    pdf.setFont("helvetica", "normal");
    const clientName = `${data.client.nom} ${data.client.prenom}`.trim();
    pdf.text(`Client: ${clientName}`, 14, 72);
    pdf.text(`ID Client: ${data.client.id}`, 14, 78);

    // Date du rapport
    const now = new Date();
    const dateReport = now.toLocaleDateString('fr-FR');
    const heureReport = now.toLocaleTimeString('fr-FR');
    pdf.text(`Date du rapport: ${dateReport} à ${heureReport}`, 14, 84);

    // Statistiques résumées
    const totalCommandes = data.commandes.length;
    const totalQuantiteCommandee = data.commandes.reduce((sum: number, cmd: any) =>
      sum + parseFloat(cmd.quantite_commandee || 0), 0);
    const totalQuantiteLivree = data.commandes.reduce((sum: number, cmd: any) =>
      sum + (cmd.quantite_livree || 0), 0);

    pdf.setFont("helvetica", "bold");
    pdf.text("RÉSUMÉ:", 14, 94);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Nombre de commandes: ${totalCommandes}`, 14, 100);
    pdf.text(`Quantité totale commandée: ${formatNumber(totalQuantiteCommandee)} ${UNIT}`, 14, 106);
    pdf.text(`Quantité totale livrée: ${formatNumber(totalQuantiteLivree)} ${UNIT}`, 14, 112);

    // Ligne de séparation
    pdf.line(10, 118, pageWidth - 10, 118);

    let startY = 125;

    // Parcourir chaque commande
    data.commandes.forEach((commande: any, index: number) => {
      // Vérifier si on besoin d'une nouvelle page
      if (startY > pageHeight - 100) {
        pdf.addPage();
        startY = 20;
      }

      // En-tête de la commande
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`COMMANDE ${index + 1}: ${commande.reference}`, 14, startY);

      // Détails de la commande
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      pdf.text(`Date commande: ${formatDate(commande.date_commande)}`, 14, startY + 7);
      pdf.text(`Chantier: ${commande.nom_chantier}`, 14, startY + 14);
      pdf.text(`Formule béton: ${commande.formule_beton}`, 14, startY + 21);
      pdf.text(`Statut: ${commande.statut}`, 14, startY + 28);

      // Quantités
      pdf.text(`Quantité commandée: ${formatNumber(commande.quantite_commandee)} ${UNIT}`, 100, startY + 7);
      pdf.text(`Quantité livrée: ${formatNumber(commande.quantite_livree)} ${UNIT}`, 100, startY + 14);
      pdf.text(`Quantité restante: ${formatNumber(commande.quantite_restante)} ${UNIT}`, 100, startY + 21);
      pdf.text(`Pourcentage livré: ${commande.pourcentage_livre}%`, 100, startY + 28);

      startY += 35;

      // Tableau des livraisons pour cette commande
      if (commande.livraisons && commande.livraisons.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("LIVRAISONS:", 14, startY);
        startY += 7;

        // Préparation des données du tableau
        const livraisonsData = commande.livraisons.map((livraison: any, livIndex: number) => [
          (livIndex + 1).toString(),
          livraison.reference,
          formatDate(livraison.date_production),
          `${formatNumber(livraison.quantite_chargee)} ${UNIT}`,
          livraison.statut,
          livraison.chauffeur_nom ? `${livraison.chauffeur_nom} ${livraison.chauffeur_prenom}`.trim() : 'N/A',
          livraison.plaque_immatriculation || 'N/A'
        ]);

        autoTable(pdf, {
          startY: startY,
          head: [["#", "Référence", "Date", "Quantité", "Statut", "Chauffeur", "Camion"]],
          body: livraisonsData,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontSize: 9,
            halign: "center",
          },
          bodyStyles: {
            halign: "left",
          },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },   // #
            1: { cellWidth: 25 },                    // Référence
            2: { cellWidth: 20 },                    // Date
            3: { cellWidth: 18, halign: 'right' },   // Quantité
            4: { cellWidth: 15, halign: 'center' },  // Statut
            5: { cellWidth: 25 },                    // Chauffeur
            6: { cellWidth: 20 }                     // Camion
          },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto'
        });

        startY = (pdf as any).lastAutoTable.finalY + 10;
      } else {
        pdf.setFont("helvetica", "italic");
        pdf.text("Aucune livraison pour cette commande", 14, startY);
        startY += 10;
      }

      // Séparation entre les commandes
      if (index < data.commandes.length - 1) {
        pdf.line(10, startY, pageWidth - 10, startY);
        startY += 15;
      }
    });

    // Résumé final
    if (startY < pageHeight - 50) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("RÉSUMÉ GÉNÉRAL", pageWidth / 2, startY + 10, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.text(`Total commandes: ${totalCommandes}`, 14, startY + 20);
      pdf.text(`Quantité totale commandée: ${formatNumber(totalQuantiteCommandee)} ${UNIT}`, 14, startY + 27);
      pdf.text(`Quantité totale livrée: ${formatNumber(totalQuantiteLivree)} ${UNIT}`, 14, startY + 34);

      const pourcentageTotal = totalQuantiteCommandee > 0 ?
        ((totalQuantiteLivree / totalQuantiteCommandee) * 100).toFixed(2) : '0.00';
      pdf.text(`Pourcentage global livré: ${pourcentageTotal}%`, 14, startY + 41);
    }

    // Pied de page
    pdf.setFontSize(8);
    pdf.setTextColor(128);
    pdf.text("DC BETON - Rapport généré automatiquement - Tous droits réservés.",
             pageWidth / 2, pageHeight - 10, { align: "center" });

    // Génération du PDF
    pdf.autoPrint();
    const pdfBlob = pdf.output("bloburl");
    window.open(pdfBlob);
  };

  img.onerror = () => {
    console.error("Erreur lors du chargement de l'image.");
    // Générer le PDF même sans image
    // ... (code de génération sans image)
  };
}

  getCommandeLength (){
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    this.dl.getCommandesbyDATE(formattedDate)
    .subscribe(res => {
        this.commandes = res['length'];
         console.log(this.commandes)

    });
  }
  getCommandeQte (){
    this.dl.getCommandes()
    .subscribe(res => {
      //  this.qtecommandes = res['total_quantite'];

    });

  }
  getCommande (){
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    this.dl.getCommandesbyDATE(formattedDate)
    .subscribe(res => {
        this.qtecommandes = res['total_quantite'];
       // console.log('bi',this.qtecommandes)
    });

  }

  getLivraison () {
    this.dl.getLivraison()
    .subscribe(res => {
        this.livraison = res['length'];
        this.commandeData = res['data']
        this.total_quantite_charge = res['total_quantite_chargee']
       // console.log(this.commandeData)

    });
  }
  getLivraisonToday (){
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    this.dl.getLivraisonPlageDate(formattedDate, formattedDate)
    .subscribe(res => {
      console.log('today :',res)
        this.totalalivre = res['total_charge']
        this.nmbrelivraison = res['total_livraisons']
       // this.print(res)



    });
  }
  getCommandeClient() {
    // Préparation des filtres
  const filters: any = {};

  if (this.dateDebut) filters.date_debut = this.dateDebut;
  if (this.dateFin) filters.date_fin = this.dateFin;
  if (this.statutFiltre) filters.statut = this.statutFiltre;
     this.dl.getCommandeClient(this.clienselectione , filters)
    .subscribe(res => {
        this.commandeClientData = res
        this.print(res)
        this.clearFiltres()
      //  console.log(res)

    });
  }
  clearFiltres(): void {
  this.dateDebut = '';
  this.dateFin = '';
  this.statutFiltre = null;
  this.clienselectione= null;
}
  getLivraisonPlage (modal) {
   // console.log(this.dateDebut)
    this.dl.getLivraisonPlageDate(this.dateDebut, this.dateFin)
    .subscribe(res => {
      console.log(res)
        this.rapportData = res['data']
        modal.close();  // Ferme le modal après confirmation
        const donneesPDF = this.transformerDonneesPourPDF(res);
        this.print(donneesPDF)



    });
  }
  getLivraisonEv () {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const formattedDatet = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  this.Datedujour = formattedDatet
    console.log(formattedDate)
    this.dl.getLivraisonEvolution(formattedDate)
    .subscribe(res => {
        this.data = res['data']
        this.updateChartOptions();


    });
  }
  updateChartOptions() {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Total Commandé', 'Total Chargé']
      },
      xAxis: {
        type: 'category',
        data: this.data.map(item => item.nom_client) // Noms des clients sur l'axe X
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Total Commandé',
          type: 'bar',
          data: this.data.map(item => item.total_commandee) // Données pour "Total Commandé"
        },
        {
          name: 'Total Chargé',
          type: 'bar',
          data: this.data.map(item => item.total_chargee) // Données pour "Total Chargé"
        }
      ]
    };
  }


}
