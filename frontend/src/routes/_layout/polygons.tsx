import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

import { PolygonsService } from '@/client';

import PendingPolygons from '@/components/Pending/PendingPolygons';
import AddPolygon from '@/components/Polygons/AddPolygon';
import { columns } from '@/components/Polygons/columns';
import { Search } from 'lucide-react';
import { DataTable } from '@/components/Common/DataTable';

function getPolygonsQueryOptions() {
  return {
    queryFn: () => PolygonsService.readPolygons({ skip: 0, limit: 100 }),
    queryKey: ['polygons'],
  };
}

export const Route = createFileRoute('/_layout/polygons')({
  component: Polygons,
  head: () => ({
    meta: [
      {
        title: 'Polygons',
      },
    ],
  }),
});

function PolygonsTableContent() {
  const { data: polygons } = useSuspenseQuery(getPolygonsQueryOptions());

  if (polygons.data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center text-center py-12'>
        <div className='rounded-full bg-muted p-4 mb-4'>
          <Search className='h-8 w-8 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold'>
          You have no buffered polygons yet
        </h3>
        <p className='text-muted-foreground'>
          Create a new buffer to get started
        </p>
      </div>
    );
  }
  return <DataTable columns={columns} data={polygons.data} />;
}

function PolygonsTable() {
  return (
    <Suspense fallback={<PendingPolygons />}>
      <PolygonsTableContent />
    </Suspense>
  );
}

function Polygons() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Polygons</h1>
          <p className='text-muted-foreground'>
            Create and manage your polygons
          </p>
        </div>
        <AddPolygon />
      </div>
      <PolygonsTable />
    </div>
  );
}
