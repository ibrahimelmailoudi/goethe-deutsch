import { useState, useEffect, useRef, useCallback } from "react";

const SECRET_CODE = "GOETHE2024";    // normaler User – Sperren aktiv
const ADMIN_CODE  = "ADMIN9999";     // Admin / Lehrer – alles offen
const STORE_KEY = "goethe_v4";

// ── MUSIC CONFIG ─────────────────────────────────────────────────
// We use Web Audio API to generate ambient tones (no external URLs needed)
// Users can choose: Musik (lofi ambient) or Quran (peaceful tone)
const MUSIC_OPTS = [
  { key:"none",  label:"Kein Ton",   icon:"🔇", desc:"Stille" },
  { key:"music", label:"Musik",      icon:"🎵", desc:"Ruhige Lernmusik" },
  { key:"quran", label:"Quran",      icon:"🕌", desc:"Ruhige Quran-Rezitation" },
];

// ── CELEBRATION PARTICLES ─────────────────────────────────────────
const CONFETTI_COLORS = ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#ef4444","#fbbf24"];

const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
const save = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {} };

// ── ICONS ─────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0 };
  const p = {
    lock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    book: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    video: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    exam: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    sun: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    play: <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    trophy: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 9a6 6 0 0 0 12 0"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/><path d="M18 2h2a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5"/><path d="M6 2H4a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5"/></svg>,
    refresh: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    structure: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    pencil: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeoff: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    home: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    zap: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    flame: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
    skull: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.956-2.4l-1.7-7.3a6 6 0 0 0-11.512 0l-1.7 7.3A2 2 0 0 0 5 20Z"/></svg>,
  };
  return p[name] || null;
};

// ── THEME ──────────────────────────────────────────────────────
const T = {
  light: { bg:"#f0f4f8", card:"#fff", border:"#e2e8f0", text:"#1a202c", sub:"#64748b", muted:"#94a3b8", input:"#f8fafc", inputB:"#cbd5e1", nav:"#fff", shadow:"0 2px 12px rgba(0,0,0,0.08)", code:"#f1f5f9" },
  dark:  { bg:"#0f172a", card:"#1e293b", border:"#334155", text:"#f1f5f9", sub:"#94a3b8", muted:"#64748b", input:"#0f172a", inputB:"#475569", nav:"#1e293b", shadow:"0 2px 12px rgba(0,0,0,0.4)", code:"#0f172a" },
};

const LC = { A1:"#10b981", A2:"#3b82f6", B1:"#f59e0b", B2:"#8b5cf6", C1:"#ef4444" };
const LD = { A1:"Anfänger", A2:"Grundkenntnisse", B1:"Mittelstufe", B2:"Obere Mittelstufe", C1:"Fortgeschritten" };
const LEVELS = ["A1","A2","B1","B2","C1"];

// ── CHANNELS & VIDEOS ────────────────────────────────────────
const CHANNELS = [
  {
    name: "DW Deutsch lernen",
    level: "A1–C1",
    desc: "Offizieller Kanal der Deutschen Welle. Komplette Kurse A1→B1 mit 'Nicos Weg'. Kostenlos & professionell.",
    url: "https://www.youtube.com/channel/UCxUWIEL-USsiPak0Qy6_vVg",
    search: "Nicos Weg A1 Deutsch DW",
    color: "#2563eb",
    icon: "🎓",
    subs: "1,5 Mio.",
  },
  {
    name: "Learn German with Anja",
    level: "A1–B1",
    desc: "Energetisch und lustig. Grammatik klar erklärt. Ideal für Anfänger und untere Mittelstufe.",
    url: "https://www.youtube.com/channel/UCIk7bQfxolH9PJ_6AGp5VgQ",
    search: "Learn German with Anja A1 Grammatik",
    color: "#dc2626",
    icon: "⭐",
    subs: "1,03 Mio.",
  },
  {
    name: "Easy German",
    level: "A2–C1",
    desc: "Straßeninterviews mit echten Deutschen. Englische + deutsche Untertitel. Authentisches Alltagsdeutsch.",
    url: "https://www.youtube.com/channel/UCbxb2fqe9oNgglAoYqsYOtQ",
    search: "Easy German Straßeninterviews",
    color: "#16a34a",
    icon: "🎤",
    subs: "2,28 Mio.",
  },
  {
    name: "lingoni GERMAN",
    level: "A1–B2",
    desc: "Strukturierte Kurse von A1 bis B2. 1.400+ Videos. Klare Grammatikerklärungen mit Beispielen.",
    url: "https://www.youtube.com/channel/UCHLlkqclLZEkWNFCCCfwBEg",
    search: "lingoni GERMAN A1 Kurs",
    color: "#7c3aed",
    icon: "📚",
    subs: "853K",
  },
  {
    name: "Deutsch mit Marija",
    level: "B1–C2",
    desc: "Für Fortgeschrittene. Aussprache, C1-Prüfungsvorbereitung, flüssiges Deutsch sprechen.",
    url: "https://www.youtube.com/channel/UCSpH-oMEIenBxLRBs8EeM9Q",
    search: "Deutsch mit Marija B2 C1 Prüfung",
    color: "#d97706",
    icon: "🏆",
    subs: "352K",
  },
  {
    name: "Deutsch für Euch (Katja)",
    level: "A1–B2",
    desc: "Warm und strukturiert. Tiefe Grammatikerklärungen auf Englisch. Gut für Selbstlerner.",
    url: "https://www.youtube.com/channel/UCmQc3SeJGFR0jJMlXKuOqvQ",
    search: "Deutsch für Euch Katja Grammatik",
    color: "#db2777",
    icon: "👩‍🏫",
    subs: "700K",
  },
];

const VIDS = {
  A1: { channels: [0,1,3], searches: ["Nicos Weg A1 Deutsch lernen","Learn German Anja Artikel A1","lingoni German A1 Kurs"] },
  A2: { channels: [0,2,3], searches: ["Nicos Weg A2 Deutsch lernen","Easy German Super Easy A2","lingoni German A2 Kurs"] },
  B1: { channels: [0,1,2], searches: ["DW Deutsch B1 Grammatik","Learn German Anja B1","Easy German B1 Gespräche"] },
  B2: { channels: [3,4,2], searches: ["lingoni German B2 Kurs","Deutsch mit Marija B2","Easy German B2 Diskussion"] },
  C1: { channels: [4,2,5], searches: ["Deutsch mit Marija C1 Prüfung","Easy German C1","Deutsch für Euch C1 Grammatik"] },
};

// ── PRÜFUNGSTHEMEN (alle echten Goethe-Themen) ───────────────
const PRUEFUNGSTHEMEN = {
  A1:{
    startTipp:"💡 Beginne mit LESEN – du hast Zeit und kannst dir die Aufgaben gut durchlesen. Dann SCHREIBEN (Formular zuerst, dann Mitteilung). HÖREN kommt danach (Texte 2x). SPRECHEN: Übe deinen Vorstellungstext auswendig!",
    grammatik:["Artikel: der/die/das/ein/eine","Personalpronomen: ich/du/er/sie...", "Konjugation: sein, haben, kommen, heißen","Verneinung: nicht / kein / keine","W-Fragen: Wie? Wo? Woher? Was? Wann?","Zahlen 1–100, Uhrzeit, Datum","Nominativ & Akkusativ (mask.: den/einen)","Präpositionen: aus, in, bei, mit, nach","Possessivartikel: mein/meine, dein/deine","Pluralformen der Nomen"],
    sprechen:[
      {t:"Sich vorstellen",b:"Name, Herkunft, Wohnort, Beruf, Sprachen, Hobbys, Familie"},
      {t:"Einkaufen",b:"Wo kaufen Sie ein? Was brauchen Sie? Wie viel kostet es?"},
      {t:"Wochenende",b:"Was machen Sie am Wochenende? Aktivitäten, Sport, Familie"},
      {t:"Familie",b:"Haben Sie Geschwister? Eltern? Kinder? Wie heißen sie?"},
      {t:"Essen und Trinken",b:"Was essen/trinken Sie gern? Lieblingsgericht? Frühstück?"},
      {t:"Wohnen",b:"Wo wohnen Sie? Wie viele Zimmer? Haus oder Wohnung?"},
      {t:"Arbeit / Schule",b:"Was sind Sie von Beruf? Wo arbeiten Sie? Studieren Sie?"},
      {t:"Freizeit & Hobbys",b:"Sport, Musik, Lesen, Reisen – was machen Sie gern?"},
      {t:"Uhrzeit & Datum",b:"Um wie viel Uhr...? Wann haben Sie Geburtstag?"},
      {t:"Bitten formulieren",b:"Können Sie mir helfen? Darf ich...? Ich möchte gern..."},
    ],
    schreiben:[
      {t:"Formular ausfüllen",b:"Anmeldeformular: Vorname, Nachname, Adresse, PLZ, Ort, Telefon, E-Mail, Geburtsdatum, Nationalität"},
      {t:"Einladung zur Geburtstagsparty",b:"Sie möchten Ihren Geburtstag feiern und Ihre Freundin Anna einladen. (ca. 30 Wörter)"},
      {t:"Anfrage an Touristeninformation",b:"Sie möchten Dresden besuchen: Wann? Wie lange? Was interessiert Sie? (ca. 30 Wörter)"},
      {t:"Kurze Entschuldigung",b:"Sie können nicht kommen. Entschuldigen Sie sich und erklären Sie kurz warum."},
      {t:"Urlaubsgrüße / Postkarte",b:"Sie sind im Urlaub. Schreiben Sie eine Postkarte: Wo sind Sie? Wie ist es?"},
    ],
    lesen:[
      {t:"Kurze Briefe & E-Mails (Teil 1)",b:"Zwei Texte lesen: Brief oder E-Mail. 5 Aufgaben: Richtig oder Falsch? z.B. 'Ralf hatte am letzten Wochenende Geburtstag.' – Richtig oder Falsch?"},
      {t:"Schilder & Aushänge (Teil 2)",b:"Kurze Texte: Verbotsschilder, Öffnungszeiten, Hinweisschilder. 5 Aufgaben: Richtig oder Falsch? z.B. 'Rauchen verboten.' / 'Post: Samstag geschlossen.'"},
      {t:"Anzeigen & Informationen (Teil 3)",b:"6 Personen suchen etwas (Wohnung, Arzt, Kurs...). Welche Anzeige passt? z.B. 'Sie studieren in Frankfurt und suchen eine Wohnung.'"},
    ],
  },
  A2:{
    startTipp:"💡 Beginne mit LESEN – du kennst die Themen und kannst gezielt suchen. Dann SCHREIBEN. Beim HÖREN: Lies zuerst alle Fragen! SPRECHEN: Bereite deinen Tagesablauf und Familie gut vor.",
    grammatik:["Akkusativ & Dativ (alle Artikel)","Trennbare Verben: aufmachen, anrufen, aufstehen","Wechselpräpositionen: an/auf/in + Dat./Akk.","Konjunktionen: weil, dass, wenn, als, ob","Perfekt: haben/sein + Partizip II","Komparativ & Superlativ: größer, am größten","Adjektivdeklination nach best./unbest. Artikel","Modalverben: müssen, können, dürfen, wollen","Präteritum der Modalverben","Reflexive Verben: sich freuen, sich waschen"],
    sprechen:[
      {t:"Sich vorstellen (ausführlicher)",b:"Beruf, Familie, Ausbildung, Wohnort, Pläne, Sprachen"},
      {t:"Urlaub planen",b:"Wohin reisen? Was unternehmen? Wetter, Transport, Unterkunft"},
      {t:"Einkaufen: Online oder im Geschäft?",b:"Was kaufen Sie wo? Vor- und Nachteile. Supermarkt vs. Internet"},
      {t:"Tagesablauf beschreiben",b:"Wann stehen Sie auf? Was machen Sie morgens/abends?"},
      {t:"Freizeit & Sport",b:"Welchen Sport treiben Sie? Fitness, Fußball, Schwimmen... Wie oft?"},
      {t:"Wohnen: Stadt oder Land?",b:"Wo wohnen Sie? Was gefällt Ihnen? Vorteile, Nachteile"},
      {t:"Gesundheit & Arztbesuch",b:"Wie fühlen Sie sich? Was tun Sie für Ihre Gesundheit?"},
      {t:"Familie und Freunde",b:"Wie sieht Ihre Familie aus? Was machen Sie mit Freunden?"},
      {t:"Arbeit und Beruf",b:"Was sind Sie von Beruf? Wie ist Ihre Arbeit?"},
      {t:"Gemeinsam etwas planen",b:"z.B. Wochenendausflug planen: Wohin? Wann? Was mitnehmen?"},
    ],
    schreiben:[
      {t:"E-Mail: Entschuldigung bei Kursleiterin",b:"Kursleiterin Frau Müller hat Sie eingeladen, aber Sie können nicht kommen. Entschuldigen Sie sich und erklären Sie warum. (~40 Wörter)"},
      {t:"E-Mail: Freund besuchen",b:"Sie sind umgezogen. Laden Sie Ihren Freund ein. Beschreiben Sie: Wann? Wie kommt er zu Ihnen?"},
      {t:"Kursanmeldung / Formular",b:"Melden Sie sich für einen Kurs an: Name, Adresse, Kursname, Wunschtermin, Fragen"},
      {t:"Einladung zur Party",b:"Sie feiern Ihren Geburtstag. Schreiben Sie eine Einladung: Datum, Zeit, Ort, Was mitbringen?"},
      {t:"Beschwerde an Vermieter",b:"In Ihrer Wohnung ist etwas kaputt (Heizung, Fenster...). Schreiben Sie dem Vermieter."},
    ],
    lesen:[
      {t:"Zeitungstext / Bericht (Teil 1)",b:"Kurzer Artikel über Alltag: z.B. Umzug, neue Wohnung, Arbeit. 5 Aufgaben (a/b/c). z.B. 'Marta hat beim Umzug...' – a) Probleme b) Hilfe c) keine Freunde"},
      {t:"E-Mail lesen (Teil 2)",b:"Eine E-Mail von einer Freundin/einem Freund. 5 Aufgaben (a/b/c). z.B. Gülcan wohnt in einer neuen Stadt. Was stimmt?"},
      {t:"Anzeigen zuordnen (Teil 3)",b:"6 Personen suchen etwas (Gitarrenlehrer, Restaurant, Arzt...). Welche Anzeige (a–f) passt? z.B. Julia sucht einen Gitarrenlehrer für ihren Sohn."},
      {t:"Lückentext (Teil 4)",b:"Text mit Lücken: Wählen Sie das passende Wort (a/b/c). Grammatik & Wortschatz: Präpositionen, Konnektoren, Artikel"},
    ],
  },
  B1:{
    startTipp:"💡 Beim LESEN: Beginne mit Teil 2 (Anzeigen zuordnen) – das geht schnell! Dann Teil 1 und 3. Beim SCHREIBEN: Plane 5 Min. Struktur, dann schreibe. ACHTUNG beim HÖREN: Teile 3 & 4 werden NUR EINMAL gespielt! SPRECHEN: Lerne die 5-Folien-Struktur auswendig.",
    grammatik:["Perfekt & Präteritum (alle Verben)","Plusquamperfekt: hatte gemacht / war gegangen","Konjunktionen: obwohl, damit, nachdem, bevor, während","um...zu / damit – Zweck ausdrücken","Passiv Präsens & Präteritum","Adjektivdeklination (alle 3 Tabellen)","Relativsätze Nominativ & Akkusativ","Konjunktiv II: würde, hätte, wäre (Grundlagen)","Modalverben Präteritum: musste, konnte, durfte","Indirekte Rede: Er sagt, dass..."],
    sprechen:[
      {t:"Hotel Mama",b:"Bis wann sollen Kinder bei Eltern wohnen? Erfahrungen aus Heimatland, Vor- & Nachteile"},
      {t:"Leben auf dem Land oder in der Stadt",b:"Was ist besser? Vergleich mit Heimatland. Eigene Meinung mit Beispielen"},
      {t:"Ausbildung oder Studium?",b:"Was ist wichtiger? Duales System in Deutschland. Situation im Heimatland"},
      {t:"Internet & soziale Netzwerke",b:"Wie viel Internet ist gesund? Facebook, Instagram – Sucht, Vorteile, Nachteile"},
      {t:"Bio-Essen & Ernährung",b:"Vegetarisch, vegan oder mit Fleisch? Ist Bio wichtig? Fastfood"},
      {t:"Auswanderung / Auslandsaufenthalt",b:"Ja oder nein? Chancen und Risiken. Erfahrungen, Heimatland"},
      {t:"Computer & Tablets im Unterricht",b:"Sollen Schüler Tablets im Unterricht nutzen? Für & wider"},
      {t:"Haustiere – sinnvoll oder nicht?",b:"Sollte man Haustiere halten? Welche? Verantwortung, Kosten, Liebe"},
      {t:"Freiwillige soziale Arbeit",b:"Soll man freiwillig arbeiten? Wo? Warum? Erfahrungen"},
      {t:"Kinder und Handys",b:"Ab welchem Alter? Vor- & Nachteile. Regeln für Kinder"},
      {t:"Sport und Gesundheit",b:"Wie viel Sport ist gesund? Extremsport? Fitness oder Teamsport?"},
      {t:"Kleine Kinder in die Krippe?",b:"Sollen Kinder unter 3 Jahren in die Krippe? Für Familien & Kinder"},
      {t:"Gebrauchte Kleidung / Second Hand",b:"Kleidung kaufen oder tauschen? Nachhaltigkeit. Trend oder Notwendigkeit?"},
      {t:"Gemeinsam Krankenbesuch planen",b:"Kursteilnehmer liegt im Krankenhaus: Wann besuchen? Was schenken? Wer hilft nach Entlassung?"},
      {t:"Geburtstagsfeier planen",b:"Wo feiern? Wer kommt? Was essen? Gemeinsam entscheiden"},
    ],
    schreiben:[
      {t:"Forumsbeitrag: Persönliche Kontakte und Internet",b:"Stimmen Sie zu: 'Freundschaften im Internet sind genauso echt wie echte Freundschaften'? (~80 Wörter)"},
      {t:"E-Mail: Entschuldigung bei Kursleiterin",b:"Frau Müller hat Sie eingeladen, aber Sie können nicht kommen. Entschuldigen Sie sich höflich, nennen Sie Grund, machen Sie neuen Termin vor. (~40 Wörter)"},
      {t:"Forumsbeitrag: Kinder und Krippe",b:"Sollen kleine Kinder in die Krippe? Meinung äußern mit Begründung (~80 Wörter)"},
      {t:"Brief: Beschwerde an Hausverwaltung",b:"Etwas in Ihrer Wohnung ist kaputt. Beschreiben Sie das Problem. Bitten Sie um Reparatur."},
      {t:"E-Mail: Fragen an Kursanbieter",b:"Fragen zu Kurszeiten, Preisen, Inhalten, freien Plätzen"},
      {t:"Reaktion auf Zeitungsartikel: Sport",b:"Wie viel Sport ist gesund? Meinung + Argumente + Erfahrungen (~80 Wörter)"},
    ],
    lesen:[
      {t:"Tagebucheintrag / Erfahrungsbericht (Teil 1)",b:"z.B. 'Heute ist mir etwas Seltsames passiert...' – 6 Aufgaben: Richtig oder Falsch?"},
      {t:"Radiodiskussion: Kleine Kinder in die Krippe (Teil 1 Variante)",b:"Text über Diskussion von Florian Bader – 10 Aussagen: Wer sagt was? Richtig/Falsch?"},
      {t:"Kleinanzeigen zuordnen (Teil 2)",b:"4–5 Personen suchen etwas (Gitarrenkurs, Arzt, Wohnung...). Welche Anzeige (a–f) passt?"},
      {t:"Lückentext Grammatik (Teil 3)",b:"Text mit 10 Lücken – Wortschatz & Grammatik. Beispiel: '...obwohl/weil/wenn...'"},
      {t:"Alltagstexte: Schilder, Aushänge (Teil 4)",b:"Kurze Texte aus dem Alltag. 5 Aufgaben: Richtig/Falsch"},
      {t:"Lückentext: Wort einsetzen (Teil 5)",b:"5 Lücken: Schreiben Sie das fehlende Wort selbst (kein Multiple Choice)"},
    ],
  },
  B2:{
    startTipp:"💡 Beim LESEN: Beginne mit Teil 5 (kurze Texte) – schnelle Punkte! Dann Teil 2 (Zuordnen), dann Teil 1 (langer Text). SCHREIBEN: 75 Min. – plane 10 Min. für Struktur! HÖREN Teil 2 wird NUR EINMAL gespielt. SPRECHEN: 15 Min. Vorbereitung nutzen!",
    grammatik:["Konjunktiv II vollständig (alle Verben)","Passiv alle Zeiten + Modalpassiv","Relativsätze alle 4 Fälle + mit Präpositionen","Infinitivkonstruktionen: um/ohne/anstatt...zu","Konnektoren: trotzdem, sodass, indem, je...desto","Genitiv-Präpositionen: wegen, trotz, aufgrund","Präpositionaladverbien: darauf, darüber, womit","Nominalisierung: entscheiden → die Entscheidung","Konjunktiv I Einführung (er sagt, er sei...)","Erweiterte Partizipialkonstruktionen (Grundlagen)"],
    sprechen:[
      {t:"Gesund leben",b:"Welche Formen? Eine Form genauer (Sport/Ernährung/Schlaf). Vor- & Nachteile. 4 Min."},
      {t:"Plastikverpackungen",b:"Warum so verbreitet? Umweltprobleme. Alternativen. Vor- & Nachteile. 4 Min."},
      {t:"Sollen Studierende ihre Professoren beurteilen?",b:"Diskussion: Argumente für & gegen. Persönliche Position begründen. 5 Min."},
      {t:"Gastfreundschaft – Rechte und Pflichten der Gäste",b:"Was müssen Gäste beachten? Was dürfen sie erwarten? 3 Min."},
      {t:"Was sollte man vor einer Reise wissen?",b:"Sitten, Gebräuche, Klima, Sprache, Versicherung. 3–4 Min."},
      {t:"Minimalismus im Alltag",b:"Was bedeutet das? Trend oder Notwendigkeit? Vor- & Nachteile. 4 Min."},
      {t:"Rauchen in Restaurants / Kneipen",b:"Rauchverbot: dafür oder dagegen? Diskussion mit Gegenargumenten. 5 Min."},
      {t:"Arbeit im Ausland",b:"Chancen und Risiken. Interkulturelle Erfahrungen. 4 Min."},
      {t:"Ehrenamt und freiwillige Arbeit",b:"Sollte der Staat Ehrenamt fördern? Gesellschaftlicher Wert. 4 Min."},
      {t:"Work-Life-Balance",b:"Wie viel Arbeit ist gesund? Überstunden, Urlaub, Familie. 4 Min."},
      {t:"Klimaschutz: Was kann jeder tun?",b:"Individuelle Maßnahmen vs. staatliche Pflicht. Diskussion. 5 Min."},
      {t:"Digitale Medien und Bildung",b:"Tablets in der Schule? Vor- & Nachteile für Lehrer und Schüler. 4 Min."},
    ],
    schreiben:[
      {t:"Forumsbeitrag: Plastikverpackungen",b:"Ihre Meinung zu Plastik im Alltag. Gründe warum so verbreitet. Alternativen. Vorteile. Einleitung & Schluss. (~150 Wörter)"},
      {t:"Forumsbeitrag: Fleischreiche Ernährung",b:"Äußern Sie Meinung zu Fleischkonsum. Gesundheit, Umwelt, Alternativen. (~150 Wörter)"},
      {t:"Brief an die Redaktion / Zeitung",b:"Reaktion auf Artikel (z.B. Lottogewinner, Rauchen, Umwelt). Meinung + Argumente + Schluss."},
      {t:"Formelle Nachricht: Fehler korrigieren",b:"In einem Veranstaltungsplan gibt es Fehler. Korrigieren Sie und schreiben Sie zurück."},
      {t:"Beschwerde: Schlechter Service",b:"Sie hatten ein schlechtes Erlebnis (Hotel, Restaurant, Kurs). Beschreiben Sie es formell."},
      {t:"Forumsbeitrag: Home-Office",b:"Vor- & Nachteile von Arbeit zu Hause. Persönliche Erfahrungen. (~150 Wörter)"},
    ],
    lesen:[
      {t:"Forum: Minimalismus (Teil 1)",b:"4 Personen äußern sich im Forum. 8 Aussagen: Auf welche Person trifft das zu? Richtig/Falsch/Nicht im Text"},
      {t:"Sachtext: Umwelt / Natur / Gesellschaft (Teil 2)",b:"Längerer Artikel. Detailverständnis. 8 Aufgaben: Richtig/Falsch/Nicht erwähnt"},
      {t:"Anzeigen / Kurztexte zuordnen (Teil 3)",b:"5 Personen suchen etwas. Welcher Text passt? Mehrere Texte zur Auswahl (a–h)"},
      {t:"Lückentext: Grammatik & Wortschatz (Teil 4)",b:"Text mit 10 Lücken, jeweils 3 Optionen (a/b/c). Typ: Präpositionen, Konjunktionen, Nomen"},
      {t:"Kurztexte: Angebote / Veranstaltungen (Teil 5)",b:"Mehrere kurze Texte. 5 Personen suchen etwas Passendes. Welcher Text (a–h)?"},
    ],
  },
  C1:{
    startTipp:"💡 Beim LESEN: Beginne mit Teil 5 (kurze Texte) und Teil 2 – schnelle Punkte! Teil 1 (langer Text) zuletzt. SCHREIBEN: 80 Min. – 15 Min. planen ist Pflicht! HÖREN Teil 2 wird NUR EINMAL gespielt – GEFÄHRLICH! SPRECHEN: Das Impulsreferat kommt ohne Vorbereitung!",
    grammatik:["Konjunktiv I vollständig (indirekte Rede)","Erweiterte Partizipialkonstruktionen","Nominalstil & Funktionsverbgefüge","Genitiv-Präpositionen C1: angesichts, mangels, infolge","Konnektoren C1: wohingegen, zumal, sofern, geschweige denn","Modalpartikeln: doch, ja, halt, wohl, schon","Wissenschaftlicher Schreibstil","Passiv alle Formen + unpersönliches Passiv","Konjunktiv II in allen Kontexten","Textstruktur & Kohäsionsmittel"],
    sprechen:[
      {t:"Handynutzung in Familien",b:"Studie lesen → kommentieren. Auswirkungen auf Kinder. Eigene Position. Impulsreferat 4–5 Min."},
      {t:"Digitalisierung der Arbeitswelt",b:"Chancen & Risiken. KI, Automatisierung. Folgen für Gesellschaft. Impulsreferat 4–5 Min."},
      {t:"Klimawandel & individuelle Verantwortung",b:"Was kann der Einzelne tun? Ist das genug? Staat vs. Individuum. Diskussion."},
      {t:"Bildung und soziale Ungleichheit",b:"Chancengleichheit – lösbar? Schulsystem, Herkunft, Zukunft. Abstrakte Diskussion."},
      {t:"Künstliche Intelligenz in der Medizin",b:"Fluch oder Segen? Ethik, Datenschutz, Effizienz. Impulsreferat."},
      {t:"Migration und Integration in Deutschland",b:"Herausforderungen, Lösungsansätze. Gesellschaftliche Perspektive. Diskussion."},
      {t:"Pressefreiheit und soziale Medien",b:"Ist Pressefreiheit in Gefahr? Rolle von Twitter/X, TikTok. Impulsreferat."},
      {t:"Verpflichtendes soziales Jahr",b:"Für und gegen Pflichtdienst. Gesellschaftlicher Nutzen. Diskussion."},
      {t:"Gentechnik in der Landwirtschaft",b:"Pro/Contra. Wissenschaft vs. Natur. Ethische Fragen. Diskussion."},
      {t:"Schlaf in der modernen Gesellschaft",b:"Schlafmangel als gesellschaftliches Problem. Ursachen, Folgen, Lösungen. Impulsreferat."},
    ],
    schreiben:[
      {t:"Kritische Stellungnahme: Studium vs. Berufsausbildung",b:"Welches Modell ist besser für die moderne Arbeitswelt? Argumente, Gegenargumente, eigene Position. (~230 Wörter)"},
      {t:"Stellungnahme: Verpflichtendes soziales Jahr",b:"Soll ein soziales Pflichtjahr eingeführt werden? Pro/Contra. Fazit. (~230 Wörter)"},
      {t:"Stellungnahme: Digitale Währungen regulieren?",b:"Sollen Kryptowährungen gesetzlich geregelt werden? Argumente. (~230 Wörter)"},
      {t:"Stellungnahme: KI in der Bildung",b:"Soll KI im Unterricht eingesetzt werden? Chancen & Risiken. (~230 Wörter)"},
      {t:"Zusammenfassung eines Medienberichts",b:"Fassen Sie die Hauptthesen eines Artikels (z.B. über Digitalisierung) zusammen. Keine eigene Meinung! (~120 Wörter)"},
      {t:"Formeller Brief / Offener Brief",b:"An eine Institution oder Zeitung: Protest, Forderung oder Reaktion auf gesellschaftliches Ereignis"},
    ],
    lesen:[
      {t:"Populärwiss. Artikel: Handynutzung in Familien (Teil 1)",b:"Studie aus englischsprachiger Zeitschrift. Auswirkungen auf Kinder. 7 Aufgaben: R/F/Nicht im Text. Detailverstehen + Implikationen"},
      {t:"Sachtext: Arbeit & Digitalisierung (Teil 2)",b:"Kurztexte verschiedener Personen/Quellen. Welche Aussage passt zu welchem Text? 5 Aufgaben. Selektives Lesen."},
      {t:"Lückentext: Lexik & Strukturen (Teil 3)",b:"320-Wörter-Text mit 8 Lücken (+Beispiel). Jeweils 4 Optionen. Prüft: Lexik, Kollokationen, Strukturen. 10 Min. Zeit."},
      {t:"Fehlende Sätze einsetzen (Teil 4)",b:"Text mit 6 fehlenden Sätzen/Abschnitten. Wählen Sie aus 8 Optionen. Prüft: Textkohärenz, logischer Aufbau"},
      {t:"Kurztexte zuordnen: Ankündigungen / Programme (Teil 5)",b:"5 Personen suchen etwas (Kurs, Veranstaltung, Info). Welcher Kurztext (a–h) passt? Selektives Lesen."},
    ],
  },
};

