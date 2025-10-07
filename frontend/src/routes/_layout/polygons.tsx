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
import { useEffect } from "react"
import { FiSearch } from "react-icons/fi"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
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

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 200)
  }, [map])
  return null
}

function Polygons() {
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
        <MapContainer
          center={[59.33126388211133, 18.081407431369865]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <MapResizer />
        </MapContainer>
      </Box>

      {/* Add Polygon + Table */}
      <VStack align="stretch">
        <AddPolygon />
        <PolygonsTable />
      </VStack>
    </Container>
  )
}
