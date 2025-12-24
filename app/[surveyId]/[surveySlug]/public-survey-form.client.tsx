"use client";

import dynamic from "next/dynamic";
import * as React from "react";

type UnknownRecord = Record<string, unknown>;

type Props = {
  surveyId: string;
  baseUrl: string;
  survey: UnknownRecord;
};

const PublicSurveyForm = dynamic(
  () => import("./public-survey-form").then((m) => m.PublicSurveyForm),
  { ssr: false }
);

export function PublicSurveyFormClient(props: Props) {
  return <PublicSurveyForm {...props} />;
}
