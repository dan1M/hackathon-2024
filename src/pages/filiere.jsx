import React from 'react';
import '../assets/styles/filieres.css';

const filieres = [
  {
    id: 1,
    title: "UX/UI Design",
    description:
      "Apprenez à concevoir des interfaces utilisateurs intuitives et esthétiques en utilisant des outils comme Figma et Adobe XD. Maîtrisez les bases de l'UX et de l'UI pour offrir des expériences digitales optimales.",
    image: "../assets/images/ux_ui_design.jpg",
  },
  {
    id: 2,
    title: "Marketing Digital",
    description:
      "Maîtrisez les outils du marketing en ligne (SEO, publicités, email marketing) et analysez vos campagnes avec Google Analytics pour optimiser vos performances et atteindre vos objectifs.",
    image: "../assets/images/marketing_digital.jpg",
  },
  {
    id: 3,
    name: "Data Analyse Marketing",
    description:
      "Analysez les données pour optimiser les stratégies marketing. Apprenez à utiliser Excel, Google Analytics et des outils BI pour transformer les données en décisions éclairées.",
    image: "../assets/images/data_analyse_marketing.jpg",
  },
  {
    id: 4,
    name: "Web",
    description:
      "Devenez développeur web en maîtrisant HTML, CSS, JavaScript, et des frameworks comme React. Apprenez aussi les bases du back-end et des bases de données pour créer des sites complets et sécurisés.",
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
