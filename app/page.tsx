import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { DataTable } from "./components/DataTable";

export default function Home() {
  return (
    <HomePage />
  );
}

function HomePage() {
  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="5xl">
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="lg">Contoh Chakra UI + TanStack Table</Heading>
            <Text color="gray.600" mt={1}>
              Kamu bisa ganti data/kolom sesuai kebutuhan survey kamu.
            </Text>
          </Box>
          <DataTable />
        </VStack>
      </Container>
    </Box>
  );
}
