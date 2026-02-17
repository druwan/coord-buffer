import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import { type PolygonCreate, PolygonsService } from '@/client';

import useCustomToast from '@/hooks/useCustomToast';
import { handleError } from '@/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LoadingButton } from '../ui/loading-button';

const formSchema = z.object({
  externalPolygon: z.string().min(1, { message: 'Select a polygon' }),
  buffer_size: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

type ExternalPolygon = {
  msid: number;
  nameofarea: string;
  positionindicator?: string;
  geom?: string;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const useExternalPolygons = () => {
  return useQuery({
    queryKey: ['external-polygons'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/v1/aip-polygons/`);
      if (!res.ok) throw new Error('Failed to fetch external polygons');
      return res.json();
    },
  });
};

// Takes an AIP_Polygon as input. We do not create any new polygons.
const AddPolygon = ({
  onPolygonSelect,
}: {
  onPolygonSelect?: (poly: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { data: externalPolygons } = useExternalPolygons();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      externalPolygon: '',
      buffer_size: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PolygonCreate) =>
      PolygonsService.createPolygon({ requestBody: data }),
    onSuccess: (newPoly) => {
      showSuccessToast('Polygon created successfully.');
      onPolygonSelect?.({
        id: newPoly.id,
        title: newPoly.title,
        buffer_size: newPoly.buffer_size,
        positionindicator: newPoly.positionindicator,
        original_geometry: newPoly.original_geometry,
        buffered_geometry: newPoly.buffered_geometry,
      });
      form.reset();
      setIsOpen(false);
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polygons'] });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const selectedPolygon = externalPolygons?.find(
      (p: ExternalPolygon) => p.msid === Number(data.externalPolygon),
    );

    if (!selectedPolygon) return;

    const payload: PolygonCreate = {
      title: selectedPolygon.nameofarea,
      buffer_size: data.buffer_size,
      coordinates: JSON.stringify(selectedPolygon.geom),
      positionindicator: selectedPolygon.positionindicator || '',
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='my-4'>
          <Plus className='mr-2' />
          Add Polygon
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Polygon</DialogTitle>
          <DialogDescription>
            Fill in buffer size of new Polygon
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='externalPolygon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Polygon</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className='w-full max-w-64'>
                          <SelectValue placeholder='Select a TMA' />
                        </SelectTrigger>
                        <SelectContent>
                          {externalPolygons?.map((poly: ExternalPolygon) => (
                            <SelectItem
                              key={poly.msid}
                              value={String(poly.msid)}
                            >
                              {poly.nameofarea} | {poly.positionindicator}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='buffer_size'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Buffer Size <em>(Nm)</em>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Buffer Size (Nm)'
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline' disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type='submit' loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default AddPolygon;
