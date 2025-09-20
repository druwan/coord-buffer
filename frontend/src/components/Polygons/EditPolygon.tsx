import {
  Button,
  ButtonGroup,
  DialogActionTrigger,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FaExchangeAlt } from 'react-icons/fa';

import { type ApiError, type PolygonPublic, PolygonsService } from '@/client';
import useCustomToast from '@/hooks/useCustomToast';
import { handleError } from '@/utils';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Field } from '../ui/field';

interface EditPolygonProps {
  polygon: PolygonPublic;
}

interface PolygonUpdateForm {
  title: string;
  buffer_size?: number;
}

const EditPolygon = ({ polygon }: EditPolygonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PolygonUpdateForm>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      ...polygon,
      buffer_size: polygon.buffer_size ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PolygonUpdateForm) =>
      PolygonsService.updatePolygon({ id: polygon.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast('Polygon updated successfully.');
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polygons'] });
    },
  });

  const onSubmit: SubmitHandler<PolygonUpdateForm> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      size={{ base: 'xs', md: 'md' }}
      placement='center'
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant='ghost'>
          <FaExchangeAlt fontSize='16px' />
          Edit Polygon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Polygon</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the polygon details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.title}
                errorText={errors.title?.message}
                label='Title'
              >
                <Input
                  {...register('title', {
                    required: 'Title is required',
                  })}
                  placeholder='Title'
                  type='text'
                />
              </Field>

              <Field
                invalid={!!errors.buffer_size}
                errorText={errors.buffer_size?.message}
                label='buffer_size'
              >
                <Input
                  {...register('buffer_size')}
                  placeholder='Buffer size in Nautical miles'
                  type='number'
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant='subtle'
                  colorPalette='gray'
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant='solid' type='submit' loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditPolygon;
