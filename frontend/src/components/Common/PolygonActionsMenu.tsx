import { IconButton } from '@chakra-ui/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import type { PolygonPublic } from '@/client';
import DeletePolygon from '../Polygons/DeletePolygon';
import EditPolygon from '../Polygons/EditPolygon';
import { MenuContent, MenuRoot, MenuTrigger } from '../ui/menu';

interface PolygonActionsMenuProps {
  polygon: PolygonPublic;
}

export const PolygonActionsMenu = ({ polygon }: PolygonActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant='ghost' color='inherit'>
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditPolygon polygon={polygon} />
        <DeletePolygon id={polygon.id} />
      </MenuContent>
    </MenuRoot>
  );
};
