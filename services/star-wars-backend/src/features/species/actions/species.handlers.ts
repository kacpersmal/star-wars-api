import { GetSpeciesByIdHandler } from './get-species-by-id';
import { GetSpeciesHandler } from './get-species';
import { CreateSpeciesHandler } from './create-species';
import { UpdateSpeciesHandler } from './update-species';
import { DeleteSpeciesHandler } from './delete-species';
import { BulkCreateSpeciesHandler } from './bulk-create-species';

export const speciesHandlers = [
  GetSpeciesHandler,
  GetSpeciesByIdHandler,
  CreateSpeciesHandler,
  UpdateSpeciesHandler,
  DeleteSpeciesHandler,
  BulkCreateSpeciesHandler,
];
