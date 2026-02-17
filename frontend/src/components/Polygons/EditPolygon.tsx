import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { type PolygonPublic, PolygonsService } from '@/client';
import useCustomToast from '@/hooks/useCustomToast';
import { handleError } from '@/utils';
import { z } from 'zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Pencil } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingButton } from '../ui/loading-button';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  buffer_size: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditPolygonProps {
  polygon: PolygonPublic;
  onSuccess: () => void;
}

const EditPolygon = ({ polygon, onSuccess }: EditPolygonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: polygon.title,
      buffer_size: polygon.buffer_size ?? undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      PolygonsService.updatePolygon({ id: polygon.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast('Polygon updated successfully.');
      setIsOpen(false);
      onSuccess();
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polygons'] });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Pencil />
        Edit Polygon
      </DropdownMenuItem>
      <DialogContent className='sm:max-w-md'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Polygon</DialogTitle>
              <DialogDescription>Update the polygon</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Title' type='text' {...field} />
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
                    <FormLabel>Buffer Size (Nm)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Buffer_size'
                        type='number'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose>
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

export default EditPolygon;