const DIFFICULTIES = [
  { key:"easy",   label:"Normal",      icon:"zap",   color:"#10b981", time:900, desc:"Grundlegende Fragen, viel Zeit. Ideal zur Wiederholung." },
  { key:"medium", label:"Mittel",      icon:"flame", color:"#f59e0b", time:720, desc:"Prüfungsnahes Niveau. Entspricht dem echten Goethe-Test." },
  { key:"hard",   label:"Schwierig",   icon:"star",  color:"#ef4444", time:540, desc:"Komplexere Formulierungen, weniger Zeit. Für Fortgeschrittene." },
  { key:"expert", label:"Experte",     icon:"skull", color:"#7c3aed", time:360, desc:"Sehr anspruchsvoll. Kombinierte Themen, minimale Zeit." },
];

// ── EXAM STRUCTURE (offizielle Goethe-Institut Daten) ─────────
const EXAM_STRUCT = {
  A1:{
    name: "Goethe-Zertifikat A1: Start Deutsch 1",
    intro:"Die Prüfung bestätigt einfachste Deutschkenntnisse (Niveau A1 des GeR). Sie richtet sich an Erwachsene ab 16 Jahren und wird weltweit einheitlich durchgeführt.",
    modular: false,
    totalTime: "ca. 65 Min. schriftlich + 15 Min. mündlich",
    passingRule: "Mindestens 60 von 100 Punkten (60%) – alle Teile müssen abgelegt werden.",
    pdfUrl: "https://www.goethe.de/pro/relaunch/prf/materialien/A1_sd1/sd_1_modellsatz.pdf",
    parts:[
      {
        name:"Hören",
        icon:"video",
        dur:"ca. 20 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie hören kurze Gespräche (z.B. Telefonnachrichten). 6 Aufgaben: richtige Lösung ankreuzen (a, b oder c). Jeder Text wird zweimal gespielt."},
          {n:"Teil 2", desc:"Sie hören öffentliche Durchsagen. 4 Aufgaben: Richtig oder Falsch ankreuzen. Texte werden einmal gespielt."},
          {n:"Teil 3", desc:"Sie hören alltägliche Gespräche. 5 Aufgaben: Richtig oder Falsch. Texte werden zweimal gespielt."},
        ],
        tip:"Lesen Sie zuerst die Aufgabe – dann hören Sie den Text. Schreiben Sie beim ersten Hören Notizen.",
      },
      {
        name:"Lesen",
        icon:"book",
        dur:"ca. 25 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie lesen zwei kurze Texte (z.B. eine E-Mail und eine Anzeige). 5 Aufgaben: Richtig oder Falsch ankreuzen."},
          {n:"Teil 2", desc:"Sie lesen Aushänge, Schilder oder Anzeigen. 5 Aufgaben: Richtig oder Falsch."},
          {n:"Teil 3", desc:"Sie lesen kurze Informationstexte und finden Antworten auf konkrete Fragen. 5 Aufgaben."},
        ],
        tip:"Überfliegen Sie den Text zuerst. Lesen Sie dann die Aufgaben und suchen Sie gezielt nach Antworten.",
      },
      {
        name:"Schreiben",
        icon:"pencil",
        dur:"ca. 20 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie füllen ein einfaches Formular aus (z.B. Anmeldeformular mit Name, Adresse, Telefonnummer etc.)."},
          {n:"Teil 2", desc:"Sie schreiben eine kurze persönliche Mitteilung (ca. 30 Wörter) – z.B. eine Einladung oder eine Entschuldigung."},
        ],
        tip:"Achten Sie auf vollständige Sätze, Groß-/Kleinschreibung und Satzzeichen. Wörterbücher sind nicht erlaubt.",
      },
      {
        name:"Sprechen",
        icon:"info",
        dur:"ca. 15 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie stellen sich in der Gruppe vor (Name, Herkunft, Wohnort, Sprachen, Hobbys)."},
          {n:"Teil 2", desc:"Sie erfragen und geben Informationen zu alltäglichen Themen (z.B. Einkaufen, Wochenende). Mit Kärtchen."},
          {n:"Teil 3", desc:"Sie formulieren eine Bitte und reagieren auf eine Bitte (z.B. jemanden um etwas bitten)."},
        ],
        tip:"Sprechen Sie deutlich und nicht zu schnell. Fehler sind erlaubt – es geht um Kommunikation!",
      },
    ],
  },
  A2:{
    name: "Goethe-Zertifikat A2",
    intro:"Die Prüfung bestätigt grundlegende Deutschkenntnisse (Niveau A2 des GeR). Für Erwachsene ab 16 Jahren. Nicht modular – alle Teile müssen zusammen abgelegt werden.",
    modular: false,
    totalTime: "ca. 75 Min. schriftlich + 15 Min. mündlich",
    passingRule: "Mindestens 60 von 100 Punkten (60%) – mindestens 45 Punkte schriftlich, mindestens 15 Punkte mündlich.",
    pdfUrl: "https://www.goethe.de/pro/relaunch/prf/materialien/A2/A2_Uebungssatz_Erwachsene.pdf",
    parts:[
      {
        name:"Hören",
        icon:"video",
        dur:"ca. 25 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie hören kurze Alltagsgespräche. 6 Aufgaben: richtige Lösung ankreuzen (a, b oder c). Zweimal gespielt."},
          {n:"Teil 2", desc:"Sie hören ein längeres Gespräch oder Interview. 4 Aufgaben: Richtig oder Falsch."},
          {n:"Teil 3", desc:"Sie hören öffentliche Durchsagen oder Ansagen. 5 Aufgaben: Richtig oder Falsch. Einmal gespielt."},
          {n:"Teil 4", desc:"Sie hören ein Radio-Interview. 5 Aufgaben: Richtig oder Falsch."},
        ],
        tip:"Nutzen Sie die Vorlesezeit, um die Aufgaben zu lesen. So wissen Sie, worauf Sie achten müssen.",
      },
      {
        name:"Lesen",
        icon:"book",
        dur:"ca. 30 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie lesen einen kurzen Zeitungsartikel oder Bericht. 6 Aufgaben: Richtig oder Falsch."},
          {n:"Teil 2", desc:"Sie lesen Anzeigen oder kurze Texte und ordnen zu. 5 Aufgaben."},
          {n:"Teil 3", desc:"Sie lesen kurze Alltagstexte (E-Mails, Aushänge) und beantworten Fragen. 4 Aufgaben."},
          {n:"Teil 4", desc:"Sie lesen Texte mit Lücken und wählen das richtige Wort. 5 Aufgaben (Wortschatz/Grammatik)."},
        ],
        tip:"Bei Lückentexten: Lesen Sie den ganzen Satz, bevor Sie eine Option wählen.",
      },
      {
        name:"Schreiben",
        icon:"pencil",
        dur:"ca. 20 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie füllen ein Formular oder eine Tabelle mit persönlichen Informationen aus."},
          {n:"Teil 2", desc:"Sie schreiben eine kurze Nachricht oder E-Mail (ca. 30 Wörter) zu einer alltäglichen Situation."},
        ],
        tip:"Verwenden Sie einfache, klare Sätze. Beantworten Sie alle Punkte der Aufgabenstellung.",
      },
      {
        name:"Sprechen",
        icon:"info",
        dur:"ca. 15 Min.",
        pts:25,
        tasks:[
          {n:"Teil 1", desc:"Sie stellen sich vor (Beruf, Familie, Wohnort, Hobbys etc.)."},
          {n:"Teil 2", desc:"Sie erfragen und geben Informationen zu einem alltäglichen Thema (mit Bildkarten)."},
          {n:"Teil 3", desc:"Sie planen gemeinsam mit einem Partner eine Aktivität."},
        ],
        tip:"Reagieren Sie aktiv auf Ihren Partner. Stellen Sie Rückfragen und zeigen Sie Interesse.",
      },
    ],
  },
  B1:{
    name: "Goethe-Zertifikat B1",
    intro:"Die Prüfung bestätigt selbstständige Sprachverwendung (Niveau B1 des GeR). Modular aufgebaut ab B1 – die vier Module können einzeln oder zusammen abgelegt werden.",
    modular: true,
    totalTime: "Lesen 65 Min. · Hören 40 Min. · Schreiben 60 Min. · Sprechen 15 Min.",
    passingRule: "Jedes Modul: mindestens 60 von 100 Punkten (60%). Module können separat wiederholt werden.",
    pdfUrl: "https://www.goethe.de/pro/relaunch/prf/materialien/B1/b1_modellsatz_erwachsene.pdf",
    parts:[
      {
        name:"Lesen",
        icon:"book",
        dur:"65 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie lesen einen längeren Text (z.B. Tagebucheintrag, Erfahrungsbericht). 6 Aufgaben: Richtig oder Falsch."},
          {n:"Teil 2", desc:"Sie lesen Anzeigen oder Kleinanzeigen und ordnen Personen passenden Texten zu. 5 Aufgaben."},
          {n:"Teil 3", desc:"Sie lesen einen Zeitungsartikel mit Lücken und wählen das passende Wort (Grammatik/Wortschatz). 10 Aufgaben."},
          {n:"Teil 4", desc:"Sie lesen Alltagstexte (Schilder, kurze Mitteilungen) und beantworten Fragen. 5 Aufgaben."},
          {n:"Teil 5", desc:"Sie lesen einen Text mit Lücken und ergänzen das fehlende Wort (ohne Auswahlmöglichkeit). 5 Aufgaben."},
        ],
        tip:"Beginnen Sie mit den Aufgaben, die Sie sicher beherrschen. Planen Sie Zeit für jeden Teil ein.",
      },
      {
        name:"Hören",
        icon:"video",
        dur:"40 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie hören ein Radio-Interview oder eine Diskussion. 6 Aufgaben: Richtig oder Falsch. Zweimal gespielt."},
          {n:"Teil 2", desc:"Sie hören Alltagsgespräche. 5 Aufgaben: Richtige Antwort ankreuzen (a, b oder c)."},
          {n:"Teil 3", desc:"Sie hören eine längere Präsentation oder einen Vortrag. 5 Aufgaben: Richtig oder Falsch. NUR EINMAL gespielt!"},
          {n:"Teil 4", desc:"Sie hören Durchsagen oder Nachrichten. 5 Aufgaben: Richtig oder Falsch. NUR EINMAL gespielt!"},
        ],
        tip:"ACHTUNG: Teile 3 und 4 werden nur EINMAL gespielt! Konzentrieren Sie sich und machen Sie Notizen.",
      },
      {
        name:"Schreiben",
        icon:"pencil",
        dur:"60 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie schreiben eine E-Mail oder einen Brief (ca. 80 Wörter) zu einem alltäglichen Thema. Alle Punkte der Aufgabenstellung müssen bearbeitet werden."},
          {n:"Teil 2", desc:"Sie schreiben eine Stellungnahme oder Meinungsäußerung (ca. 80 Wörter) zu einem vorgegebenen Thema."},
        ],
        tip:"Planen Sie 5 Minuten für die Struktur: Einleitung – Hauptteil – Schluss. Zählen Sie die Wörter.",
      },
      {
        name:"Sprechen",
        icon:"info",
        dur:"15 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie halten eine kurze Präsentation (ca. 2 Min.) zu einem vorgegebenen Thema mit Stichwörtern."},
          {n:"Teil 2", desc:"Sie geben Feedback zur Präsentation Ihres Partners und äußern Ihre Meinung."},
          {n:"Teil 3", desc:"Sie planen gemeinsam eine Aktivität und einigen sich auf eine Lösung."},
        ],
        tip:"Benutzen Sie Redemittel: 'Meiner Meinung nach...', 'Ich bin dafür/dagegen, weil...', 'Einerseits...andererseits...'",
      },
    ],
  },
  B2:{
    name: "Goethe-Zertifikat B2",
    intro:"Die Prüfung belegt fortgeschrittene Deutschkenntnisse (Niveau B2 des GeR). Modular aufgebaut – die vier Module können einzeln oder in Kombination abgelegt werden.",
    modular: true,
    totalTime: "Lesen 65 Min. · Hören 40 Min. · Schreiben 75 Min. · Sprechen 15 Min.",
    passingRule: "Jedes Modul: mindestens 60 von 100 Punkten (60%). Module können separat wiederholt werden.",
    pdfUrl: "https://www.goethe.de/pro/relaunch/prf/materialien/B2/b2_modellsatz_erwachsene.pdf",
    parts:[
      {
        name:"Lesen",
        icon:"book",
        dur:"65 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie lesen einen längeren Sachtext und beantworten Fragen zum Gesamtverständnis und zu Details. 8 Aufgaben (Richtig/Falsch/Nicht im Text)."},
          {n:"Teil 2", desc:"Sie lesen mehrere kurze Texte und ordnen Aussagen den Texten zu. 5 Aufgaben."},
          {n:"Teil 3", desc:"Sie lesen einen Text mit Lücken und ergänzen fehlende Sätze oder Satzteile aus einer Auswahl. 5 Aufgaben."},
          {n:"Teil 4", desc:"Sie lesen einen Text mit Lücken und wählen das passende Wort (Lexik/Grammatik). 10 Aufgaben."},
          {n:"Teil 5", desc:"Sie lesen Kurzinformationen und beantworten konkrete Fragen dazu. 5 Aufgaben."},
        ],
        tip:"Achten Sie auf implizite Bedeutungen und Schlüsselwörter. Beim Typ 'Nicht im Text': Achtung – die Aussage muss explizit im Text stehen.",
      },
      {
        name:"Hören",
        icon:"video",
        dur:"40 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie hören ein Interview oder Gespräch. 8 Aufgaben: Richtig/Falsch/Nicht erwähnt. Zweimal gespielt."},
          {n:"Teil 2", desc:"Sie hören einen Vortrag oder Bericht. 5 Aufgaben: Richtig oder Falsch. NUR EINMAL gespielt!"},
          {n:"Teil 3", desc:"Sie hören ein Gespräch mit mehreren Personen. 5 Aufgaben: Welche Person sagt was? Zweimal gespielt."},
          {n:"Teil 4", desc:"Sie hören kurze Aussagen und ordnen sie Themen zu. 5 Aufgaben. Zweimal gespielt."},
        ],
        tip:"Teil 2 wird nur EINMAL gespielt! Lesen Sie die Aufgaben vorher genau und notieren Sie Schlüsselwörter.",
      },
      {
        name:"Schreiben",
        icon:"pencil",
        dur:"75 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie schreiben eine Erörterung oder Stellungnahme (ca. 150 Wörter) zu einem gesellschaftlichen Thema. Argumente für und gegen eine Position darstellen."},
          {n:"Teil 2", desc:"Sie schreiben einen formellen Brief oder eine formelle E-Mail (ca. 100 Wörter) – z.B. eine Beschwerde, Anfrage oder Bewerbung."},
        ],
        tip:"Verwenden Sie Konnektoren: 'Darüber hinaus', 'Im Gegensatz dazu', 'Infolgedessen'. Formeller Brief: korrekte Anrede und Grußformel!",
      },
      {
        name:"Sprechen",
        icon:"info",
        dur:"ca. 15 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie halten eine strukturierte Präsentation (ca. 3 Min.) zu einem Thema mit grafischer Darstellung. Einleitung – Beschreibung der Grafik – Fazit."},
          {n:"Teil 2", desc:"Sie diskutieren mit Ihrem Partner über ein kontroVerses Thema und verhandeln eine gemeinsame Lösung."},
        ],
        tip:"Strukturieren Sie Ihre Präsentation klar: 'Zunächst möchte ich... Dann werde ich... Abschließend...' Reagieren Sie auf Gegenargumente.",
      },
    ],
  },
  C1:{
    name: "Goethe-Zertifikat C1 (modular, ab Januar 2024)",
    intro:"Die Prüfung beweist kompetente Sprachbeherrschung (Niveau C1 des GeR). Seit Januar 2024 vollständig modular. Jedes der vier Module kann einzeln abgelegt werden.",
    modular: true,
    totalTime: "Lesen 70 Min. · Hören 40 Min. · Schreiben 80 Min. · Sprechen 15 Min.",
    passingRule: "Jedes Modul: mindestens 60 von 100 Punkten (60%). Module können zu verschiedenen Zeitpunkten (innerhalb von 365 Tagen) abgelegt werden.",
    pdfUrl: "https://www.goethe.de/pro/relaunch/prf/materialien/C1_modular/c1-modular_modellsatz.pdf",
    parts:[
      {
        name:"Lesen",
        icon:"book",
        dur:"70 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie lesen einen längeren Sachtext (ca. 600–800 Wörter). 7 Aufgaben: Richtig/Falsch/Nicht im Text. Globalverstehen und Detailverständnis."},
          {n:"Teil 2", desc:"Sie lesen mehrere Kurztexte zu einem Thema und ordnen Aussagen zu. 5 Aufgaben. Selektives Lesen."},
          {n:"Teil 3", desc:"Sie lesen einen Text mit 8 Lücken (+ Beispiel). Wählen Sie aus vier Optionen das passende Wort (Lexik/Strukturen). 8 Aufgaben."},
          {n:"Teil 4", desc:"Sie lesen einen Text, in dem Sätze/Abschnitte fehlen. Wählen Sie den passenden Satzteil aus einer Liste. 6 Aufgaben. Textkohärenz."},
          {n:"Teil 5", desc:"Sie lesen kurze Informationstexte (z.B. Programmhinweise, Ankündigungen). 5 Aufgaben: Welcher Text passt?"},
        ],
        tip:"Achten Sie auf Ironie, Modalpartikeln und Nominalstil. Beim Lückentextformat: Lesen Sie immer den ganzen Satz mit Kontext.",
      },
      {
        name:"Hören",
        icon:"video",
        dur:"ca. 40 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie hören einen Vortrag oder eine Präsentation (ca. 5 Min.). 8 Aufgaben: Richtig/Falsch/Nicht erwähnt. Zweimal gespielt."},
          {n:"Teil 2", desc:"Sie hören ein komplexes Gespräch oder Diskussion. 5 Aufgaben: Richtig oder Falsch. NUR EINMAL gespielt!"},
          {n:"Teil 3", desc:"Sie hören Interviews mit mehreren Personen zu einem Thema. 5 Aufgaben: Welche Person sagt was? Zweimal gespielt."},
          {n:"Teil 4", desc:"Sie hören kurze Äußerungen und beantworten Aufgaben dazu. 10 Aufgaben. Zweimal gespielt."},
        ],
        tip:"Teil 2 wird nur EINMAL gespielt! Akademisches und fachsprachliches Vokabular auf C1-Niveau ist typisch.",
      },
      {
        name:"Schreiben",
        icon:"pencil",
        dur:"80 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie schreiben eine kritische Stellungnahme (ca. 230 Wörter) zu einem gesellschaftlichen oder wissenschaftlichen Thema. Komplexe Argumentation erforderlich."},
          {n:"Teil 2", desc:"Sie schreiben eine Zusammenfassung oder einen formellen Text (ca. 120 Wörter) auf Basis von Quellmaterial."},
        ],
        tip:"Verwenden Sie Nominalstil, Passiv und C1-Konnektoren: 'Wohingegen', 'Angesichts', 'Infolgedessen'. Strukturieren Sie mit: 'Im Folgenden wird... – Zusammenfassend lässt sich sagen...'",
      },
      {
        name:"Sprechen",
        icon:"info",
        dur:"ca. 15 Min.",
        pts:100,
        tasks:[
          {n:"Teil 1", desc:"Sie halten ein Impulsreferat (4–5 Min.) auf Basis eines Impulstexts. Keine Vorbereitungszeit – spontane Reaktion auf den Text."},
          {n:"Teil 2", desc:"Sie diskutieren mit Ihrem Partner über ein komplexes, abstraktes Thema. Argumentieren, Hypothesen aufstellen, auf Gegenargumente eingehen."},
        ],
        tip:"Konjunktiv I für indirekte Rede zeigen! Abstrakte Argumentation: 'Das ließe sich dadurch erklären, dass...' / 'Es wäre denkbar, dass...'",
      },
    ],
  },
};


