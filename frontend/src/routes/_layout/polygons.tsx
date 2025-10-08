import {
  Box,
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"
import { PolygonsService } from "@/client"
import { PolygonActionsMenu } from "@/components/Common/PolygonActionsMenu"
import PendingPolygons from "@/components/Pending/PendingPolygons"
import AddPolygon from "@/components/Polygons/AddPolygon"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { PolygonMap } from "@/components/Common/PolygonMap"
import { useState } from "react"

const polygonsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getPolygonsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      PolygonsService.readPolygons({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["polygons", { page }],
  }
}

export const Route = createFileRoute("/_layout/polygons")({
  component: Polygons,
  validateSearch: (search) => polygonsSearchSchema.parse(search),
})

function PolygonsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getPolygonsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) => {
    navigate({
      to: "/polygons",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const polygons = data?.data?.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingPolygons />
  }

  if (polygons.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any polygons yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new polygon to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Buffer Size</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {polygons?.map((polygon) => (
            <Table.Row key={polygon.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {polygon.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {polygon.title}
              </Table.Cell>
              <Table.Cell
                color={!polygon.buffer_size ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {polygon.buffer_size || "N/A"}
              </Table.Cell>
              <Table.Cell>
                <PolygonActionsMenu polygon={polygon} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}


function Polygons() {
  const [selectedPolygon, setSelectedPolygon] = useState<any | null>(null)
  return (
    <Container maxW="6xl" py={12}>
      <Heading size="lg" mb={6}>
        Polygons Management
      </Heading>

      {/* Map Section */}
      <Box
        w="100%"
        h="500px"
        mb={8}
        borderRadius="lg"
        overflow="hidden"
        shadow="md"
        position="relative"
      >
        <PolygonMap polygon={selectedPolygon} />
      </Box>

      {/* Add Polygon + Table */}
      <VStack align="stretch">
        <AddPolygon onPolygonSelect={setSelectedPolygon} />
        <PolygonsTable />
      </VStack>
    </Container>
  )
}
