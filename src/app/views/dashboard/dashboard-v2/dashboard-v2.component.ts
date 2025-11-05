import { Component, OnInit, ViewChild } from '@angular/core';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { ChartComponent } from 'ng-apexcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ChartOptions = {
  series: any[];
  chart: any;
  xaxis: any;
  yaxis: any;
  colors: string[];
  dataLabels: any;
  legend: any;
  title: any;
};

@Component({
  selector: 'app-dashboard-v2',
  templateUrl: './dashboard-v2.component.html',
  styleUrls: ['./dashboard-v2.component.scss']
})
export class DashboardV2Component implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  // === Données ===
  Clients: any[] = [];
  clienselectione: number | null = null;
  dateDebut: string = '';
  dateFin: string = '';
  statutFiltre: string | null = null;

  commandeClientData: any = null;

  // === Statistiques ===
  commandes = 0;
  qtecommandes: number | null = null;
  livraison = 0;
  totalalivre = 0;
  nmbrelivraison = 0;

  // === Graphe ApexCharts ===
  chartOptions: Partial<ChartOptions> | any = null;
userName: string = '';
  router: any;
  constructor(
    private dl: DataLayerService,
    private productService: ProductService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadClient();
    this.getCommandeLength();
    this.getCommande();
    this.getLivraisonToday();

      const userData = localStorage.getItem('user');
   console.log (userData)
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.role ? user.role.toLowerCase() : '';
       if (this.userName !== 'admin') {
     // this.router.navigate(['/bonlivraison']);
    }
    }

  }

  /** ===============================
   *  Chargement des clients
   *  =============================== */
  loadClient() {
    this.dl.getClients().subscribe(res => (this.Clients = res));
  }

  /** ===============================
   *  Statistiques globales
   *  =============================== */
  getCommandeLength() {
    const today = new Date().toISOString().split('T')[0];
    this.dl.getCommandesbyDATE(today).subscribe({
      next: res => (this.commandes = res['length'] || 0),
      error: () => (this.commandes = 0)
    });
  }

  getCommande() {
    const today = new Date().toISOString().split('T')[0];
    this.dl.getCommandesbyDATE(today).subscribe({
      next: res => (this.qtecommandes = res['total_quantite'] || 0),
      error: () => (this.qtecommandes = 0)
    });
  }

  getLivraisonToday() {
    const today = new Date().toISOString().split('T')[0];
    this.dl.getLivraisonPlageDate(today, today).subscribe({
      next: res => {
        this.totalalivre = res['total_charge'] || 0;
        this.nmbrelivraison = res['total_livraisons'] || 0;
      },
      error: () => {
        this.totalalivre = 0;
        this.nmbrelivraison = 0;
      }
    });
  }

  /** ===============================
   *  Gestion des filtres
   *  =============================== */
  aFiltresActifs(): boolean {
    return !!(this.dateDebut || this.dateFin || this.statutFiltre);
  }

  getLibelleStatut(statut: string): string {
    const map: Record<string, string> = {
      en_attente: 'En attente',
      en_cours: 'En cours',
      livree: 'Livrée',
      annulee: 'Annulée'
    };
    return map[statut] || statut;
  }

  /** ===============================
   *  Déclencheur automatique
   *  =============================== */
  onFiltreChange() {
    if (!this.clienselectione) {
      this.chartOptions = null;
      return;
    }
    this.loadCommandeClientData();
  }

  /** ===============================
   *  Récupération des commandes client
   *  =============================== */
  loadCommandeClientData() {
    const filters: any = {};
    if (this.dateDebut) filters.date_debut = this.dateDebut;
    if (this.dateFin) filters.date_fin = this.dateFin;
    if (this.statutFiltre) filters.statut = this.statutFiltre;

    this.dl.getCommandeClient(this.clienselectione, filters).subscribe({
      next: (res: any) => {
        this.commandeClientData = res;
        this.generateChart(res.commandes || []);
      },
      error: err => {
        console.error('Erreur lors du chargement des commandes client :', err);
        this.chartOptions = null;
      }
    });
  }

  /** ===============================
   *  Génération du graphe ApexCharts
   *  =============================== */
  generateChart(commandes: any[]) {
    const labels = commandes.map(c => c.date_commande);
    const quantiteCommandee = commandes.map(c => Number(c.quantite_commandee));
    const quantiteLivree = commandes.map(c => Number(c.quantite_livree));

    this.chartOptions = {
      series: [
        {
          name: 'Quantité commandée (m³)',
          data: quantiteCommandee
        },
        {
          name: 'Quantité livrée (m³)',
          data: quantiteLivree
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: true }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: labels },
      yaxis: { title: { text: 'Quantité (m³)' } },
      fill: { opacity: 1 },
      colors: ['#008FFB', '#00E396'],
      legend: { position: 'bottom' },
      title: {
        text: 'Commandes et livraisons du client',
        align: 'center'
      }
    };
  }

  /** ===============================
   *  Téléchargement du rapport PDF
   *  =============================== */
  telechargerRapport() {
    if (!this.commandeClientData) {
      console.warn('Aucune donnée client disponible.');
      return;
    }
    this.print(this.commandeClientData);
  }

  /** ===============================
   *  Génération du PDF
   *  =============================== */
  print(data: any) {
    if (!data?.client || !data?.commandes) {
      console.error('Données client ou commandes manquantes.');
      return;
    }

    const pdf = new jsPDF();
    const img = new Image();
    img.src = 'assets/images/logobeton.png';

    img.onload = () => {
      const UNIT = 'm³';
      const pageWidth = pdf.internal.pageSize.width;
      const logoWidth = 70;
      const logoHeight = 40;
      const logoX = (pageWidth - logoWidth) / 2;

      pdf.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);
      pdf.setFontSize(16);
      pdf.text('RAPPORT CLIENT - COMMANDES ET LIVRAISONS', pageWidth / 2, 60, { align: 'center' });

      const client = `${data.client.nom} ${data.client.prenom || ''}`.trim();
      pdf.setFontSize(12);
      pdf.text(`Client : ${client}`, 14, 75);

      const now = new Date();
      pdf.text(`Date : ${now.toLocaleDateString('fr-FR')} - ${now.toLocaleTimeString('fr-FR')}`, 14, 82);

      // Tableau principal
      const commandesTable = data.commandes.map((cmd: any) => [
        cmd.reference,
        cmd.formule_beton,
        cmd.quantite_commandee,
        cmd.quantite_livree,
        cmd.quantite_restante,
        `${cmd.pourcentage_livre}%`,
        cmd.statut
      ]);

      autoTable(pdf, {
        head: [['Référence', 'Formule', 'Cmd (m³)', 'Livré (m³)', 'Restant', '% Livré', 'Statut']],
        body: commandesTable,
        startY: 90,
        styles: { fontSize: 9, halign: 'center' },
        headStyles: { fillColor: [52, 152, 219], textColor: 255 }
      });

      pdf.save(`rapport_${client.replace(/\s+/g, '_')}.pdf`);
    };
  }
}
