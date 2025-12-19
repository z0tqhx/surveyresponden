"use client";

import {
  Box,
  Button,
  Card,
  Dialog,
  Field,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
  Checkbox,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import * as React from "react";

type UnknownRecord = Record<string, unknown>;

type Props = {
  surveyId: string;
  baseUrl: string;
  survey: UnknownRecord;
};

type ResponseItem = {
  sub_aspect_id: string;
  value: string;
};

type CheckedChangeDetails = {
  checked: boolean | "indeterminate";
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getSubAspects(survey: UnknownRecord): Array<UnknownRecord> {
  const aspects = asArray(survey["aspects"]);
  const result: Array<UnknownRecord> = [];

  for (const a of aspects) {
    if (!a || typeof a !== "object") continue;
    const aspect = a as UnknownRecord;

    const subAspects = asArray(aspect["sub_aspects"]);
    for (const sa of subAspects) {
      if (sa && typeof sa === "object") result.push(sa as UnknownRecord);
    }
  }

  const directSubAspects = asArray(survey["sub_aspects"]);
  for (const sa of directSubAspects) {
    if (sa && typeof sa === "object") result.push(sa as UnknownRecord);
  }

  return result;
}

type AspectGroup = {
  name: string;
  subAspects: Array<UnknownRecord>;
};

function getAspectGroups(survey: UnknownRecord): AspectGroup[] {
  const aspects = asArray(survey["aspects"]);
  const groups: AspectGroup[] = [];

  for (const a of aspects) {
    if (!a || typeof a !== "object") continue;
    const aspect = a as UnknownRecord;

    const name =
      asString(aspect["name"]) ||
      asString(aspect["title"]) ||
      asString(aspect["label"]) ||
      "";
    const subAspects = asArray(aspect["sub_aspects"]).filter(
      (x) => x && typeof x === "object"
    ) as Array<UnknownRecord>;

    if (name || subAspects.length > 0) {
      groups.push({ name: name || "Tanpa Judul", subAspects });
    }
  }

  if (groups.length > 0) return groups;

  const flat = getSubAspects(survey);
  if (flat.length > 0) return [{ name: "Pertanyaan", subAspects: flat }];

  return [];
}

export function PublicSurveyForm({ surveyId, baseUrl, survey }: Props) {
  const router = useRouter();
  const aspectGroups = React.useMemo(() => getAspectGroups(survey), [survey]);
  const subAspects = React.useMemo(
    () => aspectGroups.flatMap((g) => g.subAspects),
    [aspectGroups]
  );

  const [consent, setConsent] = React.useState<boolean>(true);
  const [respondent, setRespondent] = React.useState({
    name: "",
    job: "",
    gender: "",
    age: "",
    education: "",
  });

  const [responses, setResponses] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const sa of subAspects) {
      const id = asString(sa["id"] || sa["sub_aspect_id"]);
      if (id) init[id] = "";
    }
    return init;
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitOk, setSubmitOk] = React.useState<string | null>(null);
  const [successOpen, setSuccessOpen] = React.useState(false);

  const answerOptions = React.useMemo(
    () => ["Setuju", "Netral", "Tidak Setuju"] as const,
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);

    const payload = {
      survey_id: surveyId,
      consent,
      respondent: {
        name: respondent.name,
        job: respondent.job,
        gender: respondent.gender,
        age: respondent.age ? Number(respondent.age) : null,
        education: respondent.education,
      },
      responses: Object.entries(responses)
        .filter(([, value]) => value.trim().length > 0)
        .map(([sub_aspect_id, value]) => ({ sub_aspect_id, value } as ResponseItem)),
    };

    const url = `${baseUrl}/api/surveys/${encodeURIComponent(surveyId)}/responses`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Submit gagal. Status: ${res.status}${text ? ` - ${text}` : ""}`);
      }

      setSubmitOk("Terima kasih! Respon kamu sudah tersimpan.");
      setSuccessOpen(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit gagal");
    } finally {
      setSubmitting(false);
    }
  }

  React.useEffect(() => {
    if (!successOpen) return;
    const t = window.setTimeout(() => {
      router.push("/terimakasih");
    }, 1400);
    return () => window.clearTimeout(t);
  }, [router, successOpen]);

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" borderWidth="1px" borderRadius="md" p={6}>
      <VStack align="stretch" gap={6}>
        <Dialog.Root open={successOpen} onOpenChange={(e) => setSuccessOpen(Boolean(e.open))}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Data berhasil disimpan</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="gray.600">
                  Terima kasih! Kamu akan diarahkan ke halaman berikutnya.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  variant="solid"
                  onClick={() => router.push("/terimakasih")}
                >
                  Lanjut
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        <Stack gap={4}>
          <Field.Root>
            <Field.Label>Nama</Field.Label>
            <Input
              value={respondent.name}
              onChange={(e) => setRespondent((s) => ({ ...s, name: e.target.value }))}
              placeholder="Nama"
            />
          </Field.Root>

          <HStack gap={4} align="flex-start">
            <Field.Root>
              <Field.Label>Pekerjaan</Field.Label>
              <Input
                value={respondent.job}
                onChange={(e) => setRespondent((s) => ({ ...s, job: e.target.value }))}
                placeholder="Pekerjaan"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Jenis Kelamin</Field.Label>
              <Input
                value={respondent.gender}
                onChange={(e) => setRespondent((s) => ({ ...s, gender: e.target.value }))}
                placeholder="Laki-laki / Perempuan"
              />
            </Field.Root>
          </HStack>

          <HStack gap={4} align="flex-start">
            <Field.Root>
              <Field.Label>Umur</Field.Label>
              <Input
                value={respondent.age}
                onChange={(e) => setRespondent((s) => ({ ...s, age: e.target.value }))}
                placeholder="25"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Pendidikan</Field.Label>
              <Input
                value={respondent.education}
                onChange={(e) => setRespondent((s) => ({ ...s, education: e.target.value }))}
                placeholder="S1"
              />
            </Field.Root>
          </HStack>

          <Checkbox.Root
            checked={consent}
            onCheckedChange={(details: CheckedChangeDetails) =>
              setConsent(details.checked === true)
            }
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>Saya setuju untuk mengisi survey ini</Checkbox.Label>
          </Checkbox.Root>
        </Stack>

        <Stack gap={4}>
          <Box>
            <Text fontSize="sm" color="gray.600">
              Jawaban standar: Setuju (3), Netral (2), Tidak Setuju (1).
            </Text>
          </Box>

          {aspectGroups.length === 0 ? (
            <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
              <Text fontSize="sm" color="gray.700">
                Struktur pertanyaan tidak ditemukan dari API. Jika kamu kirim contoh JSON response endpoint{" "}
                <Text as="span" fontWeight="bold">
                  Get Survey By Slug
                </Text>
                , aku bisa sesuaikan rendering pertanyaannya.
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" gap={4}>
              {aspectGroups.map((group) => (
                <Card.Root key={group.name} variant="outline">
                  <Card.Body>
                    <VStack align="stretch" gap={4}>
                      <Text fontSize="sm" color="gray.600">
                        {group.name}
                      </Text>

                      <VStack align="stretch" gap={3}>
                        {group.subAspects.map((sa, idx) => {
                          const id = asString(sa["id"] || sa["sub_aspect_id"]);
                          const label =
                            asString(
                              sa["name"] ||
                                sa["title"] ||
                                sa["question"] ||
                                sa["label"]
                            ) || `Pertanyaan (${id})`;

                          const selected = responses[id] ?? "";
                          const notSelected = selected.trim().length === 0;

                          return (
                            <Box
                              key={id || `${group.name}-${idx}`}
                              borderWidth="1px"
                              borderRadius="md"
                              p={4}
                            >
                              <Text fontWeight="semibold">
                                {idx + 1}. {label}
                              </Text>

                              <HStack gap={2} mt={3} flexWrap="wrap">
                                {answerOptions.map((opt) => (
                                  <Button
                                    key={opt}
                                    type="button"
                                    size="sm"
                                    variant={selected === opt ? "solid" : "outline"}
                                    onClick={() =>
                                      setResponses((s) => ({ ...s, [id]: opt }))
                                    }
                                  >
                                    {opt}
                                  </Button>
                                ))}
                              </HStack>

                              {notSelected ? (
                                <Text mt={2} fontSize="xs" color="red.500">
                                  Belum dipilih
                                </Text>
                              ) : null}
                            </Box>
                          );
                        })}
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          )}
        </Stack>

        {submitError ? (
          <Box borderWidth="1px" borderRadius="md" p={3} borderColor="red.300" bg="red.50">
            <Text fontSize="sm" color="red.700">{submitError}</Text>
          </Box>
        ) : null}

        {submitOk ? (
          <Box borderWidth="1px" borderRadius="md" p={3} borderColor="green.300" bg="green.50">
            <Text fontSize="sm" color="green.700">{submitOk}</Text>
          </Box>
        ) : null}

        <Button type="submit" variant="solid" loading={submitting} alignSelf="flex-start">
          Kirim Respon
        </Button>
      </VStack>
    </Box>
  );
}
