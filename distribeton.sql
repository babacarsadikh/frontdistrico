-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : jeu. 16 jan. 2025 à 14:50
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `distribeton`
--

-- --------------------------------------------------------

--
-- Structure de la table `bonCommande`
--

CREATE TABLE `bonCommande` (
  `id` int(11) NOT NULL,
  `nomclient` varchar(255) NOT NULL,
  `adresse_chantier` varchar(255) NOT NULL,
  `quantite_commande` decimal(10,0) NOT NULL,
  `quantite_charge` decimal(10,0) NOT NULL,
  `quantite_restante` decimal(10,0) NOT NULL,
  `formulation` varchar(100) NOT NULL,
  `plaque_camion` varchar(100) NOT NULL,
  `chauffeur` varchar(255) NOT NULL,
  `livraison_type` varchar(255) NOT NULL,
  `statut` varchar(255) NOT NULL,
  `date_commande` date NOT NULL,
  `date_production` date NOT NULL,
  `heure_depart` time NOT NULL,
  `heure_darrive` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `bonCommande`
--

INSERT INTO `bonCommande` (`id`, `nomclient`, `adresse_chantier`, `quantite_commande`, `quantite_charge`, `quantite_restante`, `formulation`, `plaque_camion`, `chauffeur`, `livraison_type`, `statut`, `date_commande`, `date_production`, `heure_depart`, `heure_darrive`) VALUES
(39, 'ETC ENTREPRISE', 'DIAMNIADIO', 44, 37, 7, 'C25', 'AA-BGDT3-DK', 'BABA NDIAYE', 'Pompe à béton', 'Produit', '2025-01-13', '2025-01-16', '10:20:00', NULL),
(40, 'ABDOULAHI BTP', 'DIAMAGUENE', 50, 34, 16, 'C30', 'AA-3844-DK', 'MODOU DIAGNE', 'Pompe à béton', 'Produit', '2025-01-13', '2025-01-15', '10:20:00', NULL),
(41, 'serigne babacar diop', 'DIAMAGUENE', 60, 45, 15, 'c30', 'DK-ABC1234', 'THIERNO NDIAYE', 'Pompe à béton', 'Produit', '2025-01-13', '2025-01-15', '10:20:00', NULL),
(42, 'sadikh diop fall', 'DIAMAGUENE', 45, 0, 0, 'C30', 'ABC1234', 'tapha ndiaye Doe', 'toupie', 'En attente', '2025-01-13', '2025-01-13', '10:20:00', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `chauffeurs`
--

CREATE TABLE `chauffeurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `plaque_camion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `chauffeurs`
--

INSERT INTO `chauffeurs` (`id`, `nom`, `telephone`, `plaque_camion`) VALUES
(1, 'MODOU DIAGNE', '772981278', 'AA-3844-DK'),
(2, 'Alioune Ndiaye', '777501497', 'AAA-1236-Dk'),
(3, 'tapha ndiaye Doe', '123456789', 'ABC1234'),
(4, 'THIERNO NDIAYE', '77382793', 'DK-ABC1234'),
(6, 'BABA NDIAYE', '+221772981201', 'AA-BGDT3-DK'),
(7, 'tapha sarr', '772293992', 'AA-BGDT3-DK');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `client_nom` varchar(100) NOT NULL,
  `chantier_adresse` varchar(255) NOT NULL,
  `quantite_commande` decimal(10,2) NOT NULL,
  `quantite_charge` decimal(10,2) DEFAULT 0.00,
  `quantite_restante` decimal(10,2) DEFAULT 0.00,
  `formulation` varchar(100) NOT NULL,
  `chauffeur_id` int(11) DEFAULT NULL,
  `plaque_camion` varchar(20) NOT NULL,
  `livraison_type` enum('pompe à béton','toupie','autre') NOT NULL,
  `statut` enum('en attente','en production','en livraison','livrée') DEFAULT 'en attente',
  `date_commande` datetime NOT NULL DEFAULT current_timestamp(),
  `date_production` datetime DEFAULT NULL,
  `heure_depart` time DEFAULT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `observation_client` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `client_nom`, `chantier_adresse`, `quantite_commande`, `quantite_charge`, `quantite_restante`, `formulation`, `chauffeur_id`, `plaque_camion`, `livraison_type`, `statut`, `date_commande`, `date_production`, `heure_depart`, `heure_arrivee`, `observation_client`) VALUES
(2, 'THIERNO SEYDOU NOUROU', 'OUAKAM', 40.00, 8.00, 32.00, 'C30', 1, 'AA-866GG', 'pompe à béton', 'livrée', '2025-01-08 15:34:33', '2025-01-08 15:34:33', '15:34:00', '17:34:33', 'TEST'),
(3, 'ALIOUNE BADARA DIAGNE', 'LIBERTE 1', 27.00, 27.00, 0.00, 'C25', 1, 'AA-866GG', 'pompe à béton', 'livrée', '2025-01-08 10:30:33', '2025-01-08 15:30:33', '15:34:00', '17:34:33', 'TEST');

-- --------------------------------------------------------

--
-- Structure de la table `livraisons`
--

CREATE TABLE `livraisons` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) DEFAULT NULL,
  `date_livraison` timestamp NOT NULL DEFAULT current_timestamp(),
  `statut` enum('préparée','en route','livrée') DEFAULT 'préparée'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rapport`
--

CREATE TABLE `rapport` (
  `id` int(11) NOT NULL,
  `date_rapport` date NOT NULL,
  `nomclient` varchar(255) NOT NULL,
  `adresse_chantier` varchar(255) NOT NULL,
  `formulation` varchar(255) NOT NULL,
  `quantite_charge` decimal(10,0) NOT NULL,
  `chauffeur` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','opérateur') NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `bonCommande`
--
ALTER TABLE `bonCommande`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telephone` (`telephone`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chauffeur_id` (`chauffeur_id`);

--
-- Index pour la table `livraisons`
--
ALTER TABLE `livraisons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`);

--
-- Index pour la table `rapport`
--
ALTER TABLE `rapport`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `bonCommande`
--
ALTER TABLE `bonCommande`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT pour la table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `livraisons`
--
ALTER TABLE `livraisons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rapport`
--
ALTER TABLE `rapport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_ibfk_1` FOREIGN KEY (`chauffeur_id`) REFERENCES `chauffeurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `livraisons`
--
ALTER TABLE `livraisons`
  ADD CONSTRAINT `livraisons_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
