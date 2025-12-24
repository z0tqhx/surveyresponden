"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Field,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
  Heading,
  Separator,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import * as React from "react";
import LiquidEther from "./LiquidEther";

const MotionBox = motion.create(Box);

type ContactFormState = {
  name: string;
  organization: string;
  phoneOrEmail: string;
  needs: string;
};

function useContactForm() {
  const [state, setState] = React.useState<ContactFormState>({
    name: "",
    organization: "",
    phoneOrEmail: "",
    needs: "",
  });

  const [submitted, setSubmitted] = React.useState(false);

  const errors = React.useMemo(() => {
    const next: Partial<Record<keyof ContactFormState, string>> = {};
    if (!state.name.trim()) next.name = "Nama wajib diisi";
    if (!state.phoneOrEmail.trim()) next.phoneOrEmail = "Kontak (Email/WhatsApp) wajib diisi";
    if (!state.needs.trim()) next.needs = "Ceritakan kebutuhan survei kamu";
    return next;
  }, [state]);

  function update<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function reset() {
    setState({ name: "", organization: "", phoneOrEmail: "", needs: "" });
    setSubmitted(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    const subject = encodeURIComponent("Permintaan Penawaran Survei - Survei Kita");
    const body = encodeURIComponent(
      [
        `Nama: ${state.name}`,
        `Instansi/Organisasi: ${state.organization || "-"}`,
        `Kontak (Email/WA): ${state.phoneOrEmail}`,
        "",
        "Kebutuhan:",
        state.needs,
      ].join("\n")
    );

    window.location.href = `mailto:hello@surveikita.id?subject=${subject}&body=${body}`;
  }

  return { state, update, errors, submitted, onSubmit, reset };
}

function SectionHeading(props: { eyebrow?: string; title: string; description?: string }) {
  return (
    <VStack align="start" gap={3} maxW="3xl">
      {props.eyebrow ? (
        <Badge
          colorPalette="green"
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
          letterSpacing="wide"
          textTransform="uppercase"
        >
          {props.eyebrow}
        </Badge>
      ) : null}
      <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" lineHeight="1.15">
        {props.title}
      </Heading>
      {props.description ? (
        <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
          {props.description}
        </Text>
      ) : null}
    </VStack>
  );
}

function NavLink(props: { href: string; label: string }) {
  return (
    <Link href={props.href} style={{ display: "inline-flex" }}>
      <Box
        fontSize="sm"
        fontWeight="semibold"
        color="gray.700"
        px={3}
        py={2}
        borderRadius="md"
        _hover={{ bg: "green.50", color: "green.800" }}
      >
        {props.label}
      </Box>
    </Link>
  );
}

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const contact = useContactForm();
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box bg="gray.50" minH="100vh">
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg="rgba(249, 250, 251, 0.92)"
        backdropFilter="blur(10px)"
        borderBottomWidth="1px"
      >
        <Container maxW="6xl" py={3}>
          <HStack justify="space-between" gap={3}>
            <HStack gap={3} minW={0}>
              <Box
                w="34px"
                h="34px"
                borderRadius="lg"
                bgGradient="linear(to-br, green.600, yellow.400)"
                flexShrink={0}
              />
              <VStack align="start" gap={0} minW={0}>
                <Text fontWeight="extrabold" letterSpacing="tight" truncate>
                  Survei Kita
                </Text>
                <Text fontSize="xs" color="gray.600" truncate>
                  Agency Survei • Riset • Insight
                </Text>
              </VStack>
            </HStack>

            <HStack gap={1} display={{ base: "none", md: "flex" }}>
              <NavLink href="#layanan" label="Layanan" />
              <NavLink href="#testimoni" label="Testimoni" />
              <NavLink href="#tentang" label="Tentang" />
              <NavLink href="#kontak" label="Kontak" />
            </HStack>

            <HStack gap={2}>
              <Link href="#kontak" style={{ display: "inline-flex" }}>
                <Button colorPalette="green" variant="solid" size="sm">
                  Konsultasi Gratis
                </Button>
              </Link>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Box position="relative" overflow="hidden">
        <Box position="absolute" inset={0} zIndex={0}>
          <LiquidEther intensity={0.95} />
        </Box>

        <MotionBox
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, green.50, gray.50)"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.7 }}
        />

        <MotionBox
          position="absolute"
          top={{ base: "-180px", md: "-230px" }}
          left={{ base: "-180px", md: "-230px" }}
          w={{ base: "340px", md: "460px" }}
          h={{ base: "340px", md: "460px" }}
          borderRadius="full"
          bg="green.200"
          filter="blur(70px)"
          opacity={0.75}
          animate={reduceMotion ? undefined : { x: [0, 25, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <MotionBox
          position="absolute"
          bottom={{ base: "-220px", md: "-280px" }}
          right={{ base: "-220px", md: "-280px" }}
          w={{ base: "380px", md: "520px" }}
          h={{ base: "380px", md: "520px" }}
          borderRadius="full"
          bg="yellow.200"
          filter="blur(80px)"
          opacity={0.6}
          animate={reduceMotion ? undefined : { x: [0, -22, 0], y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <Container maxW="6xl" position="relative" pt={{ base: 12, md: 16 }} pb={{ base: 10, md: 14 }}>
          <MotionBox
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 10, md: 12 }} alignItems="center">
              <VStack align="start" gap={6}>
                <HStack gap={2} flexWrap="wrap">
                  <Badge colorPalette="green" variant="subtle" px={3} py={1} borderRadius="full">
                    Respons cepat (H+1)
                  </Badge>
                  <Badge colorPalette="yellow" variant="subtle" px={3} py={1} borderRadius="full">
                    Gold-standard QC
                  </Badge>
                  <Badge colorPalette="gray" variant="subtle" px={3} py={1} borderRadius="full">
                    Data siap presentasi
                  </Badge>
                </HStack>

                <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="tight" lineHeight="1.12">
                  Survei yang rapi,
                  <Box as="span" color="green.700">
                    {" "}insight yang bisa ditindaklanjuti
                  </Box>
                </Heading>

                <Text color="gray.600" fontSize={{ base: "md", md: "lg" }} maxW="2xl">
                  Survei Kita membantu instansi, brand, dan komunitas mengumpulkan data yang akurat—mulai dari desain kuesioner,
                  distribusi responden, hingga laporan visual yang mudah dipahami.
                </Text>

                <HStack gap={3} flexWrap="wrap">
                  <Link href="#kontak" style={{ display: "inline-flex" }}>
                    <Button colorPalette="green" size="lg">
                      Minta Proposal
                    </Button>
                  </Link>
                  <Link href="#layanan" style={{ display: "inline-flex" }}>
                    <Button variant="outline" size="lg">
                      Lihat Layanan
                    </Button>
                  </Link>
                </HStack>

                <HStack gap={6} flexWrap="wrap" color="gray.700">
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold">500+ responden</Text>
                    <Text fontSize="sm" color="gray.600">
                      Jaringan panel fleksibel
                    </Text>
                  </VStack>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold">QC berlapis</Text>
                    <Text fontSize="sm" color="gray.600">
                      Duplikasi & outlier check
                    </Text>
                  </VStack>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold">Laporan ringkas</Text>
                    <Text fontSize="sm" color="gray.600">
                      Slide + ringkasan insight
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <Card.Root
                bg="white"
                borderWidth="1px"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="sm"
              >
                <Card.Body p={{ base: 5, md: 6 }}>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between" align="start" gap={3}>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold">Contoh output</Text>
                        <Text fontSize="sm" color="gray.600">
                          Ringkasan siap stakeholder
                        </Text>
                      </VStack>
                      <Badge colorPalette="orange" variant="solid" borderRadius="full" px={3} py={1}>
                        Premium
                      </Badge>
                    </HStack>

                    <Box borderWidth="1px" borderRadius="xl" p={4} bg="gray.50">
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            NPS (Kepuasan)
                          </Text>
                          <Text fontWeight="bold" color="green.700">
                            62
                          </Text>
                        </HStack>
                        <Box h="10px" borderRadius="full" bg="gray.200" overflow="hidden">
                          <Box h="10px" w="62%" bgGradient="linear(to-r, green.600, yellow.400)" />
                        </Box>
                        <Separator />
                        <Text fontSize="sm" color="gray.700">
                          Insight utama: responden paling puas pada "kemudahan layanan". Perbaikan prioritas: "kecepatan respons".
                        </Text>
                      </VStack>
                    </Box>

                    <SimpleGrid columns={2} gap={3}>
                      <Box borderWidth="1px" borderRadius="xl" p={3} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Waktu pengerjaan
                        </Text>
                        <Text fontWeight="bold">3-7 hari</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={3} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Metode
                        </Text>
                        <Text fontWeight="bold">Online / Hybrid</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={3} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Output
                        </Text>
                        <Text fontWeight="bold">Slide + Excel</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={3} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Support
                        </Text>
                        <Text fontWeight="bold">Review 1x</Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 12, md: 16 }} id="layanan">
        <VStack align="stretch" gap={8}>
          <SectionHeading
            eyebrow="Service Overview"
            title="Layanan end-to-end untuk survei yang kredibel"
            description="Kami bantu dari nol sampai laporan. Kamu fokus pada keputusan, kami urus eksekusi dan kualitas datanya."
          />

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                title: "Desain kuesioner",
                desc: "Struktur pertanyaan, skala, logika, dan wording yang netral agar hasilnya valid.",
              },
              {
                title: "Distribusi responden",
                desc: "Panel, komunitas, internal database, atau target spesifik (demografi/segmentasi).",
              },
              {
                title: "Analisis & laporan",
                desc: "Tabulasi, cross-tab, insight, dan rekomendasi yang siap dipresentasikan.",
              },
            ].map((item) => (
              <Card.Root
                key={item.title}
                bg="white"
                borderWidth="1px"
                borderRadius="2xl"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                transition="all 0.18s ease"
              >
                <Card.Body p={6}>
                  <VStack align="start" gap={3}>
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="xl"
                      bg="green.50"
                      borderWidth="1px"
                      borderColor="green.100"
                    />
                    <Text fontWeight="bold" fontSize="lg">
                      {item.title}
                    </Text>
                    <Text color="gray.600">{item.desc}</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      <Container maxW="6xl" py={{ base: 12, md: 16 }} id="testimoni">
        <VStack align="stretch" gap={8}>
          <SectionHeading
            eyebrow="Testimonials"
            title="Dipercaya untuk keputusan penting"
            description="Beberapa contoh feedback dari tim yang membutuhkan data cepat dan bisa dipertanggungjawabkan."
          />

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {[
              {
                quote:
                  "Brief kami kompleks tapi tim Survei Kita bisa menyederhanakan jadi kuesioner yang rapi. Laporan enak dibaca, insight-nya actionable.",
                name: "Head of Marketing",
                org: "Brand FMCG",
              },
              {
                quote:
                  "Responden terkumpul tepat waktu, QC-nya ketat. Kami pakai hasilnya untuk bahan presentasi ke stakeholder tanpa revisi besar.",
                name: "Program Manager",
                org: "NGO / Komunitas",
              },
              {
                quote:
                  "Yang paling membantu: konsultasi interpretasi hasil. Jadi bukan cuma angka, tapi arahan langkah berikutnya.",
                name: "Product Lead",
                org: "Startup",
              },
            ].map((t) => (
              <Card.Root key={t.name} bg="white" borderWidth="1px" borderRadius="2xl" boxShadow="sm">
                <Card.Body p={6}>
                  <VStack align="start" gap={4}>
                    <Text color="gray.700">“{t.quote}”</Text>
                    <Separator />
                    <VStack align="start" gap={0}>
                      <Text fontWeight="bold">{t.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {t.org}
                      </Text>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      <Box bg="white" borderTopWidth="1px" id="tentang">
        <Container maxW="6xl" py={{ base: 12, md: 16 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 10, md: 12 }} alignItems="start">
            <SectionHeading
              eyebrow="About Us"
              title="Riset yang manusiawi, metodologi yang disiplin"
              description="Kami percaya riset bukan sekadar kumpul data. Cara bertanya yang tepat membuat responden nyaman—dan hasilnya lebih jujur."
            />

            <VStack align="stretch" gap={4}>
              <Card.Root bg="gray.50" borderWidth="1px" borderRadius="2xl">
                <Card.Body p={6}>
                  <VStack align="stretch" gap={3}>
                    <Text fontWeight="bold">Apa yang membedakan Survei Kita?</Text>
                    <Text color="gray.700">
                      Kami menggabungkan praktik UX research, survei sosial, dan analisis data untuk menghasilkan insight yang benar-benar berguna.
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                      <Box borderWidth="1px" borderRadius="xl" p={4} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Etika & privasi
                        </Text>
                        <Text fontWeight="bold">Diutamakan</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={4} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Metode
                        </Text>
                        <Text fontWeight="bold">Transparan</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={4} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Data quality
                        </Text>
                        <Text fontWeight="bold">QC berlapis</Text>
                      </Box>
                      <Box borderWidth="1px" borderRadius="xl" p={4} bg="white">
                        <Text fontSize="xs" color="gray.600">
                          Output
                        </Text>
                        <Text fontWeight="bold">Siap keputusan</Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: 12, md: 16 }} id="kontak">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 10, md: 12 }} alignItems="start">
          <VStack align="stretch" gap={6}>
            <SectionHeading
              eyebrow="Contact"
              title="Ceritakan kebutuhan survei kamu"
              description="Isi form ini untuk konsultasi gratis. Kami akan membantu merekomendasikan metode, jumlah responden, dan output yang paling pas."
            />

            <Card.Root bg="white" borderWidth="1px" borderRadius="2xl" boxShadow="sm">
              <Card.Body p={6}>
                <Stack as="form" gap={4} onSubmit={contact.onSubmit}>
                  <Field.Root invalid={contact.submitted && Boolean(contact.errors.name)}>
                    <Field.Label>Nama</Field.Label>
                    <Input
                      value={contact.state.name}
                      onChange={(e) => contact.update("name", e.target.value)}
                      placeholder="Nama lengkap"
                    />
                    <Field.ErrorText>{contact.errors.name}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Instansi / Organisasi</Field.Label>
                    <Input
                      value={contact.state.organization}
                      onChange={(e) => contact.update("organization", e.target.value)}
                      placeholder="Contoh: Dinas, Brand, Komunitas"
                    />
                  </Field.Root>

                  <Field.Root invalid={contact.submitted && Boolean(contact.errors.phoneOrEmail)}>
                    <Field.Label>Kontak (Email / WhatsApp)</Field.Label>
                    <Input
                      value={contact.state.phoneOrEmail}
                      onChange={(e) => contact.update("phoneOrEmail", e.target.value)}
                      placeholder="contoh@email.com / 08xxxx"
                    />
                    <Field.ErrorText>{contact.errors.phoneOrEmail}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={contact.submitted && Boolean(contact.errors.needs)}>
                    <Field.Label>Kebutuhan survei</Field.Label>
                    <Textarea
                      value={contact.state.needs}
                      onChange={(e) => contact.update("needs", e.target.value)}
                      placeholder="Contoh: Survei kepuasan layanan, 300 responden, target warga kota X, butuh laporan PPT"
                      minH="120px"
                    />
                    <Field.ErrorText>{contact.errors.needs}</Field.ErrorText>
                  </Field.Root>

                  <HStack gap={3} flexWrap="wrap">
                    <Button type="submit" colorPalette="green">
                      Kirim via Email
                    </Button>
                    <Button type="button" variant="outline" onClick={contact.reset}>
                      Reset
                    </Button>
                  </HStack>

                  <Text fontSize="xs" color="gray.600">
                    Dengan mengirim, kamu setuju kami menghubungi lewat kontak yang kamu berikan.
                  </Text>
                </Stack>
              </Card.Body>
            </Card.Root>
          </VStack>

          <VStack align="stretch" gap={5}>
            <Card.Root bg="white" borderWidth="1px" borderRadius="2xl" boxShadow="sm">
              <Card.Body p={6}>
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="bold">Estimasi proses</Text>
                  {["Konsultasi kebutuhan (15-30 menit)", "Draft kuesioner + sampling plan", "Pengumpulan respon", "Analisis + laporan"].map(
                    (s) => (
                      <HStack key={s} gap={3} align="start">
                        <Box
                          mt={1}
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bgGradient="linear(to-br, green.600, yellow.400)"
                          flexShrink={0}
                        />
                        <Text color="gray.700" fontSize="sm">
                          {s}
                        </Text>
                      </HStack>
                    )
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="gray.900" borderRadius="2xl" color="white">
              <Card.Body p={6}>
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="bold">Butuh cepat?</Text>
                  <Text color="gray.200" fontSize="sm">
                    Kirim brief singkat, kami balas dengan rekomendasi paket & timeline.
                  </Text>
                  <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ display: "inline-flex" }}>
                    <Button colorPalette="green" variant="solid">
                      Chat WhatsApp
                    </Button>
                  </a>
                  <Text fontSize="xs" color="gray.300">
                    Ganti link WhatsApp sesuai nomor admin kamu.
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>
        </SimpleGrid>
      </Container>

      <Box borderTopWidth="1px" bg="white">
        <Container maxW="6xl" py={8}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="start">
            <VStack align="start" gap={2}>
              <Text fontWeight="extrabold">Survei Kita</Text>
              <Text fontSize="sm" color="gray.600">
                Landing page statis untuk kebutuhan survei, riset, dan insight.
              </Text>
            </VStack>
            <VStack align="start" gap={2}>
              <Text fontWeight="bold">Kontak</Text>
              <Text fontSize="sm" color="gray.600">
                Email: hello@surveikita.id
              </Text>
              <Text fontSize="sm" color="gray.600">
                Jakarta, Indonesia
              </Text>
            </VStack>
          </SimpleGrid>

          <Separator mt={8} />
          <Text mt={4} fontSize="xs" color="gray.500" suppressHydrationWarning>
            © {year ?? ""} Survei Kita. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
