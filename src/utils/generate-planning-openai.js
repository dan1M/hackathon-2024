import OpenAI from "openai";
import { supabase } from "./supabaseClient";

export const fetchDataForPrompt = async () => {
  try {
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*");
    const { data: classes, error: classesError } = await supabase
      .from("class_availabilities")
      .select("*");
    const { data: teachers, error: teachersError } = await supabase
      .from("teacher_availabilities")
      .select("*");
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*");
    const { data: classrooms, error: classroomsError } = await supabase
      .from("classroom")
      .select("*");
    const { data: slots, error: slotsError } = await supabase
      .from("time_slots")
      .select("*");

    if (
      coursesError ||
      classesError ||
      teachersError ||
      classroomsError ||
      slotsError ||
      lessonsError
    ) {
      throw new Error("Erreur lors de la récupération des données depuis Supabase");
    }

    return { courses, classes, teachers, classrooms, slots, lessons };
  } catch (error) {
    console.error("Erreur lors de la récupération des données Supabase :", error);
    throw new Error("Impossible de récupérer les données");
  }
};

// Fonction pour générer le prompt
const generatePrompt = (data) => {
  return `
    Génère un planning optimisé pour des cours dans une université. Voici les données :

    - **Cours** : ${JSON.stringify(data.courses)}
    - **Classes et leurs disponibilités** : ${JSON.stringify(data.classes)}
    - **Professeurs et leurs disponibilités (y compris récurrences)** : ${JSON.stringify(data.teachers)}
    - **Salles de classe** : ${JSON.stringify(data.classrooms)}
    - **Créneaux horaires disponibles (table time_slots)** : ${JSON.stringify(data.slots)}

    **Contraintes :**
    - Les créneaux horaires sont fixes et définis dans la table time_slots.
    - Chaque cours doit être assigné à un professeur disponible.
    - Les professeurs peuvent avoir des absences récurrentes ou des périodes d'indisponibilité.
    - Les salles doivent être disponibles pour chaque créneau.
    - Les cours ne doivent pas se chevaucher pour une même classe ou un même professeur.
    - Les cours annulés peuvent être rattrapés dans le créneau du soir (is_special = true).
    - Respecter la disponibilité des classes par semaine.

    Retourne un tableau JSON où chaque entrée est une leçon avec les champs suivants :
    - \`user_id\` : ID du professeur.
    - \`course_id\` : ID du cours.
    - \`class_id\` : ID de la classe.
    - \`classroom_id\` : ID de la salle.
    - \`date\` : Date du cours.
    - \`heure_debut\` : Heure de début.
    - \`heure_fin\` : Heure de fin.
  `;
};

export const generatePlanningWithAI = async () => {
  try {
    const data = await fetchDataForPrompt();

    // Générer le prompt via la fonction dédiée
    const prompt = generatePrompt(data);

    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a scheduling assistant for a university." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });

    const planningResponse = response.choices[0].message.content.trim();
    console.log("Réponse brute de OpenAI :", planningResponse);

    // Étape 4 : Convertir la réponse en JSON
    let planning;
    try {
      planning = JSON.stringify(planningResponse);
      console.log("Planning JSON interprété :", planning);
    } catch (error) {
      console.error("Erreur lors de la conversion de la réponse en JSON :", error);
      throw new Error(
        "La réponse de OpenAI ne peut pas être interprétée comme JSON."
      );
    }

    return planning; // Retourne le planning interprété
  } catch (error) {
    console.error("Erreur lors de la génération du planning :", error);
    throw new Error("Impossible de générer le planning avec OpenAI");
  }
};
