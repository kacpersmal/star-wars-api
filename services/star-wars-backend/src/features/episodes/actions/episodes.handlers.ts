import { GetEpisodeByIdHandler } from './get-episode-by-id';
import { GetEpisodesHandler } from './get-episodes';
import { CreateEpisodeHandler } from './create-episode';
import { UpdateEpisodeHandler } from './update-episode';
import { DeleteEpisodeHandler } from './delete-episode';

export const episodesHandlers = [
  GetEpisodesHandler,
  GetEpisodeByIdHandler,
  CreateEpisodeHandler,
  UpdateEpisodeHandler,
  DeleteEpisodeHandler,
];
