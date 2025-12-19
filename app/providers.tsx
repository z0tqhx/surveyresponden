"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import * as React from "react";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
