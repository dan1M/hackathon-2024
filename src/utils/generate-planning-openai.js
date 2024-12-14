import OpenAI from "openai";
import { supabase } from "./supabaseClient";
import dayjs from "dayjs";

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

// Fonction pour générer les 5 jours ouvrés d'une semaine donnée
const getWorkingDaysForWeek = (startDate) => {
  const dates = [];
  let currentDate = dayjs(startDate);

  // Générer 5 jours ouvrés (lundi à vendredi)
  while (dates.length < 5) {
    const day = currentDate.day(); // 1 = Lundi, ..., 5 = Vendredi
    if (day >= 1 && day <= 5) {
      dates.push(currentDate.format("YYYY-MM-DD"));
    }
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

// Fonction pour générer le prompt
const generatePrompt = (data, dates) => {
  // Création des dates avec les slots horaires
  const datesWithSlots = dates.map((date) => ({
    date,
    slots: data.slots.map((slot) => ({
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_special: slot.is_special,
    })),
  }));

  return `
  Sur la base des données d'entrée, générez un objet JSON strictement dans le format suivant. N'incluez aucun texte avant ou après l'objet JSON.

    - **Cours** : ${JSON.stringify(data.courses)}
    - **Classes et leurs disponibilités** : ${JSON.stringify(data.classes)}
    - **Professeurs et leurs disponibilités (y compris contraintes récurrentes)** : ${JSON.stringify(data.teachers)}
    - **Salles de classe** : ${JSON.stringify(data.classrooms)}
    - **Dates et créneaux horaires** : ${JSON.stringify(datesWithSlots)}

    **Contraintes :**
    - Les créneaux horaires sont fixes et définis dans le tableau des dates avec les créneaux horaires.
    - Très IMPORTANT, chaque cours doit être assigné à un professeur disponible à vérifier dans les données.
    - Les professeurs peuvent avoir des absences récurrentes ou des périodes d'indisponibilité.
    - Les salles doivent être disponibles pour chaque créneau.
    - Les cours ne doivent pas se chevaucher pour une même classe ou un même professeur.
    - Les cours annulés peuvent être rattrapés dans le créneau du soir (is_special = true).
    - Respecter la disponibilité des classes par semaine. Et générer le semestre.

    Retourne un tableau JSON où chaque entrée est une leçon avec les champs suivants et il me faut au moins 10 leçons:
    - \`user_id\` : ID du professeur.
    - \`course_id\` : ID du cours.
    - \`class_id\` : ID de la classe.
    - \`classroom_id\` : ID de la salle.
    - \`date\` : Date du cours.
    - \`heure_debut\` : Heure de début.
    - \`heure_fin\` : Heure de fin.

    ### Exemple de sortie attendue :
    [
      {
        "user_id": 4,
        "course_id": 1,
        "class_id": 2,
        "classroom_id": 1,
        "date": "2024-09-23",
        "heure_debut": "09:00:00",
        "heure_fin": "12:30:00"
      }
    ]
  `;
};

export const generatePlanningWithAI = async (startDate) => {
  try {
    const data = await fetchDataForPrompt();

    // Obtenir les 5 jours ouvrés à partir de la date de début
    const dates = getWorkingDaysForWeek(startDate);

    // Générer le prompt via la fonction dédiée
    const prompt = generatePrompt(data, dates);

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

    let planning;
    try {
      planning = JSON.parse(planningResponse);
      console.log("Planning JSON interprété :", planning);
    } catch (error) {
      console.error("Erreur lors de la conversion de la réponse en JSON :", error);
      throw new Error("La réponse de OpenAI ne peut pas être interprétée comme JSON.");
    }

    return planning;
  } catch (error) {
    console.error("Erreur lors de la génération du planning :", error);
    throw new Error("Impossible de générer le planning avec OpenAI");
  }
};