// ═══════════════════════════════════════════════════════════════
// CURRICULUM – All Lektionen A1.1 … C1.6
// ═══════════════════════════════════════════════════════════════
const CUR = {
A1:[
  { id:"A1.1", title:"Artikel: der, die, das", topic:"Grammatik", explanation:`Jedes deutsche Nomen hat einen Artikel. Der Artikel zeigt das Genus (Geschlecht).

| Artikel | Genus | Beispiele |
|---|---|---|
| **der** | maskulin | der Mann, der Tisch, der Hund |
| **die** | feminin | die Frau, die Lampe, die Schule |
| **das** | neutrum | das Kind, das Buch, das Auto |
| **die** | Plural | die Männer, die Bücher |

**Bestimmt vs. Unbestimmt:**
| | mask. | fem. | neutr. |
|---|---|---|---|
| bestimmt | **der** | **die** | **das** |
| unbestimmt | **ein** | **eine** | **ein** |

**Merkhilfen:**
- Endung **-ung, -heit, -keit, -schaft, -tion** → immer **die**
- Endung **-chen, -lein** → immer **das**
- Endung **-er, -ling, -ist** → oft **der**`,
    exercises:[
      {q:"___ Mann ist groß. (maskulin, bestimmt)",a:"Der",hint:"maskulin bestimmt → Der"},
      {q:"___ Kind spielt im Garten. (neutrum, bestimmt)",a:"Das",hint:"neutrum bestimmt → Das"},
      {q:"___ Frau liest ein Buch. (feminin, bestimmt)",a:"Die",hint:"feminin bestimmt → Die"},
      {q:"Das ist ___ Tisch. (maskulin, unbestimmt)",a:"ein",hint:"maskulin unbestimmt → ein"},
      {q:"Ich habe ___ Katze. (feminin, unbestimmt)",a:"eine",hint:"feminin unbestimmt → eine"},
    ]},
  { id:"A1.2", title:"Personalpronomen & sein/haben", topic:"Grammatik", explanation:`Personalpronomen ersetzen Namen. Verben werden konjugiert.

| Pronomen | sein | haben | kommen | heißen |
|---|---|---|---|---|
| ich | bin | habe | komme | heiße |
| du | bist | hast | kommst | heißt |
| er/sie/es | ist | hat | kommt | heißt |
| wir | sind | haben | kommen | heißen |
| ihr | seid | habt | kommt | heißt |
| sie/Sie | sind | haben | kommen | heißen |

**Beispiele:**
- *Ich **bin** Student. Ich **komme** aus Marokko.*
- *Er **hat** einen Bruder. Er **heißt** Ahmed.*`,
    exercises:[
      {q:"Ich ___ Student. (sein)",a:"bin",hint:"ich → bin"},
      {q:"Er ___ einen Bruder. (haben)",a:"hat",hint:"er → hat"},
      {q:"Wir ___ in Berlin. (sein)",a:"sind",hint:"wir → sind"},
      {q:"Du ___ sehr gut Deutsch. (sprechen)",a:"sprichst",hint:"du + sprechen → sprichst"},
      {q:"Sie (Pl.) ___ aus Frankreich. (kommen)",a:"kommen",hint:"sie Plural → kommen"},
    ]},
  { id:"A1.3", title:"Verneinung: nicht & kein", topic:"Grammatik", explanation:`**nicht** → verneint Verben und Adjektive
**kein/keine/kein** → verneint Nomen

| Satz | Verneinung | Regel |
|---|---|---|
| Ich arbeite. | Ich arbeite **nicht**. | Verb → nicht |
| Er ist groß. | Er ist **nicht** groß. | Adjektiv → nicht |
| Ich habe **ein** Auto. | Ich habe **kein** Auto. | mask./neutr. Nomen |
| Ich habe **eine** Katze. | Ich habe **keine** Katze. | fem. Nomen |
| Ich habe Zeit. | Ich habe **keine** Zeit. | Nomen ohne Artikel |

**Position von "nicht":** Am Satzende oder vor dem verneinten Wort.`,
    exercises:[
      {q:"Ich habe ___ Zeit. (Verneinung, kein Artikel)",a:"keine",hint:"kein Artikel/Plural → keine"},
      {q:"Er schläft ___. (Verb verneinen)",a:"nicht",hint:"Verb am Ende → nicht"},
      {q:"Das ist ___ Hund. (maskulin)",a:"kein",hint:"maskulin → kein"},
      {q:"Sie ist ___ müde. (Adjektiv)",a:"nicht",hint:"Adjektiv → nicht davor"},
      {q:"Wir haben ___ Kinder. (Plural)",a:"keine",hint:"Plural → keine"},
    ]},
  { id:"A1.4", title:"W-Fragen & Ja/Nein-Fragen", topic:"Kommunikation", explanation:`**Ja/Nein-Fragen:** Verb an Position 1
*Kommst du aus Berlin?* – Ja. / Nein.

**W-Fragen:** W-Wort + Verb + Subjekt

| Fragewort | Bedeutung | Beispiel |
|---|---|---|
| **Wer?** | Person | Wer ist das? |
| **Was?** | Sache | Was machst du? |
| **Wo?** | Ort (statisch) | Wo wohnst du? |
| **Woher?** | Herkunft | Woher kommst du? |
| **Wohin?** | Richtung | Wohin gehst du? |
| **Wann?** | Zeit | Wann kommst du? |
| **Wie?** | Art/Weise/Name | Wie heißt du? |
| **Warum?** | Grund | Warum lernst du Deutsch? |
| **Wie viel?** | Menge/Preis | Wie viel kostet das? |`,
    exercises:[
      {q:"___ heißt du? – Ich heiße Maria.",a:"Wie",hint:"Name → Wie"},
      {q:"___ kommst du? – Aus Marokko.",a:"Woher",hint:"Herkunft → Woher"},
      {q:"___ wohnst du? – In Berlin.",a:"Wo",hint:"Ort → Wo"},
      {q:"___ kostet das? – 5 Euro.",a:"Wie viel",hint:"Preis → Wie viel"},
      {q:"___ lernst du Deutsch? – Für die Prüfung.",a:"Warum",hint:"Grund → Warum"},
    ]},
  { id:"A1.5", title:"Zahlen, Datum & Uhrzeit", topic:"Wortschatz", explanation:`**Zahlen 1–100:**
1=ein, 2=zwei, 3=drei, 4=vier, 5=fünf, 6=sechs, 7=sieben, 8=acht, 9=neun, 10=zehn
11=elf, 12=zwölf, 13=dreizehn... 20=zwanzig, 21=einundzwanzig...
30=dreißig, 40=vierzig, 50=fünfzig, 100=hundert

**Uhrzeit:**
| Uhrzeit | Formal | Umgangssprachlich |
|---|---|---|
| 8:00 | acht Uhr | acht |
| 8:15 | acht Uhr fünfzehn | Viertel nach acht |
| 8:30 | acht Uhr dreißig | halb neun |
| 8:45 | acht Uhr fünfundvierzig | Viertel vor neun |

**Datum:** *der 3. Oktober* / *am 3. Oktober* / *am dritten Oktober*
**Tage:** Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag`,
    exercises:[
      {q:"Wie schreibt man 21 auf Deutsch?",a:"einundzwanzig",hint:"21 = einundzwanzig"},
      {q:"8:30 Uhr auf Deutsch (umgangssprachlich)?",a:"halb neun",hint:"8:30 = halb neun (Mitte zur nächsten Stunde)"},
      {q:"Wie sagt man 'am Montag' auf Deutsch?",a:"am Montag",hint:"an + dem → am + Wochentag"},
      {q:"Wie schreibt man 15 auf Deutsch?",a:"fünfzehn",hint:"15 = fünfzehn"},
      {q:"8:15 Uhr (umgangssprachlich)?",a:"Viertel nach acht",hint:"8:15 = Viertel nach acht"},
    ]},
  { id:"A1.6", title:"Nominativ & Akkusativ im Satz", topic:"Grammatik", explanation:`**Nominativ** = Subjekt (Wer/Was tut etwas?)
**Akkusativ** = direktes Objekt (Wen/Was?)

| | mask. | fem. | neutr. | Plural |
|---|---|---|---|---|
| **Nom. best.** | der | die | das | die |
| **Akk. best.** | **den** | die | das | die |
| **Nom. unbest.** | ein | eine | ein | — |
| **Akk. unbest.** | **einen** | eine | ein | — |

**Wichtig:** Nur maskulin ändert sich (der→den, ein→einen)!

**Verben mit Akkusativ:** haben, sehen, kaufen, essen, trinken, nehmen, lieben, kennen...

*Der Mann kauft **einen** Hund.* (mask. Akk.)
*Sie liebt **die** Musik.* (fem. Akk. → keine Änderung)`,
    exercises:[
      {q:"Ich sehe ___ Mann. (mask., Akk., bestimmt)",a:"den",hint:"mask. Akkusativ bestimmt → den"},
      {q:"Er kauft ___ Hund. (mask., Akk., unbestimmt)",a:"einen",hint:"mask. Akkusativ unbestimmt → einen"},
      {q:"Sie trinkt ___ Kaffee. (mask., Akk., bestimmt)",a:"den",hint:"mask. Akkusativ → den"},
      {q:"Ich habe ___ Buch. (neutr., Akk., unbestimmt)",a:"ein",hint:"neutrum Akkusativ → kein Änderung → ein"},
      {q:"Er liebt ___ Frau. (fem., Akk., bestimmt)",a:"die",hint:"feminin Akkusativ → keine Änderung → die"},
    ]},
],
A2:[
  { id:"A2.1", title:"Dativ – der dritte Fall", topic:"Grammatik", explanation:`**Dativ** = indirektes Objekt (Wem?)
Verben mit Dativ: helfen, danken, gehören, gefallen, antworten, schaden...

| | mask. | fem. | neutr. | Plural |
|---|---|---|---|---|
| **Dat. best.** | **dem** | **der** | **dem** | **den** (+n) |
| **Dat. unbest.** | **einem** | **einer** | **einem** | — |

**Präpositionen immer mit Dativ:**
aus, bei, mit, nach, seit, von, zu, gegenüber

*Ich gebe **dem Mann** das Buch.* (mask. Dat.)
*Er hilft **der Frau**.* (fem. Dat.)
*Ich komme **aus der** Schule.* (aus + Dat.)`,
    exercises:[
      {q:"Ich helfe ___ Mann. (mask., Dat., bestimmt)",a:"dem",hint:"mask. Dativ bestimmt → dem"},
      {q:"Er gibt ___ Frau das Geld. (fem., Dat., bestimmt)",a:"der",hint:"fem. Dativ bestimmt → der"},
      {q:"Sie dankt ___ Kind. (neutr., Dat., bestimmt)",a:"dem",hint:"neutr. Dativ bestimmt → dem"},
      {q:"Ich komme ___ der Schule. (aus + Dativ)",a:"aus",hint:"aus = immer Dativ"},
      {q:"Er wohnt ___ einem Freund. (bei + Dativ)",a:"bei",hint:"bei = immer Dativ"},
    ]},
  { id:"A2.2", title:"Trennbare & untrennbare Verben", topic:"Grammatik", explanation:`**Trennbare Verben:** Präfix geht ans Satzende
Präfixe: auf-, an-, ab-, ein-, mit-, aus-, vor-, nach-, zu-, los-...

| Verb | Präsens | Perfekt |
|---|---|---|
| aufmachen | ich **mache** auf | ich habe **aufgemacht** |
| anrufen | er **ruft** an | er hat **angerufen** |
| aufstehen | ich **stehe** auf | ich bin **aufgestanden** |
| einkaufen | wir **kaufen** ein | wir haben **eingekauft** |

**Untrennbare Verben:** Präfix bleibt immer fest, kein "ge-" im Partizip!
Präfixe: be-, ge-, er-, ver-, zer-, ent-, emp-, miss-

| Verb | Präsens | Perfekt |
|---|---|---|
| verstehen | ich verstehe | ich habe **verstanden** |
| erzählen | er erzählt | er hat **erzählt** |
| besuchen | sie besucht | sie hat **besucht** |`,
    exercises:[
      {q:"Ich ___ die Tür ___. (aufmachen, Präsens)",a:"mache, auf",hint:"trennbar: mache...auf"},
      {q:"Er ___ um 7 Uhr ___. (aufstehen, Präsens)",a:"steht, auf",hint:"steht...auf"},
      {q:"Er hat sie gestern ___. (anrufen, Perfekt)",a:"angerufen",hint:"Perfekt trennbar: angerufen"},
      {q:"Sie hat die Geschichte ___. (erzählen, Perfekt)",a:"erzählt",hint:"untrennbar: kein ge- → erzählt"},
      {q:"Wir haben das nicht ___. (verstehen, Perfekt)",a:"verstanden",hint:"untrennbar: verstanden (kein ge-)"},
    ]},
  { id:"A2.3", title:"Wechselpräpositionen: Wo? & Wohin?", topic:"Grammatik", explanation:`9 Wechselpräpositionen: **an, auf, in, über, unter, vor, hinter, neben, zwischen**

**Wo? (Lage) → Dativ | Wohin? (Richtung) → Akkusativ**

| Präp. | Dativ (Wo?) | Akkusativ (Wohin?) |
|---|---|---|
| in | im (=in dem) Zimmer | ins (=in das) Zimmer |
| auf | auf dem Tisch | auf den Tisch |
| an | am (=an dem) Fenster | ans (=an das) Fenster |
| über | über dem Bett | über das Bett |
| unter | unter dem Stuhl | unter den Stuhl |

**Merktrick:** *stehen/liegen/hängen/sein* → Lage → Dativ
*stellen/legen/hängen/gehen/fahren* → Richtung → Akkusativ`,
    exercises:[
      {q:"Das Buch liegt ___ dem Tisch. (Lage)",a:"auf",hint:"Lage → Dativ: auf dem"},
      {q:"Ich lege das Buch ___ den Tisch. (Richtung)",a:"auf",hint:"Richtung → Akkusativ: auf den"},
      {q:"Er sitzt ___ Fenster. (an + Dativ, Kontraktion)",a:"am",hint:"an + dem → am"},
      {q:"Sie geht ___ Schule. (in + Akkusativ, Kontraktion)",a:"in die",hint:"Richtung + feminin → in die"},
      {q:"Das Bild hängt ___ Wand. (an + Dativ, feminin)",a:"an der",hint:"Lage, feminin Dativ → an der"},
    ]},
  { id:"A2.4", title:"Komparativ & Superlativ", topic:"Grammatik", explanation:`3 Stufen: **Positiv → Komparativ → Superlativ**

| Positiv | Komparativ | Superlativ (prädikativ) | Superlativ (attributiv) |
|---|---|---|---|
| klein | kleiner | am kleinsten | der kleinste |
| groß | größer | am größten | der größte |
| alt | älter | am ältesten | der älteste |
| gut | **besser** | am **besten** | der beste |
| viel | **mehr** | am **meisten** | die meisten |
| gern | **lieber** | am **liebsten** | — |

**Vergleiche:**
- Gleich: *Er ist **so groß wie** sie.*
- Unterschied: *Er ist **größer als** sie.*`,
    exercises:[
      {q:"München ist groß, aber Berlin ist ___. (Komparativ)",a:"größer",hint:"groß → größer (Umlaut!)"},
      {q:"Er ist ___ als sein Bruder. (alt, Komparativ)",a:"älter",hint:"alt → älter (Umlaut!)"},
      {q:"Das ist das ___ Restaurant. (gut, Superlativ attributiv, neutrum)",a:"beste",hint:"gut → beste"},
      {q:"Sie singt ___ von allen. (gut, Superlativ prädikativ)",a:"am besten",hint:"gut → am besten"},
      {q:"Er isst ___ Pizza ___ Pasta. (gern, Komparativ)",a:"lieber, als",hint:"gern → lieber...als"},
    ]},
  { id:"A2.5", title:"Konjunktionen: weil, dass, wenn, als", topic:"Grammatik", explanation:`Im **Nebensatz** geht das konjugierte Verb ans **Ende**!

| Konj. | Bedeutung | Beispiel |
|---|---|---|
| **weil** | Grund | *Ich lerne, weil ich die Prüfung bestehen **will**.* |
| **dass** | Inhalt | *Ich glaube, dass er **kommt**.* |
| **wenn** | Bedingung / Wiederholung | *Wenn es regnet, bleibe ich **zu Hause**.* |
| **als** | einmaliges Ereignis (Vergangenheit) | *Als ich jung **war**, spielte ich Fußball.* |
| **ob** | indirekter Fragesatz | *Ich weiß nicht, ob er **kommt**.* |

⚠️ **wenn** = immer / Zukunft | **als** = einmalig Vergangenheit`,
    exercises:[
      {q:"Ich bleibe zu Hause, ___ es regnet. (regelmäßige Situation)",a:"wenn",hint:"regelmäßig → wenn"},
      {q:"___ ich Kind war, spielte ich viel. (einmalig, Verg.)",a:"Als",hint:"einmalig Vergangenheit → Als"},
      {q:"Er sagt, ___ er morgen kommt. (Inhalt)",a:"dass",hint:"Inhalt → dass"},
      {q:"Ich lerne, ___ ich Deutsch sprechen will. (Grund)",a:"weil",hint:"Grund → weil, Verb ans Ende"},
      {q:"Ich weiß nicht, ___ er kommt. (indirekter Fragesatz)",a:"ob",hint:"indirekte Frage → ob"},
    ]},
  { id:"A2.6", title:"Perfekt – regelmäßig & unregelmäßig", topic:"Grammatik", explanation:`**Perfekt = haben/sein + Partizip II**
→ Wird im Gespräch für vergangene Handlungen benutzt.

**Partizip II:**
| Typ | Bildung | Beispiele |
|---|---|---|
| regelmäßig | ge- + Stamm + -t | ge**macht**, ge**lernt**, ge**kauft** |
| unregelmäßig | ge- + Stamm + -en | ge**gang**en, ge**les**en, ge**schrieb**en |
| auf -ieren | Stamm + -t (kein ge-) | studiert, fotografiert |
| untrennbar | P.II ohne ge- | ver**standen**, be**sucht** |

**sein oder haben?**
- **sein:** Bewegung (gehen, fahren, fliegen, reisen) + Zustandswechsel (aufwachen, einschlafen, sterben, werden) + sein/bleiben
- **haben:** alle anderen`,
    exercises:[
      {q:"Er ___ gestern viel ___. (lernen, Perfekt)",a:"hat gelernt",hint:"haben + gelernt (regelmäßig)"},
      {q:"Sie ___ nach Paris ___. (fahren, Perfekt)",a:"ist gefahren",hint:"Bewegung → sein + gefahren"},
      {q:"Ich ___ das Buch ___. (lesen, Perfekt)",a:"habe gelesen",hint:"haben + gelesen (unregelmäßig)"},
      {q:"Er ___ Medizin ___. (studieren, Perfekt)",a:"hat studiert",hint:"auf -ieren → kein ge-: studiert"},
      {q:"Wir ___ lange ___. (schlafen, Perfekt)",a:"haben geschlafen",hint:"haben + geschlafen"},
    ]},
],
B1:[
  { id:"B1.1", title:"Präteritum – Erzählen & Schreiben", topic:"Grammatik", explanation:`**Präteritum** = Schriftsprache, Erzählen, Literatur, Nachrichten

**Regelmäßige Verben:** Stamm + -te, -test, -te, -ten, -tet, -ten
*machen → machte, kaufen → kaufte*

**Unregelmäßige Verben (Vokalwechsel):**
| Infinitiv | Präteritum | |
|---|---|---|
| sein | **war** | gehen → **ging** |
| haben | **hatte** | kommen → **kam** |
| sehen | **sah** | fahren → **fuhr** |
| lesen | **las** | schreiben → **schrieb** |
| geben | **gab** | nehmen → **nahm** |
| sprechen | **sprach** | wissen → **wusste** |

**Modalverben:** müssen→musste, können→konnte, dürfen→durfte, sollen→sollte, wollen→wollte`,
    exercises:[
      {q:"Er ___ gestern sehr müde. (sein, Prät.)",a:"war",hint:"sein → war"},
      {q:"Wir ___ das Buch. (lesen, Prät.)",a:"lasen",hint:"lesen → lasen"},
      {q:"Ich ___ nach Hause. (gehen, Prät.)",a:"ging",hint:"gehen → ging"},
      {q:"Als Kind ___ er nicht Fußball spielen. (dürfen, Prät.)",a:"durfte",hint:"dürfen → durfte"},
      {q:"Sie ___ die Geschichte. (erzählen, Prät., regelmäßig)",a:"erzählte",hint:"regelmäßig: erzählte"},
    ]},
  { id:"B1.2", title:"Adjektivdeklination", topic:"Grammatik", explanation:`Adjektive vor Nomen bekommen Endungen (3 Tabellen!).

**Nach bestimmtem Artikel (der/die/das):**
| | mask. | fem. | neutr. | Plural |
|---|---|---|---|---|
| Nom. | -**e** | -**e** | -**e** | -**en** |
| Akk. | -**en** | -**e** | -**e** | -**en** |
| Dat. | -**en** | -**en** | -**en** | -**en** |
| Gen. | -**en** | -**en** | -**en** | -**en** |

**Nach unbestimmtem Artikel (ein/eine/ein):**
| | mask. | fem. | neutr. | Plural (kein Art.) |
|---|---|---|---|---|
| Nom. | -**er** | -**e** | -**es** | -**e** |
| Akk. | -**en** | -**e** | -**es** | -**e** |
| Dat. | -**en** | -**en** | -**en** | -**en** |

**Ohne Artikel:**
| | mask. | fem. | neutr. | Plural |
|---|---|---|---|---|
| Nom. | -**er** | -**e** | -**es** | -**e** |
| Akk. | -**en** | -**e** | -**es** | -**e** |`,
    exercises:[
      {q:"Das ist ein schön___ Haus. (neutr., Nom., unbest.)",a:"es",hint:"neutr. Nom. unbest. → -es"},
      {q:"Ich sehe den alt___ Mann. (mask., Akk., best.)",a:"en",hint:"mask. Akk. best. → -en"},
      {q:"Sie trägt ein rot___ Kleid. (neutr., Akk., unbest.)",a:"es",hint:"neutr. Akk. unbest. → -es"},
      {q:"Er trinkt kalt___ Wasser. (neutr., Akk., ohne Art.)",a:"es",hint:"neutr. Akk. ohne Art. → -es"},
      {q:"Die jung___ Studenten lernen viel. (Pl., Nom., best.)",a:"en",hint:"Plural best. → immer -en"},
    ]},
  { id:"B1.3", title:"Modalverben – alle Zeiten & Bedeutungen", topic:"Grammatik", explanation:`**Präsens:** müssen, können, dürfen, sollen, wollen, mögen/möchten

| | müssen | können | dürfen | sollen | wollen |
|---|---|---|---|---|---|
| ich | muss | kann | darf | soll | will |
| du | musst | kannst | darfst | sollst | willst |
| er/sie | muss | kann | darf | soll | will |
| wir | müssen | können | dürfen | sollen | wollen |

**Bedeutungen:**
| Modalverb | Bedeutung | Beispiel |
|---|---|---|
| müssen | Notwendigkeit | *Ich muss lernen.* |
| können | Fähigkeit/Möglichkeit | *Er kann schwimmen.* |
| dürfen | Erlaubnis | *Hier darf man parken.* |
| sollen | Auftrag/Pflicht | *Du sollst kommen.* |
| wollen | Wunsch/Absicht | *Wir wollen reisen.* |
| mögen | Vorliebe | *Er mag Kaffee.* |

**Perfekt mit Ersatzinfinitiv:**
*Ich habe lernen **müssen**.* / *Er hat kommen **wollen**.*`,
    exercises:[
      {q:"Du ___ das sofort machen! (sollen, Präs.)",a:"sollst",hint:"sollen: du → sollst"},
      {q:"Als Kind ___ ich jeden Tag früh aufstehen. (müssen, Prät.)",a:"musste",hint:"müssen Prät. → musste"},
      {q:"Er ___ sehr gut kochen. (können, Prät.)",a:"konnte",hint:"können Prät. → konnte"},
      {q:"Ich habe das Buch lesen ___. (müssen, Perfekt)",a:"müssen",hint:"Perfekt Modalverb → Ersatzinfinitiv: müssen"},
      {q:"___ ich hier parken? (dürfen, Frage)",a:"Darf",hint:"dürfen ich → darf"},
    ]},
  { id:"B1.4", title:"Konnektoren & Satzbau B1", topic:"Grammatik", explanation:`**Wichtige Konnektoren für B1:**

| Konnektor | Typ | Beispiel |
|---|---|---|
| **obwohl** | Gegensatz (NS) | *Obwohl er müde **ist**, lernt er.* |
| **damit** | Zweck, versch. Subj. | *Er lernt, damit sie **besteht**.* |
| **um...zu** | Zweck, gleiches Subj. | *Er lernt, um zu **bestehen**.* |
| **nachdem** | zeitlich (danach) | *Nachdem sie gegessen **hatte**, schlief sie.* |
| **bevor** | zeitlich (davor) | *Bevor er schläft, **liest** er.* |
| **während** | gleichzeitig | *Während sie schläft, **arbeitet** er.* |
| **sobald** | sofort danach | *Sobald er kommt, **essen** wir.* |
| **seitdem** | seit einem Zeitpunkt | *Seitdem er dort wohnt, **ist** er glücklich.* |

**Zweiteilige Konnektoren:**
*sowohl...als auch* / *entweder...oder* / *nicht nur...sondern auch*`,
    exercises:[
      {q:"Er lernt, ___ die Prüfung zu bestehen. (Zweck, gleiches Subj.)",a:"um",hint:"gleiches Subjekt + Zweck → um...zu"},
      {q:"___ er müde war, arbeitete er weiter. (Gegensatz)",a:"Obwohl",hint:"Gegensatz → Obwohl, Verb ans Ende"},
      {q:"___ sie gegessen hatte, schlief sie. (zeitlich, danach)",a:"Nachdem",hint:"davor abgeschlossen → Nachdem"},
      {q:"Er lernt, ___ er täglich Vokabeln übt. (Art und Weise, B2 Vorbereitung)",a:"indem",hint:"Mittel → indem"},
      {q:"Sie spricht ___ Englisch ___ Arabisch. (beides)",a:"sowohl, als auch",hint:"beides → sowohl...als auch"},
    ]},
  { id:"B1.5", title:"Plusquamperfekt & Zeitfolge", topic:"Grammatik", explanation:`**Plusquamperfekt** (Vorvergangenheit) = hatte/war + Partizip II
→ Eine Handlung liegt VOR einer anderen Vergangenheit.

| | Präteritum | Plusquamperfekt |
|---|---|---|
| haben | hatte | hatte...gemacht |
| sein | war | war...gegangen |

**Beispiele:**
- *Nachdem er gegessen **hatte**, schlief er ein.* (erst essen, dann schlafen)
- *Als sie ankam, **war** er schon **gegangen**.* (er ging vor ihrer Ankunft)
- *Ich war müde, weil ich schlecht geschlafen **hatte**.*

**Zeitlinie:**
Plusquamperfekt → Präteritum → Präsens/Perfekt → Futur`,
    exercises:[
      {q:"Nachdem er gegessen ___, schlief er. (haben, PQP)",a:"hatte",hint:"hatte + Partizip II"},
      {q:"Als sie ankam, ___ er schon ___. (gehen, PQP)",a:"war gegangen",hint:"sein + gegangen (PQP)"},
      {q:"Ich war müde, weil ich schlecht geschlafen ___. (haben, PQP)",a:"hatte",hint:"hatte + geschlafen"},
      {q:"Bevor er ankam, ___ wir schon ___. (essen, PQP)",a:"hatten gegessen",hint:"hatten + gegessen"},
      {q:"Sie ___ die Aufgabe schon ___, als er fragte. (machen, PQP)",a:"hatte gemacht",hint:"hatte + gemacht"},
    ]},
  { id:"B1.6", title:"Passiv – Einführung", topic:"Grammatik", explanation:`Das **Vorgangspassiv** betont die Handlung, nicht die Person.
**Bildung: werden + Partizip II**

| Zeitform | Aktiv | Passiv |
|---|---|---|
| Präsens | Man liest das Buch. | Das Buch **wird gelesen**. |
| Präteritum | Man baute das Haus. | Das Haus **wurde gebaut**. |
| Perfekt | Man hat den Brief geschrieben. | Der Brief **ist geschrieben worden**. |

**Agens (wer handelt):** *von + Dativ*
*Das Buch wird **von der Lehrerin** erklärt.*

**Zustandspassiv:** sein + Partizip II (Ergebnis, kein Vorgang)
*Die Tür ist geschlossen.* (Zustand) vs. *Die Tür wird geschlossen.* (Vorgang)`,
    exercises:[
      {q:"Das Buch ___ gerade ___. (lesen, Präs. Passiv)",a:"wird gelesen",hint:"wird + Partizip II"},
      {q:"Das Haus ___ 1900 ___. (bauen, Prät. Passiv)",a:"wurde gebaut",hint:"wurde + gebaut"},
      {q:"Der Brief ___ von ihr ___. (schreiben, Perfekt Passiv)",a:"ist geschrieben worden",hint:"ist + geschrieben + worden"},
      {q:"Das Essen ___ von ihm ___. (kochen, Präs. Passiv)",a:"wird gekocht",hint:"wird + gekocht"},
      {q:"Die Tür ___. (öffnen – Zustandspassiv: Ergebnis)",a:"ist geöffnet",hint:"Zustandspassiv: sein + Partizip II"},
    ]},
],
B2:[
  { id:"B2.1", title:"Konjunktiv II – Vollständig", topic:"Grammatik", explanation:`**Konjunktiv II** = nicht reale Situationen: Wünsche, Hypothesen, höfliche Bitten

**Bildung:**
| | haben | sein | werden | können | müssen |
|---|---|---|---|---|---|
| ich | **hätte** | **wäre** | würde | könnte | müsste |
| du | hättest | wärst | würdest | könntest | müsstest |
| er/sie | hätte | wäre | würde | könnte | müsste |
| wir | hätten | wären | würden | könnten | müssten |

**Andere Verben:** würde + Infinitiv (Standard)
*Ich würde gerne reisen. / Er würde mehr schlafen.*

**Ausnahmen (K.II direkt):**
haben→hätte, sein→wäre, werden→würde, alle Modalverben

**Anwendungen:**
| | Beispiel |
|---|---|
| Irreale Bedingung | *Wenn ich Zeit **hätte**, **würde** ich reisen.* |
| Wunsch | *Ich wünschte, ich **wäre** reich.* |
| Höfliche Bitte | ***Könnten** Sie mir helfen?* |
| Ratschlag | *An deiner Stelle **würde** ich...* |
| Irreale Folge | *Wenn er fleißiger wäre, **hätte** er bestanden.* |`,
    exercises:[
      {q:"Wenn ich mehr Geld ___, ___ ich ein Auto kaufen.",a:"hätte, würde",hint:"haben→hätte / würde+Inf."},
      {q:"___ Sie mir bitte helfen? (höflich)",a:"Könnten",hint:"können K.II → könnte"},
      {q:"Ich wünschte, ich ___ mehr Zeit.",a:"hätte",hint:"haben K.II → hätte"},
      {q:"An deiner Stelle ___ ich mehr schlafen.",a:"würde",hint:"Ratschlag → würde + Inf."},
      {q:"Wenn er fleißiger ___, ___ er bestanden.",a:"wäre, hätte",hint:"sein→wäre / haben K.II→hätte"},
    ]},
  { id:"B2.2", title:"Passiv – alle Formen & Modalpassiv", topic:"Grammatik", explanation:`**Vorgangspassiv:** werden + P.II
**Zustandspassiv:** sein + P.II

| Zeitform | Vorgangspassiv |
|---|---|
| Präsens | wird gebaut |
| Präteritum | wurde gebaut |
| Perfekt | ist gebaut worden |
| Futur I | wird gebaut werden |
| K. II | würde gebaut werden |

**Passiv mit Modalverben:**
| Modalverb | Formel | Beispiel |
|---|---|---|
| müssen | muss + P.II + werden | *Das muss erledigt werden.* |
| können | kann + P.II + werden | *Das kann geändert werden.* |
| sollen | soll + P.II + werden | *Das soll verbessert werden.* |
| dürfen | darf + P.II + werden | *Hier darf nicht geraucht werden.* |

**Unpersönliches Passiv:** (ohne Subjekt)
*Es wird hier viel gearbeitet.* / *Hier wird getanzt.*`,
    exercises:[
      {q:"Die Pizza ___ von ihm ___. (essen, Präs. Passiv)",a:"wird gegessen",hint:"wird + P.II"},
      {q:"Das muss sofort erledigt ___. (Modalpassiv)",a:"werden",hint:"muss + P.II + werden"},
      {q:"Das Haus ___ letztes Jahr gebaut ___. (Perfekt Passiv)",a:"ist, worden",hint:"ist + gebaut + worden"},
      {q:"Hier ___ nicht geraucht ___. (dürfen + Passiv)",a:"darf, werden",hint:"darf + geraucht + werden"},
      {q:"___ wird hier viel ___. (unpersönl. Passiv: arbeiten)",a:"Es, gearbeitet",hint:"Es wird + gearbeitet"},
    ]},
  { id:"B2.3", title:"Relativsätze – alle Fälle & Präpositionen", topic:"Grammatik", explanation:`Das Relativpronomen richtet sich nach: **Genus/Numerus des Bezugsnomens** + **Kasus im Relativsatz**

| Fall | Mask. | Fem. | Neutr. | Plural |
|---|---|---|---|---|
| **Nom.** | der | die | das | die |
| **Akk.** | den | die | das | die |
| **Dat.** | dem | der | dem | denen |
| **Gen.** | dessen | deren | dessen | deren |

**Mit Präpositionen:** Präp. + Relativpronomen
*Die Stadt, **in der** ich lebe, ist schön.* (in + Dativ, fem.)
*Der Mann, **mit dem** ich sprach, war nett.* (mit + Dativ, mask.)
*Das Thema, **über das** wir reden,* (über + Akk., neutr.)

**Relativsatz mit "wo":** bei Orten
*Das Haus, **wo** (=in dem) ich wohne,...*

**Genitivrelativsatz:**
*Der Autor, **dessen** Buch ich lese,...* (mask.)
*Die Frau, **deren** Tochter ich kenne,...* (fem.)`,
    exercises:[
      {q:"Die Stadt, in ___ ich lebe, ist schön. (Dat., fem.)",a:"der",hint:"Dativ feminin → der"},
      {q:"Der Mann, ___ Auto gestohlen wurde. (Gen., mask.)",a:"dessen",hint:"Genitiv maskulin → dessen"},
      {q:"Die Studenten, ___ ich geholfen habe. (Dat., Plural)",a:"denen",hint:"Dativ Plural → denen"},
      {q:"Das Thema, über ___ wir reden, ist wichtig. (Akk., neutr.)",a:"das",hint:"über + Akkusativ, neutrum → das"},
      {q:"Die Frau, ___ Tochter ich kenne. (Gen., fem.)",a:"deren",hint:"Genitiv feminin → deren"},
    ]},
  { id:"B2.4", title:"Infinitivkonstruktionen & fortgeschrittene Konnektoren", topic:"Grammatik", explanation:`**Infinitivkonstruktionen (gleiches Subjekt!):**
| Konstruktion | Bedeutung | Beispiel |
|---|---|---|
| **um...zu** | Zweck | *Er lernt, um zu bestehen.* |
| **ohne...zu** | ohne Begleitumstand | *Sie ging, ohne sich zu verabschieden.* |
| **anstatt...zu** | Alternative | *Anstatt zu schlafen, lernte er.* |

⚠️ Verschiedene Subjekte → **damit / obwohl / weil**

**Fortgeschrittene Konnektoren B2:**
| Konnektor | Bedeutung | Beispiel |
|---|---|---|
| **trotzdem/dennoch** | Gegensatz (HS) | *Es regnete. Dennoch gingen wir.* |
| **sodass** | Folge | *Er lernte viel, sodass er bestand.* |
| **indem** | Mittel/Weg | *Er lernte, indem er schrieb.* |
| **sowohl...als auch** | Addition | *sowohl Deutsch als auch Arabisch* |
| **weder...noch** | totale Verneinung | *Er ist weder groß noch klein.* |
| **je...desto** | Proportion | *Je mehr er lernt, desto besser wird er.* |`,
    exercises:[
      {q:"Er spart, ___ ein Auto ___ kaufen.",a:"um, zu",hint:"Zweck, gleiches Subj. → um...zu"},
      {q:"Sie ging, ___ sich ___ verabschieden.",a:"ohne, zu",hint:"ohne Begleitumstand → ohne...zu"},
      {q:"Er ist ___ müde ___ hungrig.",a:"weder, noch",hint:"totale Verneinung → weder...noch"},
      {q:"___ mehr er lernt, ___ besser wird er.",a:"Je, desto",hint:"Proportion → je...desto"},
      {q:"Er lernte, ___ er täglich Texte schrieb.",a:"indem",hint:"Mittel → indem"},
    ]},
  { id:"B2.5", title:"Präpositionen mit Genitiv & Präpositionaladverbien", topic:"Grammatik", explanation:`**Genitiv-Präpositionen (formell!):**
| Präposition | Bedeutung | Beispiel |
|---|---|---|
| **wegen** | Grund | *Wegen des Regens blieb er zu Hause.* |
| **trotz** | Gegensatz | *Trotz der Müdigkeit lernte sie.* |
| **während** | zeitlich | *Während des Unterrichts.* |
| **aufgrund** | Grund (formell) | *Aufgrund des Unfalls gab es Stau.* |
| **innerhalb** | innen | *Innerhalb einer Woche.* |
| **außerhalb** | außen | *Außerhalb der Stadt.* |
| **statt/anstatt** | Alternative | *Statt des Autos nahm er den Bus.* |

**Präpositionaladverbien (da-/wo-):**
Ersetzen Präp. + Pronomen bei **Sachen/Ideen** (nicht Personen!)
| Ersetzt | Pronominaladverb |
|---|---|
| auf es → | **darauf** |
| mit ihm (Sache) → | **damit** |
| über es → | **darüber** |
| für es → | **dafür** |
| *Frage:* Worüber? Womit? Wofür? | |`,
    exercises:[
      {q:"___ des schlechten Wetters blieben wir zu Hause. (Grund, formal)",a:"Aufgrund",hint:"Grund formell → Aufgrund + Genitiv"},
      {q:"___ aller Bemühungen scheiterte es. (Gegensatz, Genitiv)",a:"Trotz",hint:"Gegensatz + Genitiv → Trotz"},
      {q:"Er freut sich auf das Geschenk. → Er freut sich ___.",a:"darauf",hint:"auf + es (Sache) → darauf"},
      {q:"Sie spricht über das Problem. → Sie spricht ___.",a:"darüber",hint:"über + es → darüber"},
      {q:"___ wartest du? – Auf den Bus. (Frage nach Sache)",a:"Worauf",hint:"Frage: wo + auf = worauf"},
    ]},
  { id:"B2.6", title:"Nominalisierung & Verbalstil ↔ Nominalstil", topic:"Schreiben", explanation:`**Nominalstil** = formeller, akademischer Stil (typisch für B2/C1-Texte)

**Verb → Nomen:**
| Verb | Nomen | Genus |
|---|---|---|
| entscheiden | die Entscheidung | f |
| entwickeln | die Entwicklung | f |
| zunehmen | die Zunahme | f |
| lösen | die Lösung | f |
| verändern | die Veränderung | f |
| abhängen | die Abhängigkeit | f |
| steigen | der Anstieg | m |
| sinken | der Rückgang | m |
| verbessern | die Verbesserung | f |

**Umformung:**
| Verbalstil | Nominalstil |
|---|---|
| *Man muss das Problem lösen.* | *Die **Lösung** des Problems ist nötig.* |
| *Die Preise steigen stark.* | *Ein starker **Anstieg** der Preise...* |
| *Er hat entschieden.* | *Seine **Entscheidung**...* |`,
    exercises:[
      {q:"entscheiden → die ___",a:"Entscheidung",hint:"entscheiden → die Entscheidung"},
      {q:"entwickeln → die ___",a:"Entwicklung",hint:"entwickeln → die Entwicklung"},
      {q:"'Man muss das Problem lösen.' → 'Die ___ des Problems ist nötig.'",a:"Lösung",hint:"lösen → die Lösung"},
      {q:"steigen → der ___",a:"Anstieg",hint:"steigen → der Anstieg"},
      {q:"verbessern → die ___",a:"Verbesserung",hint:"verbessern → die Verbesserung"},
    ]},
],
C1:[
  { id:"C1.1", title:"Konjunktiv I – Indirekte Rede", topic:"Grammatik", explanation:`**Konjunktiv I** = indirekte Rede in **Schriftsprache** (Journalismus, Wissenschaft, Berichte)

**Bildung:** Infinitivstamm + Endungen
| | haben | sein | kommen | sagen | gehen |
|---|---|---|---|---|---|
| ich | habe | sei | komme | sage | gehe |
| du | habest | sei(e)st | kommest | sagest | gehest |
| **er/sie/es** | **habe** | **sei** | **komme** | **sage** | **gehe** |
| wir | haben ⚠️ | seien | kommen ⚠️ | sagen ⚠️ | gehen ⚠️ |
| sie/Sie | haben ⚠️ | seien | kommen ⚠️ | sagen ⚠️ | gehen ⚠️ |

⚠️ = K.I = Indikativ → K.II verwenden!
*sie kommen* (Indikativ) = *sie kommen* (K.I) → *sie kämen* (K.II stattdessen)

**Umformung:**
| Direkte Rede | Indirekte Rede |
|---|---|
| „Ich **bin** krank." | Er sagt, er **sei** krank. |
| „Ich **habe** Zeit." | Sie sagt, sie **habe** Zeit. |
| „Wir **kommen**." | Sie sagten, sie **kämen**. (K.II!) |
| „Er **hat** das gemacht." | Sie sagt, er **habe** das gemacht. |`,
    exercises:[
      {q:"'Ich bin krank.' → Er sagt, er ___ krank. (K.I)",a:"sei",hint:"sein K.I, 3.P.Sg. → sei"},
      {q:"'Ich habe Zeit.' → Sie sagt, sie ___ Zeit. (K.I)",a:"habe",hint:"haben K.I, 3.P.Sg. → habe"},
      {q:"'Wir kommen.' → Sie sagten, sie ___. (K.I=Indikativ → K.II!)",a:"kämen",hint:"kommen K.I Pl. = Indikativ → K.II: kämen"},
      {q:"'Er weiß das.' → Sie sagt, er ___ das. (K.I von wissen)",a:"wisse",hint:"wissen K.I → wisse"},
      {q:"'Sie haben gewonnen.' → Er berichtet, sie ___ gewonnen. (haben K.I)",a:"hätten",hint:"haben K.I Pl. = Indikativ → K.II: hätten"},
    ]},
  { id:"C1.2", title:"Erweiterte Partizipialkonstruktionen", topic:"Grammatik", explanation:`Ersatz für Relativsätze – typisch für C1-Schrift- und Akademiksprache.

**Partizip I** (gleichzeitig, aktiv) = Infinitiv + **d** + Adjektivendung
*das singende Kind* = das Kind, das singt
*der laufende Motor* = der Motor, der läuft

**Partizip II** (abgeschlossen, passiv) = P.II + Adjektivendung
*das gelesene Buch* = das Buch, das gelesen wurde
*der veröffentlichte Bericht* = der Bericht, der veröffentlicht wurde

**Erweitertes Partizipialattribut:**
Artikel + [komplette Erweiterung] + Partizip + Nomen

*Die **von allen Studenten täglich genutzte** Bibliothek...*
= Die Bibliothek, die von allen Studenten täglich genutzt wird

*Das **im Jahr 1900 von einem berühmten Architekten erbaute** Gebäude...*
= Das Gebäude, das im Jahr 1900 von einem berühmten Architekten erbaut wurde`,
    exercises:[
      {q:"das Kind, das singt → das ___ Kind",a:"singende",hint:"singen + d + e → singende"},
      {q:"das Buch, das geschrieben wurde → das ___ Buch",a:"geschriebene",hint:"geschrieben + e → geschriebene"},
      {q:"der Bericht, der veröffentlicht wurde → der ___ Bericht",a:"veröffentlichte",hint:"veröffentlicht + e → veröffentlichte"},
      {q:"die Frau, die lächelt → die ___ Frau",a:"lächelnde",hint:"lächeln + d + e → lächelnde"},
      {q:"das Gesetz, das geändert wurde → das ___ Gesetz",a:"geänderte",hint:"geändert + e → geänderte"},
    ]},
  { id:"C1.3", title:"Nominalstil C1 & Funktionsverbgefüge", topic:"Schreiben", explanation:`**Erweiterter Nominalstil:**
| Verb | Nomen | Verwendung |
|---|---|---|
| entscheiden | die Entscheidung | *eine Entscheidung treffen* |
| zunehmen | die Zunahme | *eine Zunahme verzeichnen* |
| lösen | die Lösung | *eine Lösung finden* |
| einführen | die Einführung | *die Einführung von...* |
| analysieren | die Analyse | *eine Analyse durchführen* |
| berücksichtigen | die Berücksichtigung | *unter Berücksichtigung von...* |

**Funktionsverbgefüge (FVG):**
Verb hat wenig Bedeutung, Nomen trägt die Bedeutung
| FVG | Bedeutung | Statt... |
|---|---|---|
| *eine Entscheidung treffen* | entscheiden | entscheiden |
| *in Frage stellen* | bezweifeln | bezweifeln |
| *zur Verfügung stehen* | verfügbar sein | verfügbar sein |
| *Berücksichtigung finden* | berücksichtigt werden | berücksichtigt werden |
| *in Betracht ziehen* | erwägen | erwägen |`,
    exercises:[
      {q:"einführen → die ___",a:"Einführung",hint:"einführen → die Einführung"},
      {q:"analysieren → die ___",a:"Analyse",hint:"analysieren → die Analyse"},
      {q:"'Er erwägt das.' → FVG: Er zieht das ___ ___.",a:"in Betracht",hint:"erwägen → in Betracht ziehen"},
      {q:"'Das steht zur Verfügung.' FVG für: verfügbar ___",a:"sein",hint:"zur Verfügung stehen = verfügbar sein"},
      {q:"berücksichtigen → die ___",a:"Berücksichtigung",hint:"berücksichtigen → die Berücksichtigung"},
    ]},
  { id:"C1.4", title:"Fortgeschrittene Konnektoren & Syntax C1", topic:"Grammatik", explanation:`**Genitiv-Präpositionen C1:**
| Präp. | Bedeutung | Beispiel |
|---|---|---|
| **angesichts** | angesichts | *Angesichts der Lage...* |
| **infolge** | als Folge von | *Infolge des Sturms...* |
| **hinsichtlich** | bezüglich | *Hinsichtlich der Kosten...* |
| **mangels** | aus Mangel an | *Mangels Beweisen...* |
| **unbeschadet** | ohne Einschränkung | *Unbeschadet dessen...* |

**Fortgeschrittene Konnektoren:**
| Konnektor | Bedeutung | Beispiel |
|---|---|---|
| **zumal** | besonders weil | *Er ist müde, zumal er nicht schlief.* |
| **wohingegen** | im Gegensatz | *Er arbeitet viel, wohingegen sie wenig tut.* |
| **sofern** | wenn/falls (formal) | *Sofern du möchtest, kannst du kommen.* |
| **geschweige denn** | nicht einmal | *Er kann nicht kochen, geschweige denn backen.* |
| **insofern...als** | in dem Maße | *Das ist insofern wichtig, als es...* |`,
    exercises:[
      {q:"___ aller Bemühungen scheiterte das Projekt. (Genitiv, Gegensatz)",a:"Trotz",hint:"Gegensatz + Genitiv → Trotz"},
      {q:"___ der steigenden Preise leiden viele. (angesichts)",a:"Angesichts",hint:"Angesichts + Genitiv"},
      {q:"Er kann nicht Englisch, ___ Deutsch. (nicht einmal)",a:"geschweige denn",hint:"nicht einmal → geschweige denn"},
      {q:"Er arbeitet viel, ___ sie wenig tut. (Gegensatz im HS)",a:"wohingegen",hint:"Gegensatz Hauptsatz → wohingegen"},
      {q:"___ Beweisen wurde er freigelassen. (aus Mangel an)",a:"Mangels",hint:"aus Mangel an → Mangels + Genitiv"},
    ]},
  { id:"C1.5", title:"Modalpartikeln & Register", topic:"Kommunikation", explanation:`**Modalpartikeln** geben der Aussage eine emotionale/soziale Nuance.

| Partikel | Bedeutung | Beispiel |
|---|---|---|
| **doch** | Bestätigung/Überraschung | *Das ist doch seltsam!* |
| **ja** | Offensichtlichkeit | *Er ist ja müde.* (wie du weißt) |
| **halt/eben** | Unvermeidbarkeit | *Das ist halt/eben so.* |
| **eigentlich** | Einschränkung | *Eigentlich sollte er kommen.* |
| **mal** | Aufforderung mildern | *Kannst du mal kommen?* |
| **wohl** | Vermutung | *Er ist wohl krank.* |
| **schon** | Bestätigung/Einräumung | *Das stimmt schon, aber...* |
| **bloß** | Warnung/Verstärkung | *Komm bloß nicht zu spät!* |

**Register:**
- **Umgangssprache:** kurze Sätze, Modalpartikeln, Ellipsen
- **Standardsprache:** vollständige Sätze, korrekte Grammatik
- **Formelle Sprache:** Nominalstil, Passiv, komplexe Syntax`,
    exercises:[
      {q:"Das ist ___ interessant! (Offensichtlichkeit – ich weiß das schon)",a:"ja",hint:"Offensichtlichkeit → ja"},
      {q:"Kannst du ___ kurz kommen? (Aufforderung mildern)",a:"mal",hint:"Aufforderung mildern → mal"},
      {q:"Er ist ___ krank. (Vermutung – ich bin nicht sicher)",a:"wohl",hint:"Vermutung → wohl"},
      {q:"Das ist ___ so. (Unvermeidbarkeit/Schicksal)",a:"halt",hint:"Unvermeidbarkeit → halt/eben"},
      {q:"Das stimmt ___, aber... (Einräumung)",a:"schon",hint:"Einräumung → schon"},
    ]},
  { id:"C1.6", title:"Wissenschaftlicher Schreibstil C1", topic:"Schreiben", explanation:`**Typische Ausdrücke für C1-Texte:**

**Einleitung:**
- *Im Folgenden wird... untersucht/analysiert/dargestellt.*
- *Gegenstand dieser Betrachtung ist...*
- *Zunächst soll... erörtert werden.*

**Hauptteil – Argumente:**
- *Einerseits... andererseits...*
- *Im Gegensatz dazu / Demgegenüber steht...*
- *Darüber hinaus ist zu beachten, dass...*
- *Dies lässt sich dadurch erklären, dass...*
- *Infolgedessen / Folglich...*

**Schluss:**
- *Zusammenfassend lässt sich sagen, dass...*
- *Abschließend kann festgestellt werden, dass...*
- *Alles in allem...*

**Typische C1-Phrasen:**
| Einfach | C1-Niveau |
|---|---|
| weil | infolgedessen / aufgrund der Tatsache, dass |
| aber | wohingegen / demgegenüber |
| zum Beispiel | exemplarisch sei hier... erwähnt |
| sehr wichtig | von zentraler Bedeutung |`,
    exercises:[
      {q:"Einleitungssatz: '___  Folgenden wird das Thema untersucht.'",a:"Im",hint:"Im Folgenden = typische Einleitung"},
      {q:"Schluss: 'Zusammenfassend ___ sich sagen, dass...'",a:"lässt",hint:"Zusammenfassend lässt sich sagen"},
      {q:"'Das ist sehr wichtig.' → C1: Das ist von zentraler ___.",a:"Bedeutung",hint:"sehr wichtig → von zentraler Bedeutung"},
      {q:"'weil' → formal: ___ der Tatsache, dass...",a:"aufgrund",hint:"weil formell → aufgrund der Tatsache, dass"},
      {q:"Schluss: '___ in allem lässt sich sagen...'",a:"Alles",hint:"Alles in allem = typischer Schlussausdruck"},
    ]},
],
};

