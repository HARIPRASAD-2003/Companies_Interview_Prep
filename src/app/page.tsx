import React from "react";
import {QuestionsTable} from "./QuestionsTable";
export default async function HomePage() {
  // Load JSON data at build time (server component)
  // If JSON files are in /public/data/, you can fetch them like this:
  const [questionsData, companiesData] = await Promise.all([
    import("../../public/data/leetcode.json").then((mod) => mod.default || mod),
    import("../../public/data/companies.json").then((mod) => mod.default || mod),
  ]);

  // We'll use client state, so wrap below in a client component or use useState inside a nested component.

  return <QuestionsTable questionsData={questionsData} companiesData={companiesData} />;
}
