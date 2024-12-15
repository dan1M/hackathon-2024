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
      slotsError
    ) {
      throw new Error("Erreur lors de la récupération des données depuis Supabase");
    }

    return { courses, classes, teachers, classrooms, slots };
  } catch (error) {
    console.error("Erreur lors de la récupération des données Supabase :", error);
    throw new Error("Impossible de récupérer les données");
  }
};

const generatePrompt = (data, dates, existingLessons) => {
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
    - **Leçons existantes** : ${JSON.stringify(existingLessons)}

    **Contraintes :**
    - Les créneaux horaires sont définis dans le tableau des dates et créneaux horaires.
    - Chaque date peut comporter plusieurs cours dans différents créneaux horaires.
    - Les créneaux horaires disponibles en priorité sont : 09:00 à 12:30, 13:30 à 17:00, et en cas d'annulation de cours de 17:15 à 19:00.
    - Chaque cours doit être assigné à un professeur disponible et à une salle disponible.
    - Les cours ne doivent pas se chevaucher pour une même classe, un même professeur ou une même salle.
    - Respecter les disponibilités des classes, des professeurs, et des salles par semaine et par mois.
    - Prenez en compte les leçons existantes générées par OpenAI pour ne pas les dupliquer.

    Retournez un tableau JSON où chaque entrée est une leçon avec les champs suivants :
    - \`teacher_id\` : ID du professeur.
    - \`course_id\` : ID du cours.
    - \`class_id\` : ID de la classe.
    - \`classroom_id\` : ID de la salle.
    - \`date\` : Date du cours.
    - \`start_time\` : Heure de début.
    - \`end_time\` : Heure de fin.
    - \`generate_by\` : \`true\`.

    Assurez-vous de générer plusieurs cours pour chaque date en fonction des créneaux horaires disponibles pour le mois.
  `;
};

export const generateAndSavePlanningWithAI = async (startDate, acceptSave = false) => {
  try {
    const data = await fetchDataForPrompt();

    const dates = getWorkingDaysForMonth(startDate);
    const { data: existingLessons, error: existingLessonsError } = await supabase
      .from("lessons")
      .select("*")
      .in("date", dates)
      .eq("generate_by", true);

    if (existingLessonsError) {
      console.error("Erreur lors de la récupération des leçons existantes :", existingLessonsError);
      throw new Error("Impossible de vérifier les leçons existantes.");
    }

    const prompt = generatePrompt(data, dates, existingLessons);

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
      // Supprimer les backticks potentiels et parser la réponse
      const cleanedResponse = planningResponse.replace(/```json|```/g, "").trim();
      planning = JSON.parse(cleanedResponse); // Convertit en objet JSON
    } catch (error) {
      console.error("Erreur lors de la conversion de la réponse en JSON :", error);
      throw new Error("La réponse de OpenAI ne peut pas être interprétée comme JSON.");
    }

    const lessonsToSave = planning.map((lesson) => ({
      ...lesson,
      generate_by: true,
    }));

    if (acceptSave) {
      const { error: insertError } = await supabase.from("lessons").upsert(lessonsToSave);

      if (insertError) {
        console.error("Erreur lors de l'insertion des leçons :", insertError);
        throw new Error("Impossible de sauvegarder les leçons générées.");
      }

      console.log("Les leçons générées ont été sauvegardées avec succès.");
      return lessonsToSave;
    } else {
      console.log("Suggestions générées mais non sauvegardées :", lessonsToSave);
      return lessonsToSave;
    }
  } catch (error) {
    console.error("Erreur lors de la génération ou de la sauvegarde des leçons :", error);
    throw new Error("Impossible de générer ou sauvegarder les leçons.");
  }
};

const getWorkingDaysForMonth = (startDate) => {
  const dates = [];
  let currentDate = dayjs(startDate).startOf("month");
  const endOfMonth = dayjs(startDate).endOf("month");

  while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth)) {
    const day = currentDate.day();
    if (day >= 1 && day <= 5) {
      dates.push(currentDate.format("YYYY-MM-DD"));
    }
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};