// ── EXAM QUESTIONS per level & difficulty ─────────────────────
const EXAMS = {
A1:{
  easy:[
    {q:"___ Buch liegt auf dem Tisch.",opts:["Der","Die","Das","Den"],a:2},
    {q:"Ich ___ aus Deutschland.",opts:["bin","bist","ist","sind"],a:0},
    {q:"Sie ___ zwei Kinder.",opts:["hat","habe","haben","habt"],a:0},
    {q:"Wie ___ du? – Ich heiße Thomas.",opts:["heißt","heiße","heißen","heißt"],a:0},
    {q:"___ Frau heißt Maria.",opts:["Der","Das","Die","Den"],a:2},
    {q:"___ kommst du? – Aus Marokko.",opts:["Wo","Wohin","Woher","Wann"],a:2},
    {q:"Ich habe ___ Zeit. (Verneinung)",opts:["kein","keine","nicht","nein"],a:1},
    {q:"Wir ___ Hunger.",opts:["hat","habe","haben","habt"],a:2},
    {q:"Das ist ___ Tisch. (mask., unbest.)",opts:["eine","ein","einer","einem"],a:1},
    {q:"Er arbeitet ___. (Verneinung)",opts:["kein","keine","nicht","nein"],a:2},
  ],
  medium:[
    {q:"___ Buch liegt auf dem Tisch.",opts:["Der","Die","Das","Den"],a:2},
    {q:"Ich habe ___ Auto. (mask., Verneinung)",opts:["kein","keine","nicht","nein"],a:0},
    {q:"Wir ___ seit 2 Jahren hier. (sein)",opts:["sind","haben","ist","seid"],a:0},
    {q:"Das ist ___ Katze. (fem., unbest.)",opts:["ein","eine","einer","einem"],a:1},
    {q:"___ wohnst du? – In Berlin.",opts:["Woher","Wohin","Wo","Wann"],a:2},
    {q:"Er ___ keinen Hunger. (haben)",opts:["hat","habe","haben","habt"],a:0},
    {q:"Wie viel ___ das Buch? – 10 Euro.",opts:["kostet","kosten","kostete","kostest"],a:0},
    {q:"Ich sehe ___ Mann. (mask., Akk., best.)",opts:["der","den","dem","des"],a:1},
    {q:"Du ___ sehr gut Deutsch. (sprechen)",opts:["sprecht","sprichst","sprechen","sprich"],a:1},
    {q:"___ ist das? – Das ist mein Bruder.",opts:["Was","Wo","Wer","Wie"],a:2},
    {q:"Das Buch ___ meiner Schwester. (gehören)",opts:["gehört","gehöre","gehören","gehörst"],a:0},
    {q:"Ich habe ___ Bruder und ___ Schwester.",opts:["ein/eine","einen/eine","ein/ein","einen/einen"],a:1},
  ],
  hard:[
    {q:"Ich sehe ___ Mann und ___ Frau. (Akk.)",opts:["den/die","der/die","den/der","dem/die"],a:0},
    {q:"___ gehört das Buch? – Meiner Mutter.",opts:["Wem","Wen","Wer","Was"],a:0},
    {q:"Er ___ Arzt ___ werden. (wollen/Infinitiv)",opts:["will werden","wollen wird","will/werden","wills werden"],a:0},
    {q:"Das ist ___ Haus ___ meiner Mutter.",opts:["das/von","das/von","den/von","das/für"],a:0},
    {q:"Wie heißt du? → ___ ist dein Name?",opts:["Wie","Was","Wer","Welch"],a:1},
    {q:"Er ___ heute nicht, ___ er krank ist.",opts:["kommt/weil","kommen/weil","kommt/dass","kommt/wenn"],a:0},
    {q:"Das Mädchen ___ sehr nett. (sein, 3.P.Sg.)",opts:["ist","sind","bist","seid"],a:0},
    {q:"Ich habe ___ Hunger ___ Durst. (weder...noch)",opts:["weder/noch","nicht/kein","kein/keine","weder/oder"],a:0},
    {q:"___ fährt der Bus ab? – Um 8 Uhr.",opts:["Wann","Wo","Wohin","Woher"],a:0},
    {q:"Sie ___ jetzt in der Schule. (sein)",opts:["sind","ist","bin","bist"],a:1},
    {q:"Ich kaufe das Buch ___ meinen Bruder. (für)",opts:["für","mit","bei","zu"],a:0},
    {q:"halb neun = ___ Uhr.",opts:["8:30","9:30","8:45","9:00"],a:0},
  ],
  expert:[
    {q:"Ich sehe ___ alten Mann ___ der kleinen Frau. (Akk. + neben + Dat.)",opts:["den/neben","der/neben","den/mit","dem/neben"],a:0},
    {q:"Wessen Buch ist das? – Das ist ___ Bruders Buch.",opts:["mein","meines","meinem","meine"],a:1},
    {q:"Er will, ___ ich ihm helfe. (Nebensatz)",opts:["weil","dass","ob","wenn"],a:1},
    {q:"Die Studentin, ___ ich geholfen habe, heißt Anna.",opts:["die","der","den","das"],a:1},
    {q:"Gestern ___ ich ins Kino ___. (gehen, Perfekt)",opts:["bin/gegangen","habe/gegangen","bin/gehen","habe/gehen"],a:0},
    {q:"___ interessierst du dich? – Für Musik.",opts:["Wofür","Womit","Worüber","Worum"],a:0},
    {q:"Das Buch ___ von Maria ___. (schreiben, Prät. Passiv)",opts:["wurde/geschrieben","wird/geschrieben","war/geschrieben","wurde/schreiben"],a:0},
    {q:"Er spricht ___ Deutsch ___ Arabisch.",opts:["sowohl/als auch","entweder/oder","weder/noch","nicht/sondern"],a:0},
    {q:"___ dem Kurs darf man nicht sprechen. (zeitlich, Genitiv)",opts:["Wegen","Trotz","Während","Außerhalb"],a:2},
    {q:"Sie ___ sehr gut, ___ sie täglich übt.",opts:["spricht/weil","sprechen/weil","spricht/dass","spricht/obwohl"],a:0},
    {q:"Das ist der Mann, ___ Auto vor meinem Haus parkt.",opts:["dessen","deren","dem","der"],a:0},
    {q:"Wenn er mehr lernte, ___ er die Prüfung bestehen. (K.II)",opts:["würde","wird","hat","wäre"],a:0},
  ],
},
A2:{
  easy:[
    {q:"Ich sehe ___ Mann. (Akk., mask.)",opts:["der","den","dem","des"],a:1},
    {q:"Er hilft ___ Frau. (Dat., fem.)",opts:["die","der","den","das"],a:1},
    {q:"Das Buch liegt ___ dem Tisch.",opts:["auf","in","an","nach"],a:0},
    {q:"Sie fährt ___ München. (Stadt)",opts:["in","zu","nach","von"],a:2},
    {q:"Ich ___ die Tür ___. (aufmachen)",opts:["mache/auf","machen/auf","macht/auf","mache/oben"],a:0},
    {q:"Berlin ist groß, Hamburg ist ___.",opts:["größer","am größten","groß","am große"],a:0},
    {q:"Ich komme ___ Deutschland.",opts:["nach","aus","von","zu"],a:1},
    {q:"Er hat sie gestern ___. (anrufen, Perfekt)",opts:["angerufen","gerufen an","angeruft","geruft an"],a:0},
    {q:"Das Kind spielt ___ dem Garten.",opts:["in","ins","im","an"],a:2},
    {q:"Sie wohnt ___ ihrer Mutter.",opts:["bei","mit","zu","an"],a:0},
  ],
  medium:[
    {q:"Ich sehe den alt___ Mann. (Akk., best.)",opts:["e","er","em","en"],a:3},
    {q:"Das ist ein schön___ Haus. (neutr., unbest.)",opts:["e","er","es","en"],a:2},
    {q:"Er ist ___ als sein Bruder. (alt, Komp.)",opts:["alterer","älter","ältere","am ältesten"],a:1},
    {q:"Sie ist ___ von allen. (gut, Superlativ)",opts:["gut","besser","am besten","die beste"],a:2},
    {q:"Ich bleibe zu Hause, ___ es regnet.",opts:["als","wenn","weil","dass"],a:1},
    {q:"___ ich jung war, spielte ich Fußball.",opts:["Wenn","Als","Weil","Dass"],a:1},
    {q:"Er sagt, ___ er morgen kommt.",opts:["weil","als","dass","ob"],a:2},
    {q:"Sie ___ um 8 Uhr aufgestanden. (Perfekt)",opts:["hat","ist","hatte","war"],a:1},
    {q:"Er hat das Buch ___. (lesen, Perfekt)",opts:["gelesen","gelesenen","las","gelest"],a:0},
    {q:"Ich gehe ___ Supermarkt. (in + Akk.)",opts:["im","in die","in den","ins"],a:2},
    {q:"Sie fährt ___ die Türkei. (Richtung)",opts:["nach","in","in die","zu"],a:2},
    {q:"Er ___ gestern viel ___. (lernen, Perfekt)",opts:["hat/gelernt","ist/gelernt","hat/lern","ist/lernt"],a:0},
  ],
  hard:[
    {q:"Das ist ein intelligent___ Student. (mask., Nom., unbest.)",opts:["e","er","es","en"],a:1},
    {q:"Sie hilft dem klein___ Kind. (neutr., Dat., best.)",opts:["e","er","em","en"],a:3},
    {q:"Ich kaufe frisch___ Brot. (neutr., Akk., ohne Art.)",opts:["es","e","er","en"],a:0},
    {q:"Nachdem er gegessen ___, schlief er. (PQP)",opts:["hat","hatte","ist","war"],a:1},
    {q:"Als sie ankam, ___ er schon ___. (gehen, PQP)",opts:["ist/gegangen","war/gegangen","hat/gegangen","hatte/gegangen"],a:1},
    {q:"Er ___ sehr gut kochen. (können, Präteritum)",opts:["kann","könnte","konnte","konnen"],a:2},
    {q:"Als Kind ___ er nicht fernsehen. (dürfen, Prät.)",opts:["durfte","darf","dürfte","durfen"],a:0},
    {q:"Ich lerne, ___ ich die Prüfung bestehe. (Zweck, versch. Subj.)",opts:["dass","damit","weil","obwohl"],a:1},
    {q:"___ er müde war, arbeitete er weiter.",opts:["Weil","Als","Obwohl","Damit"],a:2},
    {q:"Sie hat das Buch lesen ___. (Ersatzinfinitiv)",opts:["gemüsst","müssen","musste","gemusst"],a:1},
    {q:"Das Mädchen ___ den ganzen Tag. (schlafen, Prät.)",opts:["schliefen","schlief","schläft","schlaf"],a:1},
    {q:"Ich bin um 7 Uhr ___. (aufstehen, Perfekt)",opts:["aufgestanden","aufgestandenen","gestanden auf","aufgestanden"],a:0},
  ],
  expert:[
    {q:"Der ___ Mann sprach mit dem jung___ Studenten. (alt/jung, mask.)",opts:["alten/jungen","alte/junge","alter/junger","altem/jungem"],a:0},
    {q:"Sie half dem klein___ Kind mit sein___ Hausaufgaben.",opts:["kleinen/seinen","kleine/seine","kleinem/seinem","kleinen/seinem"],a:3},
    {q:"Trotz ___ schlechten Wetters gingen wir spazieren.",opts:["dem","das","des","der"],a:2},
    {q:"Das Buch, ___ auf dem Tisch liegt, gehört mir.",opts:["das","der","dem","den"],a:0},
    {q:"___ dem Bericht zufolge stiegen die Preise. (laut)",opts:["Laut","Nach","Gemäß","Zufolge"],a:0},
    {q:"Er hat nie Deutsch gelernt, ___ er fließend spricht.",opts:["obwohl","weil","damit","sodass"],a:0},
    {q:"Je mehr er lernt, ___ besser wird er.",opts:["desto","umso mehr","so","deshalb"],a:0},
    {q:"Ich freue mich ___. (auf das Konzert → Pronominaladverb)",opts:["daran","darauf","davon","dabei"],a:1},
    {q:"Das Problem muss sofort gelöst ___.",opts:["sein","werden","worden","geworden"],a:1},
    {q:"Nachdem sie ___ gegessen hatte, schlief sie ein.",opts:["schon","noch","erst","gleich"],a:0},
    {q:"Er ist ___ müde ___ hungrig. (keines von beiden)",opts:["entweder/oder","sowohl/als auch","weder/noch","nicht/sondern"],a:2},
    {q:"___ der steigenden Preise leiden viele Familien.",opts:["Wegen","Trotz","Aufgrund","Während"],a:2},
  ],
},
B1:{
  easy:[
    {q:"Er ___ gestern viel gelernt.",opts:["hat","ist","hatte","war"],a:0},
    {q:"Sie ___ um 8 Uhr aufgestanden.",opts:["hat","ist","hatte","war"],a:1},
    {q:"Ich bleibe zu Hause, ___ es regnet.",opts:["als","wenn","weil","dass"],a:1},
    {q:"___ ich jung war, spielte ich Fußball.",opts:["Wenn","Als","Weil","Dass"],a:1},
    {q:"Als Kind ___ er nicht fernsehen. (dürfen, Prät.)",opts:["durfte","darf","dürfte","durfen"],a:0},
    {q:"Er sagt, ___ er morgen kommt.",opts:["weil","als","dass","ob"],a:2},
    {q:"Das ist ein schön___ Auto. (neutr., unbest.)",opts:["e","er","es","en"],a:2},
    {q:"Er ___ sehr gut Deutsch sprechen. (können, Prät.)",opts:["kann","könnte","konnte","konnen"],a:2},
    {q:"Ich lerne, ___ ich die Prüfung bestehe.",opts:["dass","damit","weil","obwohl"],a:1},
    {q:"___ er müde war, arbeitete er weiter.",opts:["Weil","Als","Obwohl","Damit"],a:2},
  ],
  medium:[
    {q:"Ich sehe den alt___ Mann.",opts:["e","er","em","en"],a:3},
    {q:"Nachdem er gegessen ___, schlief er. (PQP)",opts:["hat","hatte","ist","war"],a:1},
    {q:"Er ___ das Buch lesen ___. (müssen, Perfekt)",opts:["hat/müssen","ist/müssen","hat/gemusst","hatte/müssen"],a:0},
    {q:"Sie hat die Geschichte ___. (erzählen, Perfekt)",opts:["erzählt","geerzählt","erzählte","erzählen"],a:0},
    {q:"Das Haus ___ 1900 ___. (bauen, Prät. Passiv)",opts:["wurde/gebaut","wird/gebaut","ist/gebaut","war/gebaut"],a:0},
    {q:"Er lernt, ___ die Prüfung zu bestehen.",opts:["damit","um","weil","ohne"],a:1},
    {q:"Sie ging, ___ sich zu verabschieden.",opts:["um","damit","ohne","anstatt"],a:2},
    {q:"___ seiner Krankheit kam er nicht. (Grund, Genitiv)",opts:["Trotz","Wegen","Während","Aufgrund"],a:1},
    {q:"Das Buch ___ gerade ___. (lesen, Präs. Passiv)",opts:["wird/gelesen","ist/gelesen","wird/lesen","hat/gelesen"],a:0},
    {q:"Sie spricht ___ Englisch ___ Arabisch.",opts:["entweder/oder","sowohl/als auch","weder/noch","nicht nur/sondern"],a:1},
    {q:"Als sie ankam, ___ er schon ___. (gehen, PQP)",opts:["ist/gegangen","war/gegangen","hat/gegangen","hatte/gegangen"],a:1},
    {q:"Je mehr er lernt, ___ besser wird er.",opts:["desto","umso mehr","so","deshalb"],a:0},
  ],
  hard:[
    {q:"Das ___ Kind sang laut. (singen, Partizip I)",opts:["gesungene","singende","gesungen","singend"],a:1},
    {q:"Der ___ Bericht wurde veröffentlicht. (schreiben, P.II)",opts:["schreibende","geschriebene","geschrieben","schreibend"],a:1},
    {q:"Trotz ___ Bemühungen scheiterte das Projekt.",opts:["alle","aller","allen","alles"],a:1},
    {q:"Das Haus ___ letztes Jahr gebaut ___. (Perfekt Passiv)",opts:["wurde/worden","ist/worden","hat/worden","wird/worden"],a:1},
    {q:"Das Problem muss sofort gelöst ___.",opts:["sein","werden","worden","geworden"],a:1},
    {q:"Die ___ Zunahme der Arbeitslosigkeit... (stark, Gen., fem.)",opts:["starke","starken","starker","starkem"],a:1},
    {q:"Er kann nicht kochen, ___ backen.",opts:["zumal","wohingegen","geschweige denn","sofern"],a:2},
    {q:"___ der steigenden Preise leiden viele.",opts:["Wegen","Trotz","Angesichts","Während"],a:2},
    {q:"___ aller Bemühungen scheiterte das Projekt.",opts:["Wegen","Trotz","Während","Aufgrund"],a:1},
    {q:"entscheiden → die ___",opts:["Entscheidigung","Entscheidung","Entscheidlichkeit","Entschiedenheit"],a:1},
    {q:"Er hat die Aufgabe erledigen ___. (müssen, Perfekt)",opts:["müssen","gemusst","gemüsst","müsste"],a:0},
    {q:"Die Stadt, ___ ich lebe, ist schön. (in + Dat., fem.)",opts:["der","die","dem","den"],a:0},
  ],
  expert:[
    {q:"'Ich bin krank.' → Er sagt, er ___ krank. (K.I)",opts:["ist","sei","wäre","war"],a:1},
    {q:"'Wir kommen.' → Sie sagten, sie ___. (K.I=Ind.→K.II)",opts:["kommen","kämen","kamen","könnten"],a:1},
    {q:"Die ___ von allen täglich ___ Bibliothek... (nutzen, P.II, erw.)",opts:["genutzte","nutzende","genutzt","nutzend"],a:0},
    {q:"Wenn er fleißiger ___, ___ er bestanden.",opts:["war/hatte","wäre/hätte","ist/hat","sei/habe"],a:1},
    {q:"___ Berücksichtigung aller Faktoren...",opts:["Unter","Bei","Mit","Zu"],a:0},
    {q:"___ er arbeitet viel, tut sie wenig. (Gegensatz HS)",opts:["Wohingegen","Obwohl","Während","Weil"],a:0},
    {q:"Das ___ Problem wurde gelöst. (bestehen, P.I, neutr.)",opts:["bestehende","bestandene","bestehendes","bestandenes"],a:0},
    {q:"Infolge ___ Sturms gab es Schäden. (des, mask.)",opts:["dem","des","der","ein"],a:1},
    {q:"Die Zunahme ___ Arbeitslosigkeit ist ein Problem. (Gen.)",opts:["die","der","dem","den"],a:1},
    {q:"Er zieht das ___ ___. (in Betracht ziehen = FVG)",opts:["in Betracht","auf Betracht","zu Betracht","mit Betracht"],a:0},
    {q:"Sofern du ___, kannst du kommen. (möchten, K.II)",opts:["möchtest","möchtest","wolltest","würdest mögen"],a:0},
    {q:"'Sie haben gewonnen.' → Er berichtet, sie ___ gewonnen. (K.I→K.II Pl.)",opts:["haben","hatten","hätten","habe"],a:2},
  ],
},
B2:{
  easy:[
    {q:"Wenn ich Zeit ___, würde ich reisen.",opts:["habe","hätte","hatte","haben"],a:1},
    {q:"___ Sie mir bitte helfen? (höflich)",opts:["Können","Könnten","Konnten","Konntet"],a:1},
    {q:"Das Haus ___ 1900 ___. (bauen, Prät. Passiv)",opts:["wurde/gebaut","wird/gebaut","ist/gebaut","war/gebaut"],a:0},
    {q:"Das Problem muss sofort gelöst ___.",opts:["sein","werden","worden","geworden"],a:1},
    {q:"Die Frau, ___ ich geholfen habe. (Dat., fem.)",opts:["der","die","dem","den"],a:0},
    {q:"Der Autor, ___ Buch ich lese. (Gen., mask.)",opts:["der","dessen","dem","den"],a:1},
    {q:"Er lernt, ___ die Prüfung zu bestehen. (Zweck)",opts:["damit","um","weil","ohne"],a:1},
    {q:"Sie ging, ___ sich zu verabschieden.",opts:["um","damit","ohne","anstatt"],a:2},
    {q:"Er ist ___ Englisch ___ Arabisch. (beides)",opts:["entweder/oder","sowohl/als auch","weder/noch","nicht/sondern"],a:1},
    {q:"___ des schlechten Wetters gingen wir.",opts:["Wegen","Trotz","Während","Aufgrund"],a:1},
  ],
  medium:[
    {q:"Wenn er fleißiger ___, ___ er bestehen.",opts:["war/hätte","wäre/würde","ist/hat","sei/habe"],a:1},
    {q:"Das Haus ___ letztes Jahr gebaut ___. (Perfekt Passiv)",opts:["wurde/worden","ist/worden","hat/worden","wird/worden"],a:1},
    {q:"Hier ___ nicht geraucht ___. (dürfen + Passiv)",opts:["darf/werden","wird/dürfen","darf/sein","wird/werden"],a:0},
    {q:"___ er viel lernt, ___ besser wird er.",opts:["Je/desto","So/also","Weil/daher","Wenn/dann"],a:0},
    {q:"Er freut sich ___. (auf das Geschenk → Pronom.adv.)",opts:["daran","darauf","davon","dabei"],a:1},
    {q:"Sie spricht ___ das Problem. → Sie spricht ___.",opts:["daran","davon","darüber","dafür"],a:2},
    {q:"___ aller Bemühungen scheiterte es.",opts:["Wegen","Trotz","Während","Aufgrund"],a:1},
    {q:"entscheiden → die ___",opts:["Entscheidigung","Entscheidung","Entscheidlichkeit","Entschiedenheit"],a:1},
    {q:"Die ___ der Arbeitslosigkeit ist ein Problem.",opts:["Zunahme","Zunehme","Zunehmung","Zunehmen"],a:0},
    {q:"Das ___ Kind sang laut. (singen, P.I)",opts:["gesungene","singende","gesungen","singend"],a:1},
    {q:"Der ___ Bericht... (schreiben, P.II, mask.)",opts:["schreibende","geschriebene","geschrieben","schreibend"],a:1},
    {q:"___ der steigenden Preise leiden viele.",opts:["Wegen","Trotz","Angesichts","Während"],a:2},
  ],
  hard:[
    {q:"'Ich bin krank.' → Er sagt, er ___ krank. (K.I)",opts:["ist","sei","wäre","war"],a:1},
    {q:"'Wir kommen.' → Sie sagten, sie ___. (K.I=Ind.→K.II)",opts:["kommen","kämen","kamen","könnten"],a:1},
    {q:"'Sie hat gewonnen.' → Er berichtet, sie ___ gewonnen. (K.I 3.P.Sg.)",opts:["hat","habe","hätte","hatte"],a:1},
    {q:"Trotz ___ Bemühungen scheiterte das Projekt.",opts:["alle","aller","allen","alles"],a:1},
    {q:"___ Berücksichtigung aller Faktoren... (unter)",opts:["Unter","Bei","Mit","Zu"],a:0},
    {q:"Er arbeitet viel, ___ sie wenig tut.",opts:["zumal","wohingegen","sofern","geschweige denn"],a:1},
    {q:"Er kann nicht kochen, ___ backen.",opts:["zumal","wohingegen","geschweige denn","sofern"],a:2},
    {q:"___ Beweisen wurde er freigelassen. (Mangel)",opts:["Trotz","Mangels","Wegen","Infolge"],a:1},
    {q:"Infolge ___ Sturms gab es Schäden.",opts:["dem","des","der","ein"],a:1},
    {q:"Zusammenfassend ___ sich sagen, dass...",opts:["kann","lässt","macht","gibt"],a:1},
    {q:"Das ist von zentraler ___ für unser Projekt.",opts:["Wichtigkeit","Bedeutung","Relevanz","Notwendigkeit"],a:1},
    {q:"Im ___ wird das Thema untersucht.",opts:["Folgenden","Folgendsten","Folgendem","Folgend"],a:0},
  ],
  expert:[
    {q:"Die ___ von allen täglich ___ Bibliothek... (nutzen, P.II)",opts:["genutzte","nutzende","genutzt","nutzend"],a:0},
    {q:"___ seiner Abwesenheit konnte er nicht abstimmen.",opts:["Aufgrund","Trotz","Infolge","Wegen"],a:0},
    {q:"Das ___ Problem (bestehen, P.I) wird weiter diskutiert.",opts:["bestehende","bestandene","bestehendes","bestandenes"],a:0},
    {q:"Er zieht das ___ ___. (FVG: in Betracht ziehen)",opts:["in Betracht","auf Betracht","zu Betracht","mit Betracht"],a:0},
    {q:"Hinsichtlich ___ Kosten müssen wir sparen.",opts:["die","der","dem","den"],a:1},
    {q:"Die Maßnahmen ___ darauf ab, die Umwelt zu schützen.",opts:["zielen","stellen","setzen","legen"],a:0},
    {q:"Insofern ___ als die Regeln klar sind, ist das Problem lösbar.",opts:["als","dass","weil","wie"],a:0},
    {q:"'Er weiß das.' → Sie sagt, er ___ das. (K.I von wissen)",opts:["weiß","wisse","wisste","wüsste"],a:1},
    {q:"___ dieser Entwicklung ist mit Vorsicht zu begegnen.",opts:["Angesichts","Trotz","Wegen","Während"],a:0},
    {q:"Die schnelle ___ des Problems ist notwendig. (lösen→Nomen)",opts:["Lösigung","Lösung","Löslichkeit","Lösbarkeit"],a:1},
    {q:"Sofern du ___, kannst du kommen. (möchten, K.II)",opts:["möchtest","möchte","wolltest","würdest mögen"],a:2},
    {q:"Das ist ___ wichtig ___ dringend. (beides gleich)",opts:["sowohl/als auch","entweder/oder","weder/noch","nicht nur/sondern auch"],a:0},
  ],
},
C1:{
  easy:[
    {q:"Er sagt, er ___ krank. (K.I von sein)",opts:["ist","sei","wäre","war"],a:1},
    {q:"'Ich habe Zeit.' → Sie sagt, sie ___ Zeit. (K.I)",opts:["hat","hätte","habe","hatte"],a:2},
    {q:"Das ___ Kind sang laut. (singen, P.I)",opts:["gesungene","singende","gesungen","singend"],a:1},
    {q:"Der ___ Bericht wurde veröffentlicht. (schreiben, P.II)",opts:["schreibende","geschriebene","geschrieben","schreibend"],a:1},
    {q:"entscheiden → die ___",opts:["Entscheidigung","Entscheidung","Entscheidlichkeit","Entschiedenheit"],a:1},
    {q:"Die ___ der Arbeitslosigkeit ist ein Problem.",opts:["Zunahme","Zunehme","Zunehmung","Zunehmen"],a:0},
    {q:"___ aller Bemühungen scheiterte das Projekt.",opts:["Wegen","Trotz","Während","Aufgrund"],a:1},
    {q:"Er kann nicht kochen, ___ backen.",opts:["zumal","wohingegen","geschweige denn","sofern"],a:2},
    {q:"'Wir kommen.' → Sie sagten, sie ___. (K.I=Ind.→K.II)",opts:["kommen","kämen","kamen","könnten"],a:1},
    {q:"___ der steigenden Preise leiden viele.",opts:["Wegen","Trotz","Angesichts","Während"],a:2},
  ],
  medium:[
    {q:"Die ___ des Problems dauerte lange. (lösen)",opts:["Lösung","Lösigung","Löslichkeit","Lösbarkeit"],a:0},
    {q:"Er arbeitet viel, ___ sie wenig tut.",opts:["zumal","wohingegen","sofern","geschweige denn"],a:1},
    {q:"'Sie haben gewonnen.' → Er berichtet, sie ___ gewonnen. (K.I→K.II)",opts:["haben","hatten","hätten","habe"],a:2},
    {q:"___ Beweisen wurde er freigelassen.",opts:["Trotz","Mangels","Wegen","Infolge"],a:1},
    {q:"Zusammenfassend ___ sich sagen, dass...",opts:["kann","lässt","macht","gibt"],a:1},
    {q:"Das ist von zentraler ___.",opts:["Wichtigkeit","Bedeutung","Relevanz","Notwendigkeit"],a:1},
    {q:"Im ___ wird das Thema untersucht.",opts:["Folgenden","Folgendsten","Folgendem","Folgend"],a:0},
    {q:"___ dieser Entwicklung ist Vorsicht geboten.",opts:["Angesichts","Trotz","Wegen","Während"],a:0},
    {q:"Hinsichtlich ___ Kosten müssen wir sparen.",opts:["die","der","dem","den"],a:1},
    {q:"Er zieht das ___ ___. (FVG: in Betracht ziehen)",opts:["in Betracht","auf Betracht","zu Betracht","mit Betracht"],a:0},
    {q:"Die Maßnahmen ___ darauf ab, die Umwelt zu schützen.",opts:["zielen","stellen","setzen","legen"],a:0},
    {q:"Das ___ Problem wird weiter diskutiert. (bestehen, P.I)",opts:["bestehende","bestandene","bestehendes","bestandenes"],a:0},
  ],
  hard:[
    {q:"'Er weiß das.' → Sie sagt, er ___ das. (K.I von wissen)",opts:["weiß","wisse","wisste","wüsste"],a:1},
    {q:"Die ___ von allen täglich ___ Bibliothek... (nutzen, P.II)",opts:["genutzte","nutzende","genutzt","nutzend"],a:0},
    {q:"___ seiner Abwesenheit konnte er nicht abstimmen.",opts:["Aufgrund","Trotz","Infolge","Wegen"],a:0},
    {q:"___ Berücksichtigung aller Faktoren...",opts:["Unter","Bei","Mit","Zu"],a:0},
    {q:"Insofern ___ als die Regeln klar sind, ist es lösbar.",opts:["als","dass","weil","wie"],a:0},
    {q:"analysieren → die ___",opts:["Analysierung","Analyse","Analyzierung","Analysation"],a:1},
    {q:"berücksichtigen → die ___",opts:["Berücksichtung","Berücksichtigung","Berücksichtlichkeit","Berücksicht"],a:1},
    {q:"Das ___ Problem (bestehen, P.I, neutr.) beschäftigt uns.",opts:["bestehende","bestandene","bestehendes","bestandenes"],a:0},
    {q:"Infolge ___ Sturms gab es Schäden. (mask., Gen.)",opts:["dem","des","der","ein"],a:1},
    {q:"Sofern du ___, bist du herzlich eingeladen. (wollen, K.II)",opts:["möchtest","wolltest","würdest wollen","willst"],a:1},
    {q:"Das ist insofern wichtig, ___ es alle betrifft.",opts:["als","dass","weil","wie"],a:0},
    {q:"Zur ___ stehen mehrere Optionen. (Verfügung, FVG)",opts:["Verfügung","Verfügbarkeit","Bereitstellung","Vorlage"],a:0},
  ],
  expert:[
    {q:"'Sie arbeiten hart.' → Er berichtet, sie ___ hart. (K.I Pl.→K.II)",opts:["arbeiten","arbeiteten","arbeiteten","arbeiteten"],a:1},
    {q:"Das ___ im 18. Jh. ___ Schloss... (errichten, P.II, erw. Attr.)",opts:["errichtete","errichtende","errichtet","errichtend"],a:0},
    {q:"___ zunehmender Digitalisierung verändert sich die Arbeitswelt.",opts:["Angesichts","Trotz","Wegen","Infolge"],a:0},
    {q:"Er stellt die Ergebnisse ___ Frage. (FVG: in Frage stellen)",opts:["in","auf","zur","unter"],a:0},
    {q:"Die Befunde ___ Berücksichtigung finden. (FVG: sollen)",opts:["sollen","müssen","dürfen","können"],a:0},
    {q:"'Er kommt nicht.' → Der Sprecher bemerkte, er ___ nicht. (K.I von kommen, 3.P.Sg.)",opts:["komme","käme","kommt","kam"],a:0},
    {q:"___ mangelnder Ressourcen konnte das Projekt nicht abgeschlossen werden.",opts:["Aufgrund","Angesichts","Trotz","Infolge"],a:0},
    {q:"Das Konzept, ___ der Minister gestern vorgestellt hat...(Relativpron., Akk.neutr.)",opts:["das","dem","dessen","die"],a:0},
    {q:"Unbeschadet ___ Tatsache, dass er recht hat...",opts:["die","der","dem","das"],a:1},
    {q:"Zusammenfassend ___ festgestellt werden, dass... (kann Passiv)",opts:["kann","lässt sich","darf","soll"],a:0},
    {q:"Die ___ aller Beteiligten ist von zentraler Bedeutung. (einbeziehen→Nomen)",opts:["Einbeziehung","Einbeziehigkeit","Einbezug","Einbeziehen"],a:0},
    {q:"Die schnelle ___ technischer Neuerungen... (einführen→Nomen)",opts:["Einführung","Einführigkeit","Einführ","Eingeführtheit"],a:0},
  ],
},
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const stored = load();
  const [isAdmin, setIsAdmin] = useState(() => load().isAdmin ?? false);
  const [dark, setDark] = useState(() => load().dark ?? false);
  const [loggedIn, setLoggedIn] = useState(() => !!stored.loggedIn);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [screen, setScreen] = useState("home"); // home|level|lesson|exam
  const [lvl, setLvl] = useState(null);
  const [tab, setTab] = useState("lessons");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [phase, setPhase] = useState("learn");
  const [ans, setAns] = useState({});
  const [chk, setChk] = useState({});
  const [doneLessons, setDoneLessons] = useState(() => stored.doneLessons || {});
  const [passedLevels, setPassedLevels] = useState(() => stored.passedLevels || {});
  const [examDiff, setExamDiff] = useState(null);
  const [examAns, setExamAns] = useState({});
  const [examDone, setExamDone] = useState(false);
  const [timer, setTimer] = useState(900);
  const [timerOn, setTimerOn] = useState(false);
  const timerRef = useRef(null);
  const [musicPref, setMusicPref] = useState(() => load().musicPref ?? "none");
  const [musicOn, setMusicOn] = useState(false);
  const audioCtxRef = useRef(null);
  const musicNodesRef = useRef([]);
  const [showMabrook, setShowMabrook] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [firstPass, setFirstPass] = useState(false);

  const th = T[dark ? "dark" : "light"];

  useEffect(() => { save({ loggedIn, dark, doneLessons, passedLevels, isAdmin }); }, [loggedIn, dark, doneLessons, passedLevels, isAdmin]);

  useEffect(() => {
    if (timerOn && timer > 0) { timerRef.current = setInterval(() => setTimer(t => t - 1), 1000); }
    else if (timer === 0 && timerOn) { setTimerOn(false); setExamDone(true); }
    return () => clearInterval(timerRef.current);
  }, [timerOn, timer]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const lc = lvl ? LC[lvl] : "#4f46e5";
  const lessons = lvl ? CUR[lvl] : [];
  const curLesson = lessons[lessonIdx];
  const examQs = lvl && examDiff ? (EXAMS[lvl][examDiff] || []) : [];
  const examScore = () => examQs.filter((q,i) => examAns[i] === q.a).length;
  const passMark = () => Math.ceil(examQs.length * 0.6);
          const allLessonsDone = () => isAdmin || lessons.every((_,i) => doneLessons[`${lvl}-${i}`]);

  const login = () => {
    if (code.trim().toUpperCase() === SECRET_CODE) {
      setLoggedIn(true); setIsAdmin(false); setCodeErr(false);
    } else if (code.trim().toUpperCase() === ADMIN_CODE) {
      setLoggedIn(true); setIsAdmin(true); setCodeErr(false);
    } else {
      setCodeErr(true);
    }
  };

  const startExam = (diff) => {
    const d = DIFFICULTIES.find(d => d.key === diff);
    setExamDiff(diff); setExamAns({}); setExamDone(false);
    setTimer(d.time); setTimerOn(true); setScreen("exam");
  };

  const submitExam = () => {
    clearInterval(timerRef.current); setTimerOn(false); setExamDone(true);
    if (examScore() >= passMark()) setPassedLevels(p => ({ ...p, [lvl]: examDiff }));
  };

  const checkAns = (i) => {
    const correct = ans[i]?.trim().toLowerCase() === curLesson.exercises[i].a.toLowerCase();
    setChk(p => ({ ...p, [i]: correct }));
  };

  const allChecked = curLesson ? curLesson.exercises.every((_,i) => chk[i] !== undefined) : false;
  const hasWrong = curLesson ? curLesson.exercises.some((_,i) => chk[i] === false) : false;

  const nextLesson = () => {
    if (phase === "learn") { setPhase("exercise"); setAns({}); setChk({}); return; }
    if (hasWrong) { setPhase("review"); return; }
    setDoneLessons(p => ({ ...p, [`${lvl}-${lessonIdx}`]: true }));
    if (lessonIdx < lessons.length - 1) { setLessonIdx(i=>i+1); setPhase("learn"); setAns({}); setChk({}); }
    else { setScreen("level"); setTab("lessons"); }
  };

  // ── MD RENDERER ──
  const renderMd = (text) => {
    const out = []; let tb = [], tx = [];
    const fT = () => { if(!tb.length)return; const rows=tb.map(l=>l.split("|").filter(c=>c.trim()).map(c=>c.trim())); out.push(<div key={out.length} style={{overflowX:"auto",margin:"10px 0"}}><table style={{borderCollapse:"collapse",width:"100%",fontSize:"0.9em"}}><thead><tr>{rows[0].map((c,i)=><th key={i} style={{border:`1px solid ${th.border}`,padding:"6px 12px",background:th.input,textAlign:"left",color:th.text}} dangerouslySetInnerHTML={{__html:c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}}/>)}</tr></thead><tbody>{rows.slice(2).map((r,ri)=><tr key={ri}>{r.map((c,ci)=><td key={ci} style={{border:`1px solid ${th.border}`,padding:"6px 12px",color:th.text}} dangerouslySetInnerHTML={{__html:c.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>")}}/>)}</tr>)}</tbody></table></div>); tb=[]; };
    const fX = () => { if(!tx.length)return; tx.forEach((line,li)=>{ const h=line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,`<code style="background:${th.code};padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>`); if(line.trim()) out.push(<p key={out.length+li} style={{margin:"4px 0",lineHeight:1.7,color:th.text}} dangerouslySetInnerHTML={{__html:h}}/>); else out.push(<div key={out.length+li} style={{height:6}}/>); }); tx=[]; };
    text.split("\n").forEach(line=>{ if(line.startsWith("|")){fX();tb.push(line);}else{fT();tx.push(line);}});
    fT();fX();return out;
  };

  const btn = (bg,fg="#fff",extra={}) => ({background:bg,color:fg,border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:"pointer",fontSize:"0.9em",display:"flex",alignItems:"center",gap:6,...extra});
  const card = {background:th.card,border:`1px solid ${th.border}`,borderRadius:16,boxShadow:th.shadow};
  const inp = {background:th.input,border:`1.5px solid ${th.inputB}`,borderRadius:10,padding:"10px 14px",fontSize:"0.95em",color:th.text,outline:"none",width:"100%",boxSizing:"border-box"};

  // ══ LOGIN ══════════════════════════════════════════════════════
  if (!loggedIn) return (
    <div style={{minHeight:"100vh",background:dark?"#0f172a":"linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:16}}>
      <div style={{...card,maxWidth:420,width:"100%",padding:40,textAlign:"center"}}>
        <div style={{width:64,height:64,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 8px 24px rgba(79,70,229,0.4)"}}>
          <Icon name="book" size={30} color="#fff"/>
        </div>
        <h1 style={{color:th.text,fontSize:"1.7em",fontWeight:800,margin:"0 0 4px"}}>Goethe Deutsch</h1>
        <p style={{color:th.sub,marginBottom:28,fontSize:"0.9em"}}>A1 bis C1 — Vollständiger Prüfungskurs</p>
        <div style={{position:"relative",marginBottom:12}}>
          <input type={showPw?"text":"password"} placeholder="Zugangscode eingeben..." value={code}
            onChange={e=>{setCode(e.target.value);setCodeErr(false);}} onKeyDown={e=>e.key==="Enter"&&login()}
            style={{...inp,borderColor:codeErr?"#ef4444":th.inputB,paddingRight:44}}/>
          <span onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer"}}>
            <Icon name={showPw?"eyeoff":"eye"} size={18} color={th.sub}/>
          </span>
        </div>
        {codeErr&&<p style={{color:"#ef4444",fontSize:"0.85em",marginBottom:10,display:"flex",gap:4,alignItems:"center",justifyContent:"center"}}><Icon name="x" size={14} color="#ef4444"/> Falscher Code</p>}
        <button onClick={login} style={{...btn("linear-gradient(135deg,#4f46e5,#7c3aed)"),width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>
          <Icon name="arrow" size={18} color="#fff"/> Einloggen
        </button>
        <button onClick={()=>setDark(v=>!v)} style={{...btn("transparent",th.sub),margin:"16px auto 0",border:`1px solid ${th.border}`}}>
          <Icon name={dark?"sun":"moon"} size={16} color={th.sub}/> {dark?"Hellmodus":"Dunkelm."}
        </button>
      </div>
    </div>
  );

  // ══ EXAM SCREEN ════════════════════════════════════════════════
  if (screen==="exam" && lvl && examDiff) {
    const diff = DIFFICULTIES.find(d=>d.key===examDiff);
    const score = examScore(); const pass = score >= passMark();
    return (
      <div style={{minHeight:"100vh",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
        <div style={{background:examDone?(pass?"#16a34a":"#ef4444"):lc,color:"#fff",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
          {examDone&&<button onClick={()=>{setScreen("level");setTab("exam");setExamDiff(null);}} style={{...btn("rgba(255,255,255,0.2)"),padding:"7px 14px"}}>
            <Icon name="back" size={16} color="#fff"/> Zurück
          </button>}
          <span style={{fontWeight:800,flex:1}}>{lvl} Prüfung – {diff.label}</span>
          {!examDone&&<div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"6px 14px"}}>
            <Icon name="clock" size={16} color={timer<60?"#fef08a":"#fff"}/>
            <span style={{fontFamily:"monospace",fontWeight:800,color:timer<60?"#fef08a":"#fff"}}>{fmt(timer)}</span>
          </div>}
          {!examDone&&<span style={{fontSize:"0.85em",opacity:0.8}}>{Object.keys(examAns).length}/{examQs.length}</span>}
        </div>
        <div style={{maxWidth:720,margin:"0 auto",padding:"20px 16px"}}>
          {examDone&&<div style={{...card,padding:24,marginBottom:20,textAlign:"center",borderLeft:`4px solid ${pass?"#16a34a":"#ef4444"}`}}>
            <Icon name={pass?"trophy":"refresh"} size={44} color={pass?"#16a34a":"#ef4444"}/>
            <h3 style={{fontWeight:800,fontSize:"1.4em",margin:"10px 0 4px",color:pass?"#16a34a":"#ef4444"}}>{pass?"Bestanden!":"Nicht bestanden"}</h3>
            <p style={{color:th.sub}}>{score}/{examQs.length} richtig · Mindest: {passMark()} · Level: {diff.label}</p>
            {pass?<p style={{color:"#16a34a",fontWeight:700}}>Herzlichen Glückwunsch! Du kannst zum nächsten Niveau!</p>
              :<p style={{color:"#ef4444"}}>Schau dir die falschen Antworten an und übe weiter.</p>}
            <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
              <button onClick={()=>{setExamAns({});setExamDone(false);setTimer(diff.time);setTimerOn(true);}} style={btn(lc)}>
                <Icon name="refresh" size={16} color="#fff"/> Nochmal
              </button>
              <button onClick={()=>{setScreen("level");setTab("exam");setExamDiff(null);}} style={btn(th.input,th.text,{border:`1px solid ${th.border}`})}>
                <Icon name="back" size={16} color={th.text}/> Zurück
              </button>
            </div>
          </div>}
          {!examDone&&<div style={{...card,padding:"10px 16px",marginBottom:16,background:diff.color+"18",border:`1px solid ${diff.color}44`}}>
            <div style={{background:th.border,borderRadius:8,height:6}}>
              <div style={{background:timer<60?"#ef4444":lc,borderRadius:8,height:6,width:`${(timer/diff.time)*100}%`,transition:"width 1s"}}/>
            </div>
          </div>}
          {examQs.map((q,i)=>{
            const correct = examAns[i]===q.a;
            return <div key={i} style={{...card,padding:20,marginBottom:14,borderLeft:examDone?`4px solid ${correct?"#16a34a":"#ef4444"}`:`4px solid ${examAns[i]!==undefined?lc:th.border}`}}>
              <p style={{fontWeight:700,marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{background:lc,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:"0.82em",flexShrink:0,marginTop:2}}>{i+1}</span>{q.q}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {q.opts.map((opt,j)=>{
                  let bg=th.input,border=th.inputB,color=th.text;
                  if(!examDone&&examAns[i]===j){bg=lc+"22";border=lc;color=lc;}
                  if(examDone){if(j===q.a){bg="#dcfce7";border="#16a34a";color="#15803d";}else if(examAns[i]===j){bg="#fee2e2";border="#ef4444";color="#dc2626";}}
                  return <button key={j} onClick={()=>!examDone&&setExamAns(p=>({...p,[i]:j}))}
                    style={{background:bg,border:`2px solid ${border}`,borderRadius:10,padding:"9px 12px",textAlign:"left",cursor:examDone?"default":"pointer",color,fontWeight:(examAns[i]===j||(examDone&&j===q.a))?700:400,fontSize:"0.88em",display:"flex",gap:6,alignItems:"center",transition:"all 0.15s"}}>
                    <span style={{background:border,color:"#fff",borderRadius:5,padding:"1px 7px",fontSize:"0.78em",flexShrink:0}}>{["A","B","C","D"][j]}</span>{opt}
                    {examDone&&j===q.a&&<span style={{marginLeft:"auto"}}><Icon name="check" size={13} color="#15803d"/></span>}
                    {examDone&&examAns[i]===j&&j!==q.a&&<span style={{marginLeft:"auto"}}><Icon name="x" size={13} color="#dc2626"/></span>}
                  </button>;
                })}
              </div>
              {examDone&&!correct&&<div style={{marginTop:10,background:"#fef3c7",border:"1px solid #fde68a",borderRadius:8,padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
                <Icon name="book" size={14} color="#d97706"/>
                <span style={{color:"#d97706",fontSize:"0.82em",fontWeight:600}}>Wiederhole die Grammatikregeln für dieses Thema.</span>
              </div>}
            </div>;
          })}
          {timerOn&&<button onClick={submitExam} style={{...btn(lc),width:"100%",justifyContent:"center",padding:"14px",fontSize:"1em",marginTop:8}}>
            <Icon name="check" size={18} color="#fff"/> Prüfung abgeben
          </button>}
        </div>
      </div>
    );
  }

  // ══ LESSON SCREEN ═══════════════════════════════════════════════
  if (screen==="lesson"&&lvl&&curLesson) {
    return (
      <div style={{minHeight:"100vh",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
        <div style={{background:th.nav,borderBottom:`1px solid ${th.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50,boxShadow:th.shadow}}>
          <button onClick={()=>{setScreen("level");setTab("lessons");}} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,padding:"8px 14px"}}>
            <Icon name="back" size={16} color={th.text}/>
          </button>
          <span style={{background:lc,color:"#fff",borderRadius:8,padding:"3px 10px",fontWeight:800,fontSize:"0.85em"}}>{curLesson.id}</span>
          <span style={{fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{curLesson.title}</span>
          <span style={{color:th.sub,fontSize:"0.82em",whiteSpace:"nowrap"}}>{lessonIdx+1}/{lessons.length}</span>
        </div>
        <div style={{background:th.nav,borderBottom:`1px solid ${th.border}`,padding:"6px 20px"}}>
          <div style={{background:th.border,borderRadius:8,height:5}}>
            <div style={{background:lc,borderRadius:8,height:5,width:`${((lessonIdx+(phase!=="learn"?0.5:0))/lessons.length)*100}%`,transition:"width 0.4s"}}/>
          </div>
        </div>
        <div style={{maxWidth:760,margin:"0 auto",padding:"20px 16px"}}>
          {phase==="learn"&&<div>
            <div style={{...card,padding:24,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${th.border}`}}>
                <div style={{width:40,height:40,background:lc,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name="book" size={20} color="#fff"/>
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:"1.05em"}}>{curLesson.title}</div>
                  <div style={{color:th.sub,fontSize:"0.8em"}}>{curLesson.topic} · {curLesson.id}</div>
                </div>
              </div>
              {renderMd(curLesson.explanation)}
            </div>
            <button onClick={()=>{setPhase("exercise");setAns({});setChk({});}} style={{...btn(lc),width:"100%",justifyContent:"center",padding:"13px"}}>
              Zu den Übungen <Icon name="arrow" size={17} color="#fff"/>
            </button>
          </div>}
          {(phase==="exercise"||phase==="review")&&<div>
            {phase==="review"&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:12,padding:"13px 18px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
              <Icon name="info" size={18} color="#d97706"/>
              <div>
                <div style={{fontWeight:700,color:"#d97706"}}>Einige Antworten waren falsch!</div>
                <div style={{color:"#92400e",fontSize:"0.85em"}}>Lies die Erklärung nochmal, dann versuche es erneut.</div>
              </div>
            </div>}
            <h2 style={{fontWeight:800,fontSize:"1.05em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
              <Icon name="pencil" size={18} color={lc}/> Übungen – {curLesson.id}
            </h2>
            {curLesson.exercises.map((ex,i)=>(
              <div key={i} style={{...card,padding:18,marginBottom:12,borderLeft:chk[i]===true?"4px solid #16a34a":chk[i]===false?"4px solid #ef4444":`4px solid ${th.border}`}}>
                <p style={{fontWeight:600,marginBottom:10,lineHeight:1.5}}>
                  <span style={{background:lc,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:"0.8em",marginRight:8}}>{i+1}</span>{ex.q}
                </p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <input value={ans[i]||""} onChange={e=>setAns(p=>({...p,[i]:e.target.value}))}
                    disabled={chk[i]!==undefined} onKeyDown={e=>e.key==="Enter"&&chk[i]===undefined&&checkAns(i)}
                    placeholder="Antwort..." style={{...inp,maxWidth:220,borderColor:chk[i]===true?"#16a34a":chk[i]===false?"#ef4444":th.inputB}}/>
                  {chk[i]===undefined&&<button onClick={()=>checkAns(i)} style={btn(lc)}>
                    <Icon name="check" size={15} color="#fff"/> Prüfen
                  </button>}
                  {chk[i]===true&&<span style={{display:"flex",alignItems:"center",gap:5,color:"#16a34a",fontWeight:700}}><Icon name="check" size={16} color="#16a34a"/> Richtig!</span>}
                  {chk[i]===false&&<span style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{display:"flex",alignItems:"center",gap:5,color:"#ef4444",fontWeight:700}}><Icon name="x" size={16} color="#ef4444"/> Falsch</span>
                    <span style={{color:th.sub,fontSize:"0.88em"}}>Lösung: <strong style={{color:th.text}}>{ex.a}</strong></span>
                  </span>}
                </div>
                {chk[i]===undefined&&<p style={{color:th.muted,fontSize:"0.8em",marginTop:6,display:"flex",gap:5,alignItems:"center"}}>
                  <Icon name="info" size={13} color={th.muted}/>{ex.hint}
                </p>}
                {chk[i]===false&&<div style={{marginTop:10,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
                  <Icon name="book" size={14} color="#ef4444"/>
                  <span style={{color:"#dc2626",fontSize:"0.82em",fontWeight:600}}>Gehe zurück zur Erklärung um die Regel nochmal zu lesen.</span>
                </div>}
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              {phase==="review"&&<button onClick={()=>setPhase("learn")} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,flex:1,justifyContent:"center",padding:"12px"}}>
                <Icon name="book" size={16} color={th.text}/> Erklärung
              </button>}
              <button onClick={nextLesson} disabled={!allChecked}
                style={{...btn(allChecked?lc:th.muted),flex:1,justifyContent:"center",padding:"12px",cursor:allChecked?"pointer":"not-allowed"}}>
                {lessonIdx===lessons.length-1?<><Icon name="check" size={16} color="#fff"/> Abschließen</>:<>Weiter <Icon name="arrow" size={16} color="#fff"/></>}
              </button>
            </div>
          </div>}
        </div>
      </div>
    );
  }

  // ══ LEVEL SCREEN ══════════════════════════════════════════════
  if (screen==="level"&&lvl) {
    const est = EXAM_STRUCT[lvl];
    return (
      <div style={{minHeight:"100vh",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
        <div style={{background:th.nav,borderBottom:`1px solid ${th.border}`,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50,boxShadow:th.shadow}}>
          <button onClick={()=>setScreen("home")} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,padding:"8px 14px"}}>
            <Icon name="back" size={16} color={th.text}/>
          </button>
          <span style={{background:lc,color:"#fff",borderRadius:8,padding:"4px 12px",fontWeight:800}}>{lvl}</span>
          <span style={{fontWeight:700,flex:1}}>{LD[lvl]}</span>
          {passedLevels[lvl]&&<span style={{background:"#dcfce7",color:"#16a34a",borderRadius:8,padding:"3px 10px",fontSize:"0.8em",fontWeight:700,display:"flex",gap:4,alignItems:"center"}}><Icon name="check" size={12} color="#16a34a"/> Bestanden</span>}
          <button onClick={()=>setDark(v=>!v)} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,padding:"8px 12px"}}>
            <Icon name={dark?"sun":"moon"} size={16} color={th.text}/>
          </button>
        </div>
        <div style={{background:th.nav,borderBottom:`1px solid ${th.border}`,padding:"0 20px",display:"flex",gap:2,overflowX:"auto"}}>
          {[{k:"lessons",i:"book",l:"Lektionen"},{k:"structure",i:"structure",l:"Prüfungsstruktur"},{k:"themen",i:"pencil",l:"Themen"},{k:"videos",i:"video",l:"Videos"},{k:"exam",i:"exam",l:"Prüfung"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{...btn(tab===t.k?lc:"transparent",tab===t.k?"#fff":th.sub),borderRadius:"8px 8px 0 0",padding:"11px 16px",borderBottom:tab===t.k?`3px solid ${lc}`:"3px solid transparent",fontWeight:tab===t.k?700:500,whiteSpace:"nowrap"}}>
              <Icon name={t.i} size={15} color={tab===t.k?"#fff":th.sub}/>{t.l}
            </button>
          ))}
        </div>
        <div style={{maxWidth:760,margin:"0 auto",padding:"20px 16px"}}>

          {/* LESSONS TAB */}
          {tab==="lessons"&&<div>
            <div style={{...card,padding:20,marginBottom:16,background:lc+"12",border:`1px solid ${lc}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontWeight:700,color:lc}}>Fortschritt</span>
                <span style={{color:lc,fontWeight:800}}>{lessons.filter((_,i)=>doneLessons[`${lvl}-${i}`]).length}/{lessons.length}</span>
              </div>
              <div style={{background:th.border,borderRadius:8,height:8}}>
                <div style={{background:lc,borderRadius:8,height:8,width:`${(lessons.filter((_,i)=>doneLessons[`${lvl}-${i}`]).length/lessons.length)*100}%`,transition:"width 0.4s"}}/>
              </div>
            </div>
            {lessons.map((ls,i)=>{
              const done = doneLessons[`${lvl}-${i}`];
              const locked = isAdmin ? false : (i>0 && !doneLessons[`${lvl}-${i-1}`]);
              return <div key={i} onClick={()=>{if(!locked){setLessonIdx(i);setPhase("learn");setAns({});setChk({});setScreen("lesson");}}}
                style={{...card,padding:"15px 18px",marginBottom:10,cursor:locked?"not-allowed":"pointer",opacity:locked?0.5:1,display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${done?"#16a34a":locked?th.border:lc}`,transition:"transform 0.15s"}}
                onMouseEnter={e=>{if(!locked)e.currentTarget.style.transform="translateX(4px)";}}
                onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                <div style={{width:44,height:44,borderRadius:12,background:done?"#dcfce7":locked?th.input:lc+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:800,fontSize:"0.85em",color:done?"#16a34a":locked?th.muted:lc}}>
                  {done?<Icon name="check" size={20} color="#16a34a"/>:locked?<Icon name="lock" size={18} color={th.muted}/>:ls.id}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:2}}>{ls.title}</div>
                  <div style={{color:th.sub,fontSize:"0.8em",display:"flex",gap:10}}>
                    <span>{ls.topic}</span><span>·</span><span>{ls.exercises.length} Übungen</span>
                  </div>
                </div>
                {!locked&&<Icon name="arrow" size={17} color={th.muted}/>}
              </div>;
            })}
          </div>}

          {/* STRUCTURE TAB */}
          {tab==="structure"&&<div>
            {/* Header */}
            <div style={{...card,padding:20,marginBottom:16,borderLeft:`4px solid ${lc}`}}>
              <div style={{fontWeight:800,fontSize:"1.1em",marginBottom:4}}>{est.name}</div>
              <p style={{color:th.sub,margin:"0 0 12px",lineHeight:1.6,fontSize:"0.92em"}}>{est.intro}</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <span style={{background:lc+"18",color:lc,borderRadius:8,padding:"4px 12px",fontSize:"0.82em",fontWeight:700,display:"flex",gap:5,alignItems:"center"}}>
                  <Icon name="clock" size={13} color={lc}/>{est.totalTime}
                </span>
                <span style={{background:est.modular?"#dcfce7":"#fef3c7",color:est.modular?"#16a34a":"#d97706",borderRadius:8,padding:"4px 12px",fontSize:"0.82em",fontWeight:700}}>
                  {est.modular?"✓ Modular – Module einzeln ablegbar":"✗ Nicht modular – Gesamtprüfung"}
                </span>
              </div>
            </div>

            {/* PDF Download */}
            <a href={est.pdfUrl} target="_blank" rel="noopener noreferrer"
              style={{...card,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14,textDecoration:"none",color:th.text,background:"#fef2f2",border:`1px solid #fecaca`}}>
              <div style={{width:44,height:44,background:"#ef4444",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="exam" size={22} color="#fff"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:"#dc2626"}}>Offizieller Modellsatz – PDF herunterladen</div>
                <div style={{color:"#9ca3af",fontSize:"0.82em"}}>Goethe-Institut · Echte Prüfungsaufgaben zum Üben</div>
              </div>
              <Icon name="arrow" size={18} color="#ef4444"/>
            </a>

            {/* Parts */}
            {est.parts.map((p,i)=>(
              <div key={i} style={{...card,padding:20,marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${th.border}`}}>
                  <div style={{width:48,height:48,background:lc,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={p.icon} size={24} color="#fff"/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:"1.1em"}}>{p.name}</div>
                    <div style={{color:th.sub,fontSize:"0.83em",display:"flex",gap:12,marginTop:2,flexWrap:"wrap"}}>
                      <span style={{display:"flex",gap:4,alignItems:"center"}}><Icon name="clock" size={13} color={th.sub}/>{p.dur}</span>
                      <span style={{display:"flex",gap:4,alignItems:"center"}}><Icon name="star" size={13} color={th.sub}/>max. {p.pts} Punkte</span>
                    </div>
                  </div>
                </div>
                {/* Tasks */}
                <div style={{marginBottom:12}}>
                  {p.tasks.map((t,ti)=>(
                    <div key={ti} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:th.input,borderRadius:10,border:`1px solid ${th.border}`}}>
                      <span style={{background:lc,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:"0.78em",fontWeight:800,flexShrink:0,alignSelf:"flex-start",marginTop:1}}>{t.n}</span>
                      <span style={{color:th.text,fontSize:"0.88em",lineHeight:1.6}}>{t.desc}</span>
                    </div>
                  ))}
                </div>
                {/* Tip */}
                <div style={{background:lc+"12",border:`1px solid ${lc}33`,borderRadius:10,padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-start"}}>
                  <Icon name="info" size={15} color={lc}/>
                  <span style={{color:lc,fontSize:"0.87em",fontWeight:600,lineHeight:1.5}}>Tipp: {p.tip}</span>
                </div>
              </div>
            ))}

            {/* Passing rules */}
            <div style={{...card,padding:20,borderLeft:`4px solid ${lc}`}}>
              <div style={{fontWeight:800,marginBottom:8,display:"flex",gap:8,alignItems:"center",fontSize:"1em"}}>
                <Icon name="trophy" size={18} color={lc}/> Bestehensregeln
              </div>
              <p style={{margin:0,color:th.text,lineHeight:1.7}}>{est.passingRule}</p>
            </div>
          </div>}

          {/* THEMEN TAB */}
          {tab==="themen"&&<div>
            {/* START TIPP */}
            <div style={{background:"#dcfce7",border:"1px solid #86efac",borderRadius:14,padding:"14px 18px",marginBottom:18,display:"flex",gap:10,alignItems:"flex-start"}}>
              <Icon name="star" size={18} color="#16a34a"/>
              <div>
                <div style={{fontWeight:800,color:"#15803d",marginBottom:4}}>Strategie: Womit beginnen?</div>
                <div style={{color:"#166534",fontSize:"0.88em",lineHeight:1.6}}>{PRUEFUNGSTHEMEN[lvl].startTipp}</div>
              </div>
            </div>

            {/* GRAMMATIK */}
            <div style={{...card,padding:18,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:"1em",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{width:32,height:32,background:"#8b5cf6",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name="book" size={16} color="#fff"/>
                </div>
                Wichtige Grammatik für {lvl}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {PRUEFUNGSTHEMEN[lvl].grammatik.map((g,i)=>(
                  <span key={i} style={{background:"#8b5cf6"+"18",color:"#7c3aed",borderRadius:8,padding:"4px 12px",fontSize:"0.82em",fontWeight:600,border:"1px solid #8b5cf633"}}>{g}</span>
                ))}
              </div>
            </div>

            {/* SPRECHEN */}
            <div style={{fontWeight:800,fontSize:"1em",marginBottom:10,display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,background:lc,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="info" size={16} color="#fff"/>
              </div>
              Sprechen – alle Themen ({PRUEFUNGSTHEMEN[lvl].sprechen.length})
            </div>
            {PRUEFUNGSTHEMEN[lvl].sprechen.map((t,i)=>(
              <div key={i} style={{...card,padding:"12px 16px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start",borderLeft:`3px solid ${lc}`}}>
                <span style={{background:lc,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:"0.72em",fontWeight:800,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{i+1}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:2}}>{t.t}</div>
                  <div style={{color:th.sub,fontSize:"0.84em",lineHeight:1.5}}>{t.b}</div>
                </div>
              </div>
            ))}

            {/* SCHREIBEN */}
            <div style={{fontWeight:800,fontSize:"1em",margin:"18px 0 10px",display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,background:"#f59e0b",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="pencil" size={16} color="#fff"/>
              </div>
              Schreiben – alle Themen ({PRUEFUNGSTHEMEN[lvl].schreiben.length})
            </div>
            {PRUEFUNGSTHEMEN[lvl].schreiben.map((t,i)=>(
              <div key={i} style={{...card,padding:"12px 16px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start",borderLeft:"3px solid #f59e0b"}}>
                <span style={{background:"#f59e0b",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:"0.72em",fontWeight:800,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{i+1}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:2}}>{t.t}</div>
                  <div style={{color:th.sub,fontSize:"0.84em",lineHeight:1.5}}>{t.b}</div>
                </div>
              </div>
            ))}

            {/* LESEN */}
            <div style={{fontWeight:800,fontSize:"1em",margin:"18px 0 10px",display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,background:"#3b82f6",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="book" size={16} color="#fff"/>
              </div>
              Lesen – alle Teile ({PRUEFUNGSTHEMEN[lvl].lesen.length})
            </div>
            {PRUEFUNGSTHEMEN[lvl].lesen.map((t,i)=>(
              <div key={i} style={{...card,padding:"12px 16px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start",borderLeft:"3px solid #3b82f6"}}>
                <span style={{background:"#3b82f6",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:"0.72em",fontWeight:800,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{i+1}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,marginBottom:2}}>{t.t}</div>
                  <div style={{color:th.sub,fontSize:"0.84em",lineHeight:1.5}}>{t.b}</div>
                </div>
              </div>
            ))}

            {/* PDF */}
            <a href={EXAM_STRUCT[lvl].pdfUrl} target="_blank" rel="noopener noreferrer"
              style={{...card,padding:"14px 18px",marginTop:16,display:"flex",alignItems:"center",gap:14,textDecoration:"none",color:th.text,background:"#fef2f2",border:"1px solid #fecaca"}}>
              <div style={{width:40,height:40,background:"#ef4444",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="exam" size={20} color="#fff"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,color:"#dc2626",fontSize:"0.92em"}}>Offizieller Modellsatz – Goethe-Institut PDF</div>
                <div style={{color:"#9ca3af",fontSize:"0.8em"}}>Echte Prüfungsaufgaben zum Herunterladen & Üben</div>
              </div>
              <Icon name="arrow" size={17} color="#ef4444"/>
            </a>
          </div>}

          {/* VIDEOS TAB */}

          {/* VIDEOS TAB */}
          {tab==="videos"&&<div>
            {/* Info Banner */}
            <div style={{background:lc+"18",border:`1px solid ${lc}44`,borderRadius:14,padding:"14px 18px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
              <Icon name="info" size={18} color={lc}/>
              <div>
                <div style={{fontWeight:700,color:lc,marginBottom:2}}>So benutzt du die Videos</div>
                <div style={{color:th.sub,fontSize:"0.87em"}}>Klicke auf "Kanal öffnen" → abonniere den Kanal → suche das empfohlene Thema. Alle Kanäle sind 100% kostenlos!</div>
              </div>
            </div>

            {/* Recommended channels for this level */}
            <h3 style={{fontWeight:700,marginBottom:12,fontSize:"0.95em",color:th.sub,textTransform:"uppercase",letterSpacing:"0.05em"}}>
              Empfohlene Kanäle für {lvl}
            </h3>
            {VIDS[lvl].channels.map((ci,i) => {
              const ch = CHANNELS[ci];
              const search = VIDS[lvl].searches[i];
              const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
              return (
                <div key={i} style={{...card,padding:20,marginBottom:14,borderLeft:`4px solid ${ch.color}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                    <div style={{width:48,height:48,background:ch.color,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4em",flexShrink:0}}>
                      {ch.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:"1em"}}>{ch.name}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:2}}>
                        <span style={{background:ch.color+"22",color:ch.color,borderRadius:6,padding:"2px 8px",fontSize:"0.75em",fontWeight:700}}>{ch.level}</span>
                        <span style={{color:th.muted,fontSize:"0.78em"}}>{ch.subs} Abonnenten</span>
                      </div>
                    </div>
                  </div>
                  <p style={{color:th.sub,fontSize:"0.88em",lineHeight:1.6,marginBottom:14}}>{ch.desc}</p>
                  <div style={{background:th.input,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}>
                    <Icon name="info" size={14} color={th.muted}/>
                    <span style={{color:th.muted,fontSize:"0.82em"}}>Empfohlene Suche: </span>
                    <span style={{color:th.text,fontSize:"0.85em",fontWeight:600}}>"{search}"</span>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <a href={ch.url} target="_blank" rel="noopener noreferrer"
                      style={{...btn(ch.color),textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                      <Icon name="play" size={15} color="#fff"/> Kanal öffnen
                    </a>
                    <a href={ytSearch} target="_blank" rel="noopener noreferrer"
                      style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                      <Icon name="exam" size={15} color={th.text}/> Suche starten
                    </a>
                  </div>
                </div>
              );
            })}

            {/* All channels overview */}
            <div style={{borderTop:`1px solid ${th.border}`,paddingTop:20,marginTop:8}}>
              <h3 style={{fontWeight:700,marginBottom:12,fontSize:"0.95em",color:th.sub,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                Alle Kanäle (A1–C1)
              </h3>
              {CHANNELS.map((ch,i)=>(
                <a key={i} href={ch.url} target="_blank" rel="noopener noreferrer"
                  style={{...card,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,textDecoration:"none",color:th.text,borderLeft:`3px solid ${ch.color}`}}>
                  <span style={{fontSize:"1.2em"}}>{ch.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:"0.92em"}}>{ch.name}</div>
                    <div style={{color:th.sub,fontSize:"0.78em"}}>{ch.level} · {ch.subs}</div>
                  </div>
                  <Icon name="arrow" size={16} color={th.muted}/>
                </a>
              ))}
            </div>
          </div>}

          {/* EXAM TAB */}
          {tab==="exam"&&<div>
            <div style={{...card,padding:20,marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:"1.05em",marginBottom:4,display:"flex",gap:8,alignItems:"center"}}>
                <Icon name="exam" size={18} color={lc}/> Wähle den Schwierigkeitsgrad
              </div>
              <p style={{color:th.sub,fontSize:"0.88em",marginBottom:16}}>Jedes Level hat unterschiedliche Fragen und Zeitlimits. 60% zum Bestehen.</p>
              {!allLessonsDone()&&<div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
                <Icon name="info" size={15} color="#d97706"/>
                <span style={{color:"#d97706",fontSize:"0.87em",fontWeight:600}}>Empfehlung: Schließe zuerst alle Lektionen ab!</span>
              </div>}
              {DIFFICULTIES.map(d=>(
                <div key={d.key} onClick={()=>startExam(d.key)}
                  style={{...card,padding:"16px 18px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${d.color}`,transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>
                  <div style={{width:44,height:44,background:d.color,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name={d.icon} size={22} color="#fff"/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:"1em",marginBottom:2}}>{d.label}</div>
                    <div style={{color:th.sub,fontSize:"0.82em",marginBottom:4}}>{d.desc}</div>
                    <div style={{display:"flex",gap:12,color:th.muted,fontSize:"0.8em"}}>
                      <span style={{display:"flex",gap:4,alignItems:"center"}}><Icon name="clock" size={12} color={th.muted}/>{Math.floor(d.time/60)} Min.</span>
                      <span style={{display:"flex",gap:4,alignItems:"center"}}><Icon name="exam" size={12} color={th.muted}/>{(EXAMS[lvl][d.key]||[]).length} Fragen</span>
                    </div>
                  </div>
                  <Icon name="arrow" size={17} color={th.muted}/>
                </div>
              ))}
              {passedLevels[lvl]&&<div style={{marginTop:16,background:"#dcfce7",border:"1px solid #bbf7d0",borderRadius:12,padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>
                <Icon name="trophy" size={20} color="#16a34a"/>
                <div>
                  <div style={{fontWeight:700,color:"#16a34a"}}>Bestanden!</div>
                  <div style={{color:"#15803d",fontSize:"0.85em"}}>Level: {DIFFICULTIES.find(d=>d.key===passedLevels[lvl])?.label}</div>
                </div>
              </div>}
            </div>
          </div>}
        </div>
      </div>
    );
  }

  // ══ HOME ══════════════════════════════════════════════════════
  const totalLessons = LEVELS.reduce((a,l)=>a+CUR[l].length,0);
  const doneTotalLessons = Object.values(doneLessons).filter(Boolean).length;
  const passedCount = LEVELS.filter(l=>passedLevels[l]).length;

  return (
    <div style={{minHeight:"100vh",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
      <div style={{background:th.nav,borderBottom:`1px solid ${th.border}`,padding:"14px 24px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50,boxShadow:th.shadow}}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="book" size={18} color="#fff"/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:"1.05em",lineHeight:1}}>Goethe Deutsch</div>
          <div style={{color:th.sub,fontSize:"0.75em",display:"flex",alignItems:"center",gap:6}}>
            A1 bis C1 · {totalLessons} Lektionen
            {isAdmin && <span style={{background:"#fef3c7",color:"#d97706",borderRadius:5,padding:"1px 7px",fontWeight:700,fontSize:"0.85em"}}>ADMIN</span>}
          </div>
        </div>
        <button onClick={()=>setDark(v=>!v)} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,padding:"8px 12px"}}>
          <Icon name={dark?"sun":"moon"} size={16} color={th.text}/>
        </button>
        <button onClick={()=>{setLoggedIn(false);save({...load(),loggedIn:false});}} style={{...btn(th.input,th.text),border:`1px solid ${th.border}`,padding:"8px 12px"}}>
          <Icon name="lock" size={16} color={th.text}/>
        </button>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:"24px 16px"}}>
        <div style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",borderRadius:20,padding:"28px",marginBottom:24,color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:130,height:130,background:"rgba(255,255,255,0.07)",borderRadius:"50%"}}/>
          <h1 style={{margin:"0 0 6px",fontSize:"1.5em",fontWeight:800}}>Willkommen zurück!</h1>
          <p style={{margin:"0 0 20px",opacity:0.85,fontSize:"0.93em"}}>Bereite dich auf deine Goethe-Prüfung vor – von A1 bis C1</p>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[{i:"book",v:`${doneTotalLessons}/${totalLessons}`,l:"Lektionen"},{i:"trophy",v:`${passedCount}/5`,l:"Bestanden"},{i:"star",v:LEVELS[passedCount]||"C1✓",l:"Aktuelles Niveau"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 16px",display:"flex",gap:10,alignItems:"center"}}>
                <Icon name={s.i} size={18} color="#fff"/>
                <div><div style={{fontWeight:800,fontSize:"1.1em",lineHeight:1}}>{s.v}</div><div style={{fontSize:"0.75em",opacity:0.8}}>{s.l}</div></div>
              </div>
            ))}
          </div>
        </div>
        <h2 style={{fontWeight:800,fontSize:"1.05em",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <Icon name="structure" size={17} color={th.sub}/> Niveaustufen
        </h2>
        {LEVELS.map((l,idx)=>{
          const c=LC[l]; const passed=passedLevels[l];
          const locked = isAdmin ? false : (idx>0&&!passedLevels[LEVELS[idx-1]]);
          const done=CUR[l].filter((_,i)=>doneLessons[`${l}-${i}`]).length;
          const total=CUR[l].length; const pct=Math.round((done/total)*100);
          return <div key={l} onClick={()=>{if(!locked){setLvl(l);setScreen("level");setTab("lessons");}}}
            style={{...card,padding:"16px 20px",marginBottom:12,cursor:locked?"not-allowed":"pointer",opacity:locked?0.55:1,display:"flex",alignItems:"center",gap:16,borderLeft:`4px solid ${locked?th.border:c}`,transition:"transform 0.15s,box-shadow 0.15s"}}
            onMouseEnter={e=>{if(!locked){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${c}33`;}}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=th.shadow;}}>
            <div style={{width:52,height:52,background:locked?th.input:c,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {locked?<Icon name="lock" size={22} color={th.muted}/>:passed?<Icon name="trophy" size={22} color="#fff"/>:<span style={{color:"#fff",fontWeight:900,fontSize:"1.1em"}}>{l}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontWeight:800}}>{l} – {LD[l]}</span>
                {passed&&<span style={{background:"#dcfce7",color:"#16a34a",borderRadius:6,padding:"2px 8px",fontSize:"0.75em",fontWeight:700,display:"flex",gap:3,alignItems:"center"}}><Icon name="check" size={11} color="#16a34a"/>Bestanden</span>}
                {locked&&<span style={{background:th.input,color:th.muted,borderRadius:6,padding:"2px 8px",fontSize:"0.75em",fontWeight:700,display:"flex",gap:3,alignItems:"center"}}><Icon name="lock" size={11} color={th.muted}/>Gesperrt</span>}
              </div>
              <div style={{color:th.sub,fontSize:"0.8em",marginBottom:locked?0:6}}>{total} Lektionen · 4 Prüfungslevel</div>
              {!locked&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,background:th.border,borderRadius:6,height:5}}>
                  <div style={{background:c,borderRadius:6,height:5,width:`${pct}%`,transition:"width 0.4s"}}/>
                </div>
                <span style={{color:th.sub,fontSize:"0.78em",whiteSpace:"nowrap"}}>{done}/{total}</span>
              </div>}
            </div>
            {!locked&&<Icon name="arrow" size={19} color={th.muted}/>}
          </div>;
        })}
      </div>
    </div>
  );
}