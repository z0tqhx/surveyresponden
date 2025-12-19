import { notFound } from "next/navigation";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { PublicSurveyForm } from "./public-survey-form";

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

export default async function SurveyPublicPage({ params }: PageProps) {
  const { surveyId, surveySlug } = await params;

  if (!surveyId || !surveySlug) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const url = `${baseUrl}/api/surveys/slug/${encodeURIComponent(
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
  const description = (survey["description"] as string | undefined) ?? "";

  if (!isActive) {
    return (
      <Box bg="gray.50" minH="100vh" py={10}>
        <Container maxW="2xl">
          <VStack align="stretch" gap={3}>
            <Heading size="lg">{title}</Heading>
            {description ? <Text color="gray.600">{description}</Text> : null}
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
            <Heading size="lg">{title}</Heading>
            {description ? <Text color="gray.600" mt={1}>{description}</Text> : null}
          </Box>
          <PublicSurveyForm surveyId={surveyId} survey={survey} baseUrl={baseUrl} />
        </VStack>
      </Container>
    </Box>
  );
}
