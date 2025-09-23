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

  commandeData;
  nmbrelivraison;
  Datedujour;
  dateDebut;
  totalalivre;
  dateFin;
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
    this.getLivraison();
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

  print(data: any) {
    console.log("Données à imprimer >", data);

    // Vérification des données
    if (!data?.data) {
      console.error("Données clients manquantes.");
      return;
    }

    if (typeof data.total_charge === "undefined") {
      console.warn("Total charge non défini, utilisation de 0 par défaut.");
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
      const formatNumber = (value: number | undefined) => {
        return value !== undefined ? value.toFixed(2) : '0.00';
      };

      // Logo
      pdf.addImage(img, "PNG", logoX, 10, logoWidth, logoHeight);

      // Titre
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("RAPPORT DE PRODUCTION", pageWidth / 2, 55, { align: "center" });

      // Date et informations
      const now = new Date();
      const dateReport = now.toLocaleDateString();
      const heureReport = now.toLocaleTimeString();

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(`TOTAL PRODUCTION: ${formatNumber(data.total_charge)} ${UNIT}`, 10, 65);
      pdf.text(`Date: ${dateReport} ${heureReport}`, 10, 72);

      // Ligne de séparation
      pdf.line(10, 78, pageWidth - 10, 78);

      // Préparation des données
      const summaryData = [];

      for (const client in data.data) {
        if (data.data.hasOwnProperty(client)) {
          const formules = data.data[client];
          for (const formule in formules) {
            if (formules.hasOwnProperty(formule)) {
              const formuleData = formules[formule];

              if (formuleData && typeof formuleData === "object") {
                const totalCommandee = formuleData.total_commande ?? 0;
                const totalChargee = formuleData.total_charge ?? 0;

                summaryData.push([
                  client || "Client inconnu",
                  formule || "Formulation non spécifiée",
                  `${formatNumber(totalCommandee)} ${UNIT}`,
                  `${formatNumber(totalChargee)} ${UNIT}`
                ]);
              } else {
                console.warn(`Données invalides pour ${client} / ${formule}`, formuleData);
              }
            }
          }
        }
      }

      // Tableau des données
      autoTable(pdf, {
        startY: 85,
        head: [["Clients", "Formulations", "Total Commandé", "Total Livré"]],
        body: summaryData,
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
        columnStyles: {
          0: { cellWidth: 40 },  // Colonne Clients
          1: { cellWidth: 40 },  // Colonne Formulations
          2: { cellWidth: 30, halign: 'right' },  // Total Commandé
          3: { cellWidth: 30, halign: 'right' }   // Total Livré
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Pied de page
      pdf.setFontSize(10);
      pdf.text("DC BETON - Tous droits réservés.", 10, pageHeight - 10);

      // Génération du PDF
      pdf.autoPrint();
      const pdfBlob = pdf.output("bloburl");
      window.open(pdfBlob);
    };

    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image.");
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
