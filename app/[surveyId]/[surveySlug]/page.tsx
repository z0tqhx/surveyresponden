import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { PublicSurveyFormClient } from "./public-survey-form.client";

type PageProps = {
  params: Promise<{ surveyId?: string; surveySlug?: string }>;
};

type UnknownRecord = Record<string, unknown>;

function pickSurveyPayload(json: unknown): UnknownRecord {
  if (!json || typeof json !== "object") return {};
  const obj = json as UnknownRecord;

  const data = obj["data"];
  if (data && typeof data === "object") return data as UnknownRecord;

  const survey = obj["survey"];
  if (survey && typeof survey === "object") return survey as UnknownRecord;

  return obj;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surveyId, surveySlug } = await params;

  if (!surveyId || !surveySlug) {
    return {};
  }

  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  const url = `${origin}/api/surveys/slug/${encodeURIComponent(
    surveyId
  )}/${encodeURIComponent(surveySlug)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (res.status === 404) {
      return {};
    }

    if (!res.ok) {
      return {};
    }

    const json = (await res.json()) as unknown;
    const survey = pickSurveyPayload(json);
    const title = (survey["title"] as string | undefined) ?? "Survey";

    return {
      title,
    };
  } catch {
    return {};
  }
}

export default async function SurveyPublicPage({ params }: PageProps) {
  const { surveyId, surveySlug } = await params;

  if (!surveyId || !surveySlug) {
    notFound();
  }

  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  const url = `${origin}/api/surveys/slug/${encodeURIComponent(
    surveyId
  )}/${encodeURIComponent(surveySlug)}`;

  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Failed to load survey. Status: ${res.status}`);
  }

  const json = (await res.json()) as unknown;
  const survey = pickSurveyPayload(json);

  const isActive = Boolean(survey["is_active"]);
  const title = (survey["title"] as string | undefined) ?? "Survey";

  if (!isActive) {
    return (
      <Box bg="gray.50" minH="100vh" py={10}>
        <Container maxW="2xl">
          <VStack align="stretch" gap={3}>
            <Heading size="lg">Survei : {title}</Heading>
            <Box borderWidth="1px" borderRadius="md" bg="white" p={6}>
              <Heading size="md">Survey dinonaktifkan</Heading>
              <Text mt={2} color="gray.600">
                Survey ini saat ini tidak menerima respon.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="3xl">
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="lg">Survei : {title}</Heading>
          </Box>
          <PublicSurveyFormClient surveyId={surveyId} survey={survey} baseUrl={""} />
        </VStack>
      </Container>
    </Box>
  );
}
