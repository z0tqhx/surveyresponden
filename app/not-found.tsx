"use client";

import { Box, Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box bg="gray.50" minH="100vh" py={16}>
      <Container maxW="lg">
        <VStack align="stretch" gap={4}>
          <Heading size="lg">Halaman tidak ditemukan</Heading>
          <Text color="gray.600">
            Survey atau halaman yang kamu cari tidak tersedia.
          </Text>
          <Link href="/" style={{ alignSelf: "flex-start" }}>
            <Button variant="outline">Kembali ke Beranda</Button>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
