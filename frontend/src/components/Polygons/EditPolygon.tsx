import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  type PolygonPublic,
  PolygonsService,
  type PolygonUpdate,
} from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { DropdownMenuItem } from "../ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { LoadingButton } from "../ui/loading-button"

const formSchema = z.object({
  buffer_size: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditPolygonProps {
  polygon: PolygonPublic
  onSuccess: () => void
}

const EditPolygon = ({ polygon, onSuccess }: EditPolygonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      buffer_size: polygon.buffer_size ?? undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: PolygonUpdate = {
        buffer_size: data.buffer_size ?? polygon.buffer_size ?? 0,
      }
      return PolygonsService.updatePolygon({
        id: polygon.id,
        requestBody: payload,
      })
    },
    onSuccess: () => {
      showSuccessToast("Polygon updated successfully.")
      setIsOpen(false)
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["polygons"] })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      buffer_size: data.buffer_size ?? polygon.buffer_size ?? 0,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil />
        Edit Polygon
      </DropdownMenuItem>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Polygon</DialogTitle>
              <DialogDescription>Update the polygon</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="buffer_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buffer Size (Nm)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Buffer_size"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPolygon
