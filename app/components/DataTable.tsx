"use client";

import {
  Box,
  Button,
  HStack,
  Input,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

export type Person = {
  id: string;
  name: string;
  email: string;
  age: number;
  status: "Active" | "Inactive";
};

const defaultData: Person[] = [
  {
    id: "1",
    name: "Andi Wijaya",
    email: "andi@example.com",
    age: 28,
    status: "Active",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@example.com",
    age: 34,
    status: "Inactive",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@example.com",
    age: 22,
    status: "Active",
  },
  {
    id: "4",
    name: "Rina Kartika",
    email: "rina@example.com",
    age: 29,
    status: "Active",
  },
  {
    id: "5",
    name: "Dewi Lestari",
    email: "dewi@example.com",
    age: 41,
    status: "Inactive",
  },
];

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "age",
    header: "Umur",
    cell: (info) => info.getValue<number>(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue<string>(),
  },
];

export function DataTable({ data = defaultData }: { data?: Person[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box width="full">
      <HStack justify="space-between" align="center" gap={3} mb={4}>
        <Input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Cari (nama/email/status)..."
          maxW="360px"
        />
        <HStack gap={2}>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="outline"
          >
            Prev
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
          >
            Next
          </Button>
        </HStack>
      </HStack>

      <Table.ScrollArea borderWidth="1px" borderRadius="md">
        <Table.Root size="sm">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <Table.ColumnHeader
                      key={header.id}
                      cursor={canSort ? "pointer" : "default"}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      userSelect="none"
                    >
                      <HStack gap={2}>
                        <Box>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </Box>
                        <Text as="span" fontSize="xs" color="gray.500">
                          {sortDir === "asc" ? "↑" : sortDir === "desc" ? "↓" : ""}
                        </Text>
                      </HStack>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <HStack justify="space-between" mt={3}>
        <Text fontSize="sm" color="gray.600">
          Page {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Total row: {table.getFilteredRowModel().rows.length}
        </Text>
      </HStack>
    </Box>
  );
}
