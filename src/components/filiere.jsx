import React, { useEffect, useState } from 'react';
import { FaDesktop, FaCloud, FaMobileAlt, FaDatabase, FaCogs, FaLock, FaRobot, FaNetworkWired, FaChartBar, FaCube, FaGamepad, FaLightbulb, FaCode, FaJava } from 'react-icons/fa';
import '../assets/styles/filieres.css';

const iconMapping = {
  Algorithmics: <FaCogs />,
  "Cloud Computing": <FaCloud />,
  "Mobile Development": <FaMobileAlt />,
  MangoDB: <FaDatabase />,
  VueJS: <FaCode />,
  DevOps: <FaCogs />,
  Databases: <FaDatabase />,
  Cybersecurity: <FaLock />,
  "Artificial Intelligence": <FaRobot />,
  Networking: <FaNetworkWired />,
  "Big Data": <FaChartBar />,
  Blockchain: <FaCube />,
  "Game Development": <FaGamepad />,
  "UX/UI Design": <FaDesktop />,
  IoT: <FaLightbulb />,
  "Software Engineering": <FaCogs />,
  Java: <FaJava />
};

const descriptions = {
  Algorithmics: "Explorez les bases des algorithmes, leur conception et leur optimisation pour résoudre des problèmes complexes efficacement.",
  "Cloud Computing": "Découvrez les concepts du cloud, la virtualisation et les outils comme AWS et Azure pour construire des solutions évolutives.",
  "Mobile Development": "Apprenez à créer des applications mobiles performantes pour iOS et Android en utilisant des frameworks modernes.",
  MangoDB: "Maîtrisez MongoDB, une base de données NoSQL puissante pour gérer des données flexibles et scalables.",
  VueJS: "Développez des applications interactives et réactives avec VueJS, un framework JavaScript populaire et facile à apprendre.",
  DevOps: "Apprenez à automatiser les déploiements, surveiller les performances et travailler en collaboration grâce aux pratiques DevOps.",
  Databases: "Maîtrisez les concepts fondamentaux des bases de données relationnelles et non relationnelles, comme SQL et NoSQL.",
  Cybersecurity: "Protégez les systèmes informatiques en apprenant les bases de la sécurité des réseaux et des applications.",
  "Artificial Intelligence": "Découvrez les bases de l'intelligence artificielle, du machine learning et des algorithmes qui transforment la technologie.",
  Networking: "Comprenez les réseaux informatiques, leur architecture, et leur rôle dans les communications modernes.",
  "Big Data": "Analysez et gérez des ensembles de données massifs grâce à des outils et des techniques avancées.",
  Blockchain: "Plongez dans le fonctionnement des blockchains, leur rôle dans les cryptomonnaies et leurs applications au-delà.",
  "Game Development": "Créez des jeux vidéo immersifs en maîtrisant les moteurs de jeu comme Unity et Unreal Engine.",
  "UX/UI Design": "Apprenez à concevoir des interfaces intuitives et esthétiques qui offrent une expérience utilisateur optimale.",
  IoT: "Explorez l'Internet des Objets et apprenez à connecter des appareils pour créer des systèmes intelligents.",
  "Software Engineering": "Développez des compétences en conception logicielle, tests et gestion de projets logiciels.",
  Java: "Maîtrisez Java, un langage de programmation polyvalent utilisé pour développer des applications de toutes tailles."
};

const FilierePage = () => {
  const filieres = Object.keys(iconMapping).map((key, index) => ({
    id: index + 1,
    title: key,
    description: descriptions[key],
    icon: iconMapping[key]
  }));

  return (
    <div className="filieres-container">
      <h1 className="page-title">Nos Filières</h1>
      <div className="filieres-grid">
        {filieres.map((filiere) => (
          <div className="filiere-card" key={filiere.id}>
            <div className="filiere-icon">{filiere.icon}</div>
            <div className="filiere-content">
              <h2 className="filiere-name">{filiere.title}</h2>
              <p className="filiere-description">{filiere.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilierePage;
