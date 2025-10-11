import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"

import { type PolygonCreate, PolygonsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

type PolygonForm = PolygonCreate & {
  title: string
  buffer_size: number
  externalPolygon: number
  coordinates?: string
  positionindicator?: string
}

type ExternalPolygon = {
  msid: number
  nameofarea: string
  positionindicator?: string
  geom?: string
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
const useExternalPolygons = () => {
  return useQuery({
    queryKey: ["external-polygons"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/aip-polygons/`)
      if (!res.ok) throw new Error("Failed to fetch external polygons")
      return res.json()
    },
  })
}

const AddPolygon = ({ onPolygonSelect }: { onPolygonSelect?: (poly: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { data: externalPolygons, isLoading } = useExternalPolygons()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PolygonForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      buffer_size: 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PolygonCreate) =>
      PolygonsService.createPolygon({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Polygon created successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["polygons"] })
    },
  })

  const onSubmit: SubmitHandler<PolygonForm> = (data) => {
    const selectedPolygon = externalPolygons.find(
      (p: ExternalPolygon) => p.msid === Number(data.externalPolygon),
    )
    if (!selectedPolygon) return
    onPolygonSelect?.(selectedPolygon)
    console.log(`Selected Polygon: ${selectedPolygon.geom}`)

    const payload: PolygonCreate = {
      title: selectedPolygon.nameofarea,
      buffer_size: Number(data.buffer_size),
      coordinates: selectedPolygon.geom!,
      positionindicator: selectedPolygon.positionindicator || "",
    }
    console.log(payload)
    mutation.mutate(payload)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-item" my={4}>
          <FaPlus fontSize="16px" />
          Add Polygon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Polygon</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new polygon.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.externalPolygon}
                errorText={errors.externalPolygon?.message}
                label="Select Polygon"
              >
                {isLoading ? (
                  <Text>Loading polygons...</Text>
                ) : (
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register("externalPolygon")}
                      onChange={(e) => {
                        const selected = externalPolygons.find((p: ExternalPolygon) => p.msid === Number(e.target.value))
                        if (selected) onPolygonSelect?.(selected)
                      }}
                      placeholder="Choose a polygon"
                    >
                      {externalPolygons
                        ?.slice()
                        .map((poly: any) => (
                          <option key={poly.msid} value={poly.msid}>
                            {poly.nameofarea}
                          </option>
                        ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                )}
              </Field>
              <Field
                invalid={!!errors.buffer_size}
                errorText={errors.buffer_size?.message}
                label="buffer_Size"
              >
                <Input
                  {...register("buffer_size")}
                  placeholder="Buffer Size in Nautical miles"
                  type="number"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddPolygon
