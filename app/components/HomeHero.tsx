"use client";

import { Badge, Box, Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";

const MotionBox = motion.create(Box);

export function HomeHero() {
  return (
    <Box position="relative" overflow="hidden" bg="gray.50" minH={{ base: "70vh", md: "78vh" }}>
      <MotionBox
        position="absolute"
        inset={0}
        bgGradient="linear(to-b, green.50, gray.50)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      <MotionBox
        position="absolute"
        top={{ base: "-140px", md: "-180px" }}
        left={{ base: "-140px", md: "-180px" }}
        w={{ base: "280px", md: "360px" }}
        h={{ base: "280px", md: "360px" }}
        borderRadius="full"
        bg="green.200"
        filter="blur(50px)"
        opacity={0.7}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <MotionBox
        position="absolute"
        bottom={{ base: "-170px", md: "-220px" }}
        right={{ base: "-170px", md: "-220px" }}
        w={{ base: "320px", md: "420px" }}
        h={{ base: "320px", md: "420px" }}
        borderRadius="full"
        bg="blue.200"
        filter="blur(60px)"
        opacity={0.55}
        animate={{
          x: [0, -25, 0],
          y: [0, -18, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container maxW="6xl" position="relative" py={{ base: 12, md: 16 }}>
        <MotionBox
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <VStack align="stretch" gap={6}>
            <HStack gap={2} flexWrap="wrap">
              <Badge colorPalette="green" variant="subtle" px={3} py={1} borderRadius="full">
                Survey dari rakyat untuk rakyat
              </Badge>
              <Badge colorPalette="blue" variant="subtle" px={3} py={1} borderRadius="full">
                Terpercaya
              </Badge>
              <Badge colorPalette="purple" variant="subtle" px={3} py={1} borderRadius="full">
                Independen
              </Badge>
            </HStack>

            <Heading size={{ base: "2xl", md: "3xl" }} lineHeight="1.15" letterSpacing="tight">
              Suara publik yang jujur,
              <Box as="span" color="green.600"> data yang bisa dipercaya</Box>
            </Heading>

            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="2xl">
              Platform survey yang membantu mengumpulkan aspirasi masyarakat secara transparan.
              Setiap jawaban dihargai, setiap masukan berarti.
            </Text>

            <HStack gap={3} flexWrap="wrap">
              <Link href="/" style={{ display: "inline-flex" }}>
                <Button variant="solid" colorPalette="green">
                  Mulai
                </Button>
              </Link>
              <Link href="/terimakasih" style={{ display: "inline-flex" }}>
                <Button variant="outline">Lihat Contoh Halaman</Button>
              </Link>
            </HStack>

            <MotionBox
              mt={{ base: 6, md: 8 }}
              bg="white"
              borderWidth="1px"
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
              maxW="3xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            >
              <Text fontSize="sm" color="gray.700">
                Akses survey publik lewat URL:
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                <Box as="span" fontFamily="mono" bg="gray.50" px={2} py={1} borderRadius="md" borderWidth="1px">
                  http://localhost:3005/&lt;surveyId&gt;/&lt;surveySlug&gt;
                </Box>
              </Text>
            </MotionBox>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
}
