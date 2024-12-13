import React from 'react';
import '../assets/styles/filieres.css';

const filieres = [
  {
    id: 1,
    title: "UX/UI Design",
    description:
      "Le design UX/UI est l'une des disciplines les plus cruciales dans le domaine numérique, où la conception d'interfaces utilisateur est essentielle pour offrir des expériences utilisateur exceptionnelles. Dans ce programme, vous apprendrez à concevoir des interfaces qui sont non seulement visuellement attractives, mais aussi intuitives et faciles à utiliser. Vous explorerez les principes fondamentaux de l'expérience utilisateur (UX), y compris la recherche utilisateur, la création de personas, la définition des parcours utilisateurs, et la réalisation de tests utilisateurs. Vous découvrirez aussi l'interface utilisateur (UI), en apprenant à travailler avec des outils de conception comme Figma, Sketch et Adobe XD, à concevoir des maquettes interactives, et à optimiser les interfaces pour différents appareils et tailles d'écran. Ce programme vous donnera les compétences nécessaires pour concevoir des expériences digitales qui répondent aux besoins des utilisateurs tout en respectant les contraintes techniques et esthétiques.",
      image: "../assets/images/ux_ui_design.jpg",
  },
  {
    id: 2,
    title: "Marketing Digital",
    description:
      "Le marketing digital est devenu un pilier fondamental du développement des entreprises à l'ère du numérique. Ce programme vous permettra de maîtriser les techniques les plus avancées pour concevoir et gérer des stratégies de marketing en ligne efficaces. Vous apprendrez à utiliser des outils et des méthodes comme le SEO (Search Engine Optimization), le marketing par email, la publicité payante (Google Ads, Facebook Ads), et l'optimisation des conversions. Vous comprendrez comment segmenter votre audience, analyser les comportements des utilisateurs et utiliser ces informations pour créer des campagnes publicitaires pertinentes et personnalisées. Vous apprendrez également à analyser les données à travers des outils comme Google Analytics pour ajuster et optimiser les performances de vos campagnes. Ce programme est conçu pour vous préparer à gérer les challenges du marketing digital moderne, vous offrant une compréhension complète des tendances, des outils et des techniques qui façonneront l'avenir du secteur.",
    image: "../assets/images/marketing_digital.jpg",
  },
  {
    id: 3,
    name: "Data Analyse Marketing",
    description:
      "L'analyse des données est devenue un atout indispensable pour prendre des décisions stratégiques et éclairées dans le domaine du marketing. Ce programme vous fournira les compétences nécessaires pour collecter, analyser et interpréter les données de manière à optimiser les actions marketing et commerciales. Vous apprendrez à travailler avec des ensembles de données volumineux et complexes, en utilisant des outils d'analyse comme Excel, Google Analytics, et des logiciels spécialisés en Business Intelligence (BI). Vous serez formé à l'utilisation de modèles statistiques, à l'analyse prédictive, et à la segmentation des consommateurs afin de mieux comprendre leurs comportements et attentes. Ce programme vous aidera à développer une expertise dans l'interprétation des données pour proposer des recommandations qui augmenteront l'efficacité des campagnes marketing et contribueront à la maximisation des performances commerciales. Vous apprendrez à transformer les données brutes en informations stratégiques et actionnables, qui permettront aux entreprises de prendre des décisions basées sur des faits plutôt que sur des intuitions.",
    image: "../assets/images/data_analyse_marketing.jpg",
  },
  {
    id: 4,
    name: "Web",
    description:
      "Dans un monde de plus en plus digital, être capable de développer des sites web modernes, performants et fonctionnels est une compétence recherchée et précieuse. Ce programme vous permettra de maîtriser les différentes facettes du développement web, du front-end au back-end. Vous commencerez par apprendre les bases du HTML, CSS et JavaScript, qui sont essentiels pour créer des interfaces utilisateurs attrayantes et interactives. Vous découvrirez ensuite des frameworks populaires comme React, Angular et Vue.js, qui facilitent la création d'interfaces dynamiques. Côté back-end, vous serez initié aux langages de programmation comme Node.js et Python, et vous apprendrez à travailler avec des bases de données telles que MySQL et MongoDB. Vous comprendrez également les concepts de sécurité web, de performance et d'accessibilité, afin de créer des sites non seulement fonctionnels, mais aussi sécurisés et accessibles à tous les utilisateurs. Ce programme vous permettra de devenir un développeur web complet, capable de concevoir des sites web performants, sécurisés et adaptés à tous les types d'appareils, des ordinateurs de bureau aux smartphones.",
    image: "../assets/web_development.jpg",
  },
];

const FilierePage = () => {
  return (
    <div className="filieres-container">
      <h1 className="page-title">Nos Filières</h1>
      <div className="filieres-grid">
        {filieres.map((filiere) => (
          <div className="filiere-card" key={filiere.id}>
            <img
              src={filiere.image}
              alt={filiere.name}
              className="filiere-image"
            />
            <div className="filiere-content">
              <h2 className="filiere-name">{filiere.name}</h2>
              <p className="filiere-description">{filiere.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilierePage;
