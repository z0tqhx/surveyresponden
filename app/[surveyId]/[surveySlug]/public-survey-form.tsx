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

  const [consent, setConsent] = React.useState<boolean>(false);
  const [respondent, setRespondent] = React.useState({
    name: "",
    job: "",
    gender: "",
    age: "",
    education: "",
  });

  const jobOptions = React.useMemo(
    () =>
      [
        "Tidak bekerja",
        "Pelajar/Mahasiswa",
        "Pegawai Pemerintah",
        "Pegawai Swasta",
        "Wiraswasta",
      ],
    []
  );

  const educationOptions = React.useMemo(
    () =>
      [
        "Tidak Sekolah / Tidak Tamat SD",
        "SD",
        "SMP",
        "SMA",
        "D1/D2",
        "D3",
        "D4/S1",
        "S2",
        "S3",
      ],
    []
  );

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
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState<string>("");
  const [alertMessage, setAlertMessage] = React.useState<string>("");

  const answerOptions = React.useMemo(
    () => ["Setuju", "Netral", "Tidak Setuju"] as const,
    []
  );

  function openAlert(title: string, message: string) {
    setSubmitError(null);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ageNum = respondent.age ? Number(respondent.age) : NaN;
    const respondentIncomplete =
      respondent.name.trim().length === 0 ||
      respondent.job.trim().length === 0 ||
      respondent.gender.trim().length === 0 ||
      respondent.education.trim().length === 0 ||
      !Number.isFinite(ageNum) ||
      ageNum <= 0;

    if (respondentIncomplete) {
      openAlert(
        "Data responden belum lengkap",
        "Data responden ada yang belum di isi. Silakan lengkapi data responden terlebih dulu."
      );
      return;
    }

    if (!consent) {
      openAlert("Persetujuan diperlukan", "Silakan centang kotak persetujuan.");
      return;
    }

    const missingAnswerIds = Object.keys(responses).filter(
      (id) => (responses[id] ?? "").trim().length === 0
    );
    if (missingAnswerIds.length > 0) {
      openAlert("Survey belum lengkap", "Ada survey yang belum di isi. Silakan lengkapi jawaban terlebih dulu.");
      return;
    }

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

    const url = `/api/surveys/${encodeURIComponent(surveyId)}/responses`;

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
        if (res.status === 400 && text.includes("Consent")) {
          openAlert("Persetujuan diperlukan", "Silakan centang kotak persetujuan.");
          return;
        }
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
    }, 1000);
    return () => window.clearTimeout(t);
  }, [router, successOpen]);

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" borderWidth="1px" borderRadius="md" p={6}>
      <VStack align="stretch" gap={6}>
        <Dialog.Root open={alertOpen} onOpenChange={(e) => setAlertOpen(Boolean(e.open))}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{alertTitle}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="gray.600">{alertMessage}</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setAlertOpen(false)}>
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        <Dialog.Root open={successOpen} onOpenChange={(e) => setSuccessOpen(Boolean(e.open))}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Data berhasil disimpan</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4} py={2}>
                  <Box width={{ base: "120px", md: "140px" }} height={{ base: "120px", md: "140px" }}>
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      aria-label="Success"
                      role="img"
                    >
                      <path
                        d="M100 8c50.8 0 92 41.2 92 92s-41.2 92-92 92S8 150.8 8 100 49.2 8 100 8z"
                        fill="#37B24D"
                      />
                      <circle cx="100" cy="100" r="62" fill="#9AE6B4" opacity="0.9" />
                      <circle cx="100" cy="100" r="52" fill="#A7F3D0" opacity="0.55" />
                      <path
                        d="M82 106l-16-16a8 8 0 0 0-11 11l22 22a8 8 0 0 0 11 0l54-54a8 8 0 0 0-11-11l-49 49z"
                        fill="#F59E0B"
                        stroke="#1F2A44"
                        strokeWidth="10"
                        strokeLinejoin="round"
                      />
                      <circle cx="100" cy="100" r="62" fill="none" stroke="#1F2A44" strokeWidth="10" />
                    </svg>
                  </Box>

                  <Text color="gray.600" textAlign="center">
                    Terima kasih! Kamu akan diarahkan otomatis.
                  </Text>
                </VStack>
              </Dialog.Body>
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
                list="job-options"
              />
              <datalist id="job-options">
                {jobOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </Field.Root>

            <Field.Root>
              <Field.Label>Jenis Kelamin</Field.Label>
              <Box
                borderWidth="1px"
                borderRadius="md"
                px={3}
                h="40px"
                bg="white"
                display="flex"
                alignItems="center"
              >
                <select
                  value={respondent.gender}
                  onChange={(e) =>
                    setRespondent((s) => ({ ...s, gender: e.target.value }))
                  }
                  style={{ width: "100%", background: "transparent", outline: "none" }}
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </Box>
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
                list="education-options"
              />
              <datalist id="education-options">
                {educationOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
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
                                      setResponses((s) => ({
                                        ...s,
                                        [id]: s[id] === opt ? "" : opt,
                                      }))
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
