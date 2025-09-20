import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';

import { type PolygonCreate, PolygonsService } from '@/client';
import type { ApiError } from '@/client/core/ApiError';
import useCustomToast from '@/hooks/useCustomToast';
import { handleError } from '@/utils';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from '../ui/dialog';
import { Field } from '../ui/field';

const AddPolygon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PolygonCreate>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      title: '',
      buffer_size: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PolygonCreate) =>
      PolygonsService.createPolygon({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast('Item created successfully.');
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const onSubmit: SubmitHandler<PolygonCreate> = (data) => {
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
        <Button value='add-item' my={4}>
          <FaPlus fontSize='16px' />
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
                invalid={!!errors.title}
                errorText={errors.title?.message}
                label='Title'
              >
                <Input
                  {...register('title', {
                    required: 'Title is required.',
                  })}
                  placeholder='Title'
                  type='text'
                />
              </Field>

              <Field
                invalid={!!errors.buffer_size}
                errorText={errors.buffer_size?.message}
                label='buffer_Size'
              >
                <Input
                  {...register('buffer_size')}
                  placeholder='Buffer Size in Nautical miles'
                  type='number'
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant='subtle'
                colorPalette='gray'
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant='solid'
              type='submit'
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
  );
};

export default AddPolygon;
