import { Box, Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function TerimaKasihPage() {
  return (
    <Box bg="gray.50" minH="100vh" py={{ base: 12, md: 16 }}>
      <Container maxW="lg">
        <Box
          bg="white"
          borderWidth="1px"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
        >
          <VStack align="stretch" gap={5}>
            <Box>
              <Heading size="lg">Terima kasih</Heading>
              <Text color="gray.600" mt={2}>
                Jawaban kamu sudah tersimpan. Kontribusi kamu sangat membantu.
              </Text>
            </Box>

            <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
              <Text fontSize="sm" color="gray.700">
                Kamu boleh menutup halaman ini, atau kembali ke beranda untuk mengisi survey lain.
              </Text>
            </Box>

            <HStack gap={3} flexWrap="wrap">
              <Link href="/" style={{ display: "inline-flex" }}>
                <Button variant="solid">Kembali ke Beranda</Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
