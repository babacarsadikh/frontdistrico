export interface BonLivraison {
  id: number;                     // Identifiant unique du bon de commande
  adresse_chantier: string;       // Adresse du chantier
  chauffeur_id: string;           // Identifiant du chauffeur
  date_commande: string;          // Date de la commande
  date_production: string;        // Date de production
  formulation: string;            // Formulation du béton
  heure_arrivee: string | null;   // Heure d'arrivée (null si non définie)
  heure_depart: string | null;    // Heure de départ (null si non définie)
  livraison_type: string;         // Type de livraison (ex : Toupie)
  nomclient: string;              // Nom du client
  plaque_camion: string;          // Plaque d'immatriculation du camion ou nom du chauffeur
  quantite_charge: number;        // Quantité déjà chargée (en m³)
  quantite_commande: number;      // Quantité totale commandée (en m³)
  quantite_restante: number;      // Quantité restante à livrer (en m³)
  statut: string;                 // Statut du bon de commande (ex : Produit, En cours)
}
